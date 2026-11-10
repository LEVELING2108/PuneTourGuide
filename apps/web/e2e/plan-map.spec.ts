import { expect, test, type Page } from '@playwright/test';

const SHOTS = process.env.SHOTS_DIR;
// Standing outside Shaniwar Wada
const HERE = { latitude: 18.5195, longitude: 73.8553 };

test.use({ geolocation: HERE, permissions: ['geolocation'] });

async function signIn(page: Page, theme: 'classic' | 'deccan') {
  await page.addInitScript(
    ({ t, here }) => {
      localStorage.setItem('pe_onboarded', '1');
      localStorage.setItem('pe_theme', JSON.stringify({ state: { theme: t }, version: 0 }));
      localStorage.setItem('pe_perm', JSON.stringify({ state: { location: true, motion: true }, version: 0 }));
      localStorage.setItem('pe_last_pos', JSON.stringify({ lat: here.latitude, lng: here.longitude, at: Date.now() }));
    },
    { t: theme, here: HERE }
  );
  const email = `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  const res = await page.request.post('/api/v1/auth/register', {
    data: { name: 'Sourav Suman', email, password: 'Plan-map-1234', acceptTerms: true, theme },
  });
  expect(res.status()).toBe(201);
  return (await res.json()).data.accessToken as string;
}

const placeId = async (page: Page, q: string) => {
  const r = await page.request.get(`/api/v1/places?q=${encodeURIComponent(q)}&limit=1`);
  return (await r.json()).data[0].id as number;
};

const shot = async (page: Page, name: string) => {
  if (!SHOTS) return;
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

for (const theme of ['classic', 'deccan'] as const) {
  test(`plan, optimise, map and directions (${theme})`, async ({ page }) => {
    const token = await signIn(page, theme);
    // A deliberately poor order: the far fort sits between two old-city stops.
    for (const q of ['Shaniwar Wada', 'Sinhagad Fort', 'Lal Mahal', 'Kasba Ganpati']) {
      const add = await page.request.post('/api/v1/itinerary/stops', { data: { placeId: await placeId(page, q) }, headers: { Authorization: `Bearer ${token}` } });
      expect(add.status()).toBe(201);
    }

    // Plan: real stops, tick → stamp, Optimise
    await page.goto('/plan');
    await expect(page.getByText('Sinhagad Fort')).toBeVisible();
    await page.getByRole('button', { name: 'Mark Shaniwar Wada visited' }).click();
    await expect(page.getByRole('status')).toContainText('Stamp collected');
    await expect(page.getByRole('button', { name: 'Mark Shaniwar Wada not visited' })).toBeVisible();
    await page.getByRole('button', { name: 'Optimise' }).click();
    await expect(page.getByRole('status')).toContainText(/Reordered · saves about \d+ min|Already the best order/, { timeout: 20_000 });
    await shot(page, `${theme}-plan`);

    // Map: help nearby from real data, then places and my route
    await page.goto('/map');
    await expect(page.getByRole('heading', { name: 'Help near you' })).toBeVisible();
    await expect(page.locator('.pe-map .leaflet-tile-loaded').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('link', { name: /^(Call|Directions to) / }).first()).toBeVisible({ timeout: 20_000 });
    await shot(page, `${theme}-map-help`);

    await page.getByRole('button', { name: 'Places', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Places near you' })).toBeVisible();
    await expect(page.getByText(/\d+ within 5 km/)).toBeVisible();
    await shot(page, `${theme}-map-places`);

    await page.getByRole('button', { name: 'My route' }).click();
    await expect(page.getByRole('heading', { name: "Today's route" })).toBeVisible();
    await expect(page.getByText(/^NEXT · /)).toBeVisible();
    await expect(page.locator('.pe-map path.leaflet-interactive, .pe-map svg path').first()).toBeVisible({ timeout: 20_000 });
    await shot(page, `${theme}-map-route`);

    // Directions to the next stop
    await page.getByRole('link', { name: 'Start directions' }).click();
    await expect(page).toHaveURL(/\/directions\?to=\d+/);
    await expect(page.getByText(/arrive/)).toBeVisible({ timeout: 20_000 });
    await shot(page, `${theme}-directions-walk`);
    await page.getByRole('button', { name: 'Auto' }).click();
    await expect(page.getByText(/by road/)).toBeVisible({ timeout: 20_000 });
    await shot(page, `${theme}-directions-auto`);
    await page.getByRole('link', { name: 'End directions' }).click();
    await expect(page).toHaveURL(/\/plan$/);
  });
}

test('help nearby works logged out', async ({ page }) => {
  await page.addInitScript((here) => {
    localStorage.setItem('pe_onboarded', '1');
    localStorage.setItem('pe_last_pos', JSON.stringify({ lat: here.latitude, lng: here.longitude, at: Date.now() }));
  }, HERE);
  await page.goto('/map?layer=help');
  await expect(page.getByRole('heading', { name: 'Help near you' })).toBeVisible();
  await expect(page.getByRole('link', { name: /^(Call|Directions to) / }).first()).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: 'My route' }).click();
  await expect(page.getByText('Log in to see your plan on the map.')).toBeVisible();
});
