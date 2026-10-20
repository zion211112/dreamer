/**
 * Records the already-applied local migrations in supabase_migrations.schema_migrations.
 *
 * The live database already has every object these files define, but the history table
 * only holds a leftover probe row, so `supabase db push` would try to re-apply all six
 * migrations and fail on the first one. This script writes the six history rows using
 * the same version/name/statements shape the Supabase CLI writes, so `db push`, `db diff`
 * and `db pull` treat the remote as fully caught up.
 *
 * Requires scripts/.build/sql-split.js (tsc scripts/sql-split.ts).
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { splitAndTrim, splitSql } = require('./.build/sql-split.js');

const REF = 'ocqrbtdwgkvuptgwlyev';
// Never hand-type a JWT: read the service role key from the environment, or from the
// temp apply script that already holds this project's key.
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? readServiceRoleKey();

function readServiceRoleKey() {
  const legacy = readFileSync(path.resolve('.tmp-apply-rest.mjs'), 'utf8');
  const match = /const KEY='([^']+)'/.exec(legacy);
  if (!match) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set and not found in .tmp-apply-rest.mjs');
  return match[1];
}
const MIGRATIONS_DIR = path.resolve('supabase/migrations');
const CREATE_BY = 'aptlabske@gmail.com';
const MIGRATE_FILE_PATTERN = /^([0-9]+)_(.*)\.sql$/u;

async function exec(sql) {
  const r = await fetch(`https://${REF}.supabase.co/rest/v1/rpc/dreamer_exec_b64`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload: Buffer.from(sql, 'utf8').toString('base64') }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${r.status}: ${t.slice(0, 600)}`);
  return t;
}

const esc = (s) => s.replace(/'/g, "''");

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const matches = MIGRATE_FILE_PATTERN.exec(file);
  if (!matches) throw new Error(`Unexpected migration file name: ${file}`);
  const [, version, name] = matches;

  const content = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
  const statements = splitAndTrim(content);

  // The raw tokens must partition the file byte-for-byte, otherwise the stored
  // statements would not describe what was actually applied.
  const raw = splitSql(content);
  if (raw.join('') !== content) throw new Error(`Split does not round-trip: ${file}`);

  const values = statements.map((s) => `'${esc(s)}'`).join(',\n    ');
  const sql = [
    'insert into supabase_migrations.schema_migrations (version, name, statements, created_by)',
    `values ('${version}', '${name}', array[\n    ${values}\n  ], '${CREATE_BY}')`,
    'on conflict (version) do update set name = excluded.name, statements = excluded.statements;',
  ].join('\n');

  process.stdout.write(`${file} -> version=${version} name=${name} stmts=${statements.length} ... `);
  await exec(sql);
  console.log('ok');
}

// The probe row predates the local migrations and is not one of them; the CLI refuses
// to push while a remote version has no local file (ErrMissingLocal).
await exec(
  "delete from supabase_migrations.schema_migrations where version = '20261019233941';",
);
console.log('probe row removed');
