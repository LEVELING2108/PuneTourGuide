import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Accessibility: every screen, both themes, scanned with axe-core against WCAG 2.1 A/AA.
 * Leaflet's own map pane (third-party tiles) is excluded; our controls on top of it are scanned.
 */
const HERE = { latitude: 18.5195, longitude: 73.8553 };
test.use({ geolocation: HERE, permissions: ['geolocation'] });
test.describe.configure({ timeout: 180_000 });

const PUBLIC = ['/welcome', '/intro', '/permissions', '/login', '/signup', '/forgot', '/', '/explore', '/explore/filters', '/map', '/sos'];
const SIGNED_IN = ['/', '/plan', '/profile', '/settings', '/settings/profile', '/settings/contacts', '/settings/contacts/new', '/settings/medical', '/settings/offline', '/settings/language', '/settings/theme', '/settings/sign-out', '/almost-there', '/first-contact'];

async function prep(page: Page, theme: 'classic' | 'deccan') {
  await page.addInitScript(
    ({ t, here }) => {
      localStorage.setItem('pe_onboarded', '1');
      localStorage.setItem('pe_theme', JSON.stringify({ state: { theme: t }, version: 0 }));
      localStorage.setItem('pe_perm', JSON.stringify({ state: { location: true, motion: true }, version: 0 }));
      localStorage.setItem('pe_last_pos', JSON.stringify({ lat: here.latitude, lng: here.longitude, at: Date.now() }));
    },
    { t: theme, here: HERE }
  );
}

async function scan(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.waitForTimeout(600);
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('.leaflet-pane')
    .analyze();
  return r.violations.map((v) => `${path} · ${v.id} (${v.impact}) × ${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => `${n.target.join(' ')} — ${n.any[0]?.message ?? n.failureSummary}`).join(' | ')}`);
}

for (const theme of ['classic', 'deccan'] as const) {
  test(`every screen passes WCAG 2.1 AA checks (${theme})`, async ({ page }) => {
    await prep(page, theme);
    const found: string[] = [];
    for (const path of PUBLIC) found.push(...(await scan(page, path)));

    const place = await page.request.get('/api/v1/places?limit=1');
    const placeId = (await place.json()).data?.[0]?.id;
    if (placeId) found.push(...(await scan(page, `/place/${placeId}`)));

    const email = `a11y-${Date.now()}-${theme}@example.com`;
    const res = await page.request.post('/api/v1/auth/register', {
      data: { name: 'Asha Patil', email, password: 'A11y-check-1234', acceptTerms: true, theme },
    });
    expect(res.status()).toBe(201);
    for (const path of SIGNED_IN) found.push(...(await scan(page, path)));

    if (found.length) console.log(`\n[a11y ${theme}]\n${found.join('\n')}`);
    expect(found).toEqual([]);
  });
}
