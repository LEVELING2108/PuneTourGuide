import { expect, test, type Page } from '@playwright/test';

const SHOTS = process.env.SHOTS_DIR;
const HERE = { latitude: 18.5195, longitude: 73.8553 };

test.use({ geolocation: HERE, permissions: ['geolocation'] });

const shot = async (page: Page, name: string) => {
  if (!SHOTS) return;
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

async function setup(page: Page, theme: 'classic' | 'deccan', signIn = true) {
  await page.addInitScript(
    ({ t, here }) => {
      localStorage.setItem('pe_onboarded', '1');
      localStorage.setItem('pe_theme', JSON.stringify({ state: { theme: t }, version: 0 }));
      localStorage.setItem('pe_perm', JSON.stringify({ state: { location: true, motion: true }, version: 0 }));
      localStorage.setItem('pe_last_pos', JSON.stringify({ lat: here.latitude, lng: here.longitude, at: Date.now() }));
    },
    { t: theme, here: HERE }
  );
  if (!signIn) return;
  const email = `sos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  const res = await page.request.post('/api/v1/auth/register', {
    data: { name: 'Sourav Suman', email, password: 'Sos-safety-1234', acceptTerms: true, theme },
  });
  expect(res.status()).toBe(201);
}

for (const theme of ['classic', 'deccan'] as const) {
  test(`contacts, SOS with live tracking, and trip sharing (${theme})`, async ({ page, browser }) => {
    await setup(page, theme);

    // Contacts: empty → add → listed as primary → test alert
    await page.goto('/settings/contacts');
    await expect(page.getByText('No contacts yet.')).toBeVisible();
    await expect(page.getByText('0 of 5')).toBeVisible();
    await page.getByRole('link', { name: 'Add a contact' }).click();
    await page.getByLabel('Name').fill('Aai');
    await page.getByRole('radio', { name: 'Parent' }).click();
    await page.getByLabel('Mobile number').fill('98765 43210');
    await page.getByRole('button', { name: 'Add contact' }).click();
    await expect(page).toHaveURL(/\/settings\/contacts$/);
    await expect(page.getByText('Aai', { exact: true })).toBeVisible();
    await expect(page.getByText('PRIMARY')).toBeVisible();
    await expect(page.getByText('Parent · +91 ••••• •3210')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Call Aai' })).toHaveAttribute('href', 'tel:+919876543210');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Test alert sent to Aai');
    await shot(page, `${theme}-contacts`);

    // SOS: countdown → 112 + live location + alert
    await page.goto('/sos');
    await expect(page.getByText('Live location going to')).toBeVisible();
    await expect(page.getByText('Calling 112 in')).toBeVisible();
    await shot(page, `${theme}-sos-countdown`);
    await expect(page.getByText('alerted with your live location')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('LIVE LOCATION ON')).toBeVisible();
    await expect(page.getByText(/Nearest trauma care:/)).toBeVisible();
    await shot(page, `${theme}-sos-active`);

    // A contact opens the texted link: read-only live map
    const active = await page.evaluate(() => JSON.parse(sessionStorage.getItem('pe_sos_active') ?? 'null'));
    expect(active?.session?.session_id).toMatch(/^[0-9a-f-]{36}$/);
    const contact = await browser.newPage();
    await contact.goto(`/track/${active.session.session_id}`);
    await expect(contact.getByRole('heading', { name: 'Live location' })).toBeVisible({ timeout: 15_000 });
    await expect(contact.getByText('● LIVE')).toBeVisible();
    await expect(contact.getByText(/Nearest hospital to them:/)).toBeVisible({ timeout: 15_000 });
    if (SHOTS) await contact.screenshot({ path: `${SHOTS}/${theme}-track-live.png` });

    // I'm safe: SOS closes, the contact sees it ended
    await page.getByRole('link', { name: "I'm safe, cancel" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(contact.getByRole('heading', { name: 'Sharing has ended' })).toBeVisible({ timeout: 15_000 });
    await contact.close();

    // Plan → Share live trip
    await page.goto('/plan');
    await page.getByRole('button', { name: 'Share live trip' }).click();
    await expect(page.getByRole('status')).toContainText('Live trip shared with Aai', { timeout: 15_000 });
    await expect(page.getByText('Aai can follow your route')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share live trip' })).toHaveAttribute('aria-pressed', 'true');
    // Moving around the app keeps sharing on (a full reload ends it: that page can no longer publish)
    await page.getByRole('link', { name: 'Map' }).click();
    await expect(page).toHaveURL(/\/map/);
    await page.getByRole('link', { name: 'Plan' }).click();
    await expect(page.getByText('Aai can follow your route')).toBeVisible();
    await page.getByRole('button', { name: 'Share live trip' }).click();
    await expect(page.getByRole('status')).toContainText('Stopped sharing your location');
  });
}

test('guest SOS: shake kicker, cancel before zero sends nothing', async ({ page }) => {
  await setup(page, 'classic', false);
  await page.goto('/');
  await page.goto('/sos?via=shake');
  await expect(page.getByText('SHAKE DETECTED')).toBeVisible();
  await expect(page.getByText('No emergency contacts saved')).toBeVisible();
  await page.getByRole('link', { name: "I'm safe, cancel" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => sessionStorage.getItem('pe_sos_active'))).toBeNull();
});

test('guest SOS still dials and records the event', async ({ page }) => {
  await setup(page, 'deccan', false);
  await page.goto('/sos');
  await expect(page.getByText('112 is being called')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('LIVE LOCATION ON')).toBeVisible();
});

test('an invalid tracking link says so', async ({ page }) => {
  await page.goto('/track/00000000-0000-4000-8000-000000000000');
  await expect(page.getByRole('heading', { name: 'Link not valid' })).toBeVisible({ timeout: 15_000 });
});
