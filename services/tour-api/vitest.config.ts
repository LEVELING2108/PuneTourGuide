import { defineConfig } from 'vitest/config';
import { testDatabaseUrl } from './test/db-url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    // Tests never reach real providers, whatever keys are in .env: texts and emails stay in console mode
    env: { NODE_ENV: 'test', DATABASE_URL: testDatabaseUrl(), SMS_PROVIDER: 'console', EMAIL_API_KEY: '' },
    globalSetup: ['./test/global-setup.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
