import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Android app = this web build inside Capacitor (TECH_DESIGN §10, "Android build").
 * Build: npm run android:build -w apps/web  (uses .env.android for the API address).
 *
 * appId is the Play Store package name: it can never change after the first Play upload.
 */
const config: CapacitorConfig = {
  appId: 'com.puneexplorer.app',
  appName: 'Pune Explorer',
  webDir: 'dist',
  android: {
    // Plain-HTTP API only for a local test build against your own computer (never for release)
    allowMixedContent: process.env.CAP_LOCAL_HTTP === 'true',
  },
  server: {
    androidScheme: 'https',
    cleartext: process.env.CAP_LOCAL_HTTP === 'true',
  },
};

export default config;
