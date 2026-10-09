import { defineConfig } from 'vitest/config';
import { testDatabaseUrl } from './test/db-url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    env: { NODE_ENV: 'test', DATABASE_URL: testDatabaseUrl(), SMS_PROVIDER: 'console' },
    globalSetup: ['./test/global-setup.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
