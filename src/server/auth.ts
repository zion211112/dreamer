import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from './db/client';
import { account, aptPersons, session, user, verification } from './db/schema';

const authSecret = process.env['BETTER_AUTH_SECRET'];
const baseURL = process.env['BETTER_AUTH_URL'];
if (!authSecret || authSecret.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be configured with at least 32 characters.');
}
if (!baseURL) throw new Error('BETTER_AUTH_URL is required; configure the same-origin auth server URL.');

export const auth = betterAuth({
  appName: 'APT-LABS',
  baseURL,
  basePath: '/api/auth',
  secret: authSecret,
  database: drizzleAdapter(db, { provider: 'pg', schema: { user, session, account, verification } }),
  emailAndPassword: { enabled: true, requireEmailVerification: false, autoSignIn: false },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async () => {
      throw new Error('Email delivery is not configured; refusing to issue a misleading verification flow.');
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 12, cookieCache: { enabled: false } },
  trustedOrigins: [baseURL],
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          await db.insert(aptPersons).values({
            authUserId: createdUser.id,
            displayName: createdUser.name,
          });
        },
      },
    },
  },
});
