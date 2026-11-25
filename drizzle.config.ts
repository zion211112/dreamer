import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env['DATABASE_URL']) {
  throw new Error('DATABASE_URL is required to generate or apply database migrations.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/db/schema.ts',
  out: './src/server/db/migrations',
  dbCredentials: { url: process.env['DATABASE_URL'] },
  strict: true,
  verbose: true,
});
