/** Simulates the Supabase CLI's FindPendingMigrations against the live ledger. */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const REF = 'ocqrbtdwgkvuptgwlyev';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  ?? /const KEY='([^']+)'/.exec(readFileSync(path.resolve('.tmp-apply-rest.mjs'), 'utf8'))[1];

const res = await fetch(`https://${REF}.supabase.co/rest/v1/rpc/dreamer_ledger_rows`, {
  method: 'POST',
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: '{}',
});
const remote = (await res.json()).map((r) => r.version);
remote.sort();

const local = readdirSync(path.resolve('supabase/migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => /^([0-9]+)_/.exec(f)[1]);

// Port of pkg/migration/apply.go FindPendingMigrations.
const unapplied = [];
const missing = [];
let i = 0;
let j = 0;
while (i < remote.length && j < local.length) {
  if (remote[i] === local[j]) { i++; j++; }
  else if (remote[i] < local[j]) { missing.push(remote[i++]); }
  else { unapplied.push(local[j++]); }
}
if (j === local.length) missing.push(...remote.slice(i));
if (local.length > remote.length) unapplied.push(...local.slice(remote.length));

console.log('remote:', remote.join(', '));
console.log('local :', local.join(', '));
console.log('pending (would be applied):', unapplied.length, unapplied);
console.log('missing (remote w/o local file):', missing.length, missing);

if (missing.length > 0) console.log('\nRESULT: db push would FAIL (ErrMissingLocal)');
else if (unapplied.length > 0) console.log('\nRESULT: db push would re-apply pending migrations');
else console.log('\nRESULT: db push is a no-op — remote is fully caught up');
