import express, { type ErrorRequestHandler } from 'express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { auth } from './auth';
import { db } from './db/client';
import { aptPersons, opportunities, organizationMemberships, organizations } from './db/schema';
import { withOrganizationAuthorization } from './authorization';
import { createBenbenosRouter } from './benbenos/router';

const app = express();
app.disable('x-powered-by');
app.all('/api/auth/*splat', toNodeHandler(auth));
// Benben-OS accepts marked answer sheets, so its body limit is larger than the identity API's.
app.use('/api/benbenos', express.json({ limit: '256kb' }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/organizations', (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  const configuredOrigin = process.env['BETTER_AUTH_URL'];
  if (!origin || !configuredOrigin || new URL(origin).origin !== new URL(configuredOrigin).origin) {
    return res.status(403).json({ error: 'origin_forbidden' });
  }
  return next();
});

app.get('/api/health', async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    return res.json({ status: 'ok', database: 'connected' });
  } catch {
    return res.status(503).json({ status: 'unavailable', database: 'unavailable' });
  }
});

app.get('/api/me/organizations', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const rows = await db.select({
    id: organizations.id,
    name: organizations.name,
    standing: organizations.standing,
    role: organizationMemberships.role,
  }).from(organizationMemberships)
    .innerJoin(aptPersons, eq(aptPersons.id, organizationMemberships.personId))
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(and(eq(aptPersons.authUserId, session.user.id), isNull(organizationMemberships.revokedAt)));
  return res.json({ data: rows });
});

app.post('/api/organizations', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { name } = req.body as { name?: unknown };
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 200) {
    return res.status(400).json({ error: 'invalid_organization_name' });
  }

  const created = await db.transaction(async (tx) => {
    const [person] = await tx.select({ id: aptPersons.id }).from(aptPersons)
      .where(eq(aptPersons.authUserId, session.user.id)).limit(1);
    if (!person) return null;
    const [organization] = await tx.insert(organizations).values({
      name: name.trim(),
      createdByPersonId: person.id,
    }).returning();
    await tx.insert(organizationMemberships).values({
      organizationId: organization.id,
      personId: person.id,
      role: 'owner',
      grantedByPersonId: person.id,
    });
    return organization;
  });
  if (!created) return res.status(403).json({ error: 'person_identity_missing' });
  return res.status(201).json({ data: created });
});

app.get('/api/organizations/:organizationId/opportunities', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'organization:read', async (tx, membership) =>
    tx.select().from(opportunities)
      .where(eq(opportunities.organizationId, membership.organizationId))
      .orderBy(desc(opportunities.createdAt)),
  );
  if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
  return res.json({ data: result.value });
});

app.post('/api/organizations/:organizationId/opportunities', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { title, scope } = req.body as { title?: unknown; scope?: unknown };
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 200 || typeof scope !== 'string' || !scope.trim() || scope.length > 10_000) {
    return res.status(400).json({ error: 'invalid_opportunity' });
  }

  const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'opportunity:publish', async (tx, membership) => {
    const [created] = await tx.insert(opportunities).values({
      organizationId: membership.organizationId,
      createdByPersonId: membership.personId,
      title: title.trim(),
      scope: scope.trim(),
    }).returning();
    return created;
  });
  if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
  return res.status(201).json({ data: result.value });
});

app.use('/api/benbenos', createBenbenosRouter({
  db,
  identify: async (req) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return null;
    return { authUserId: session.user.id, email: session.user.email, name: session.user.name };
  },
}));

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('Request failed', error instanceof Error ? error.message : 'unknown error');
  return res.status(500).json({ error: 'internal_error' });
};
app.use(errorHandler);

const port = Number(process.env['PORT'] ?? 3000);
app.listen(port, '127.0.0.1', () => console.log(`APT-LABS identity server listening on 127.0.0.1:${port}`));
