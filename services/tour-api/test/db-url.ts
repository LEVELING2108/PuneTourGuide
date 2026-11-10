import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/** Tests run against a separate database: TEST_DATABASE_URL, CI's DATABASE_URL, or the dev name + "_test". */
export function testDatabaseUrl() {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const url = new URL(process.env.DATABASE_URL ?? 'postgresql://postgres:password@localhost:5432/pune_explorer');
  if (process.env.CI) return url.toString();
  url.pathname = `${url.pathname.replace(/\/$/, '')}_test`;
  return url.toString();
}
