/**
 * Reads the migration ledger back and asserts it matches the local migration files
 * exactly: same versions in the same order, same CLI-derived names, and identical
 * statement arrays (compared against a fresh splitAndTrim of each file).
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { splitAndTrim } = require('./.build/sql-split.js');

const REF = 'ocqrbtdwgkvuptgwlyev';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  ?? /const KEY='([^']+)'/.exec(readFileSync(path.resolve('.tmp-apply-rest.mjs'), 'utf8'))[1];
const MIGRATIONS_DIR = path.resolve('supabase/migrations');
const PATTERN = /^([0-9]+)_(.*)\.sql$/u;

const res = await fetch(`https://${REF}.supabase.co/rest/v1/rpc/dreamer_ledger_rows`, {
  method: 'POST',
  headers: {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  },
  body: '{}',
});

let rows = await res.json();
if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(rows).slice(0, 400)}`);
if (!Array.isArray(rows)) rows = [rows];
rows.sort((a, b) => (a.version < b.version ? -1 : 1));

const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`  FAIL ${msg}`);
};

console.log(`ledger rows: ${rows.length}, local files: ${files.length}`);
if (rows.length !== files.length) fail(`row count ${rows.length} != file count ${files.length}`);

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const m = PATTERN.exec(file);
  const expectedVersion = m[1];
  const expectedName = m[2];
  const expected = splitAndTrim(readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
  const row = rows[i];

  if (!row) {
    fail(`${file}: no ledger row at index ${i}`);
    continue;
  }
  if (row.version !== expectedVersion) fail(`${file}: version ${row.version} != ${expectedVersion}`);
  if (row.name !== expectedName) fail(`${file}: name ${JSON.stringify(row.name)} != ${JSON.stringify(expectedName)}`);

  const got = row.statements ?? [];
  if (got.length !== expected.length) {
    fail(`${file}: statements ${got.length} != expected ${expected.length}`);
    continue;
  }
  for (let j = 0; j < expected.length; j++) {
    if (got[j] !== expected[j]) {
      fail(`${file}: statement ${j} differs\n    got: ${JSON.stringify(got[j]?.slice(0, 160))}\n    exp: ${JSON.stringify(expected[j].slice(0, 160))}`);
      break;
    }
  }
  console.log(`ok ${file} -> ${row.version}/${row.name} (${expected.length} statements)`);
}

// Every remote version must have a local file, or the CLI aborts with ErrMissingLocal.
const localVersions = new Set(files.map((f) => PATTERN.exec(f)[1]));
for (const row of rows) {
  if (!localVersions.has(row.version)) fail(`remote version ${row.version} (${row.name}) has no local file`);
}

console.log(failures === 0 ? '\nLEDGER IN SYNC' : `\n${failures} FAILURE(S)`);
if (failures > 0) process.exit(1);
