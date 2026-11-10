import { execSync } from 'child_process';
import path from 'path';
import { testDatabaseUrl } from './db-url';

/** Create/migrate the test database before any test runs (migrate deploy creates it if missing). */
export default function setup() {
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
  });
}
