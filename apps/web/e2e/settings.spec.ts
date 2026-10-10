import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const SHOTS = process.env.SHOTS_DIR;
const HERE = { latitude: 18.5195, longitude: 73.8553 };
test.use({ geolocation: HERE, permissions: ['geolocation'] });

const shot = async (page: Page, name: string) => {
  if (!SHOTS) return;
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

async function setup(page: Page, theme: 'classic' | 'deccan') {
  await page.addInitScript(
    ({ t, here }) => {
      localStorage.setItem('pe_onboarded', '1');
      localStorage.setItem('pe_theme', JSON.stringify({ state: { theme: t }, version: 0 }));
      localStorage.setItem('pe_perm', JSON.stringify({ state: { location: true, motion: true }, version: 0 }));
      localStorage.setItem('pe_last_pos', JSON.stringify({ lat: here.latitude, lng: here.longitude, at: Date.now() }));
    },
    { t: theme, here: HERE }
  );
  const email = `settings-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  const res = await page.request.post('/api/v1/auth/register', {
    data: { name: 'Sourav Suman', email, password: 'Settings-1234', acceptTerms: true, theme },
  });
  expect(res.status()).toBe(201);
  return (await res.json()).data.accessToken as string;
}

for (const theme of ['classic', 'deccan'] as const) {
  test(`profile, medical, offline packs, theme and language (${theme})`, async ({ page }) => {
    const token = await setup(page, theme);
    const authed = { headers: { Authorization: `Bearer ${token}` } };

    // Earn a stamp so the passport / level card have real data
    const wada = (await (await page.request.get('/api/v1/places?q=shaniwar&limit=1')).json()).data[0];
    const stop = await page.request.post('/api/v1/itinerary/stops', { data: { placeId: wada.id }, ...authed });
    await page.request.patch(`/api/v1/itinerary/stops/${(await stop.json()).data.stop.id}`, { data: { done: true }, ...authed });

    // Medical: encrypted on the server, back on reload
    await page.goto('/settings/medical');
    await page.getByRole('button', { name: 'B+', exact: true }).click();
    await page.getByLabel('Allergies').fill('Penicillin');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Saved · encrypted');
    await page.reload();
    await expect(page.getByLabel('Allergies')).toHaveValue('Penicillin');
    await shot(page, `${theme}-medical`);

    // Edit profile: name + photo (re-encoded by the server)
    await page.goto('/settings/profile');
    await expect(page.getByLabel('Full name')).toHaveValue('Sourav Suman');
    const photo = join(tmpdir(), `avatar-${theme}.jpg`);
    writeFileSync(photo, await sharp({ create: { width: 900, height: 900, channels: 3, background: { r: 164, g: 70, b: 43 } } }).jpeg().toBuffer());
    await page.locator('input[type=file]').nth(1).setInputFiles(photo);
    await expect(page.getByRole('img', { name: 'Your profile photo' })).toBeVisible({ timeout: 15_000 });
    await page.getByLabel('Full name').fill('Sourav S');
    await page.getByRole('button', { name: 'Heritage' }).click();
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page).toHaveURL(/\/profile$/);

    // Profile / passport shows real data
    if (theme === 'classic') {
      await expect(page.getByRole('heading', { name: 'Sourav S' })).toBeVisible();
      await expect(page.getByText('40 XP', { exact: true })).toBeVisible();
      await expect(page.getByText(/^Blood group B\+ · shared only during an SOS$/)).toBeVisible();
    } else {
      await expect(page.getByText('Sourav S', { exact: true })).toBeVisible();
      await expect(page.getByText(/^1 of \d+$/)).toBeVisible();
      await expect(page.getByTitle(/^Shaniwar Wada ·/)).toBeVisible();
    }
    await shot(page, `${theme}-profile`);

    // Offline packs: download a real area, remove, undo
    await page.goto('/settings/offline');
    await expect(page.getByText('SUGGESTED FOR YOUR TRIPS')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Download Old Pune peths' }).click();
    await expect(page.getByRole('button', { name: 'Delete Old Pune peths pack' })).toBeVisible({ timeout: 20_000 });
    await shot(page, `${theme}-offline`);
    await page.getByRole('button', { name: 'Delete Old Pune peths pack' }).click();
    await expect(page.getByText("Old Pune peths removed · it's in your plan and has weak signal").or(page.getByText(/Old Pune peths removed · .* freed/))).toBeVisible();
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByRole('button', { name: 'Delete Old Pune peths pack' })).toBeVisible();
    const saved = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const r = indexedDB.open('pe-offline', 1);
          r.onsuccess = () => {
            const q = r.result.transaction('packs').objectStore('packs').getAll();
            q.onsuccess = () => resolve(q.result.length);
          };
        })
    );
    expect(saved).toBe(1);

    // Theme syncs to the account
    await page.goto('/settings/theme');
    const other = theme === 'classic' ? 'Deccan' : 'Classic';
    await page.getByRole('radio', { name: new RegExp(other) }).click();
    await page.getByRole('link', { name: /Apply|Use/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', other.toLowerCase());
    await expect
      .poll(async () => (await (await page.request.get('/api/v1/users/me', authed)).json()).data.theme)
      .toBe(other.toLowerCase());

    // Language: SOS speaks Marathi, saved to the account
    await page.goto('/settings/language');
    await page.getByRole('radio', { name: /मराठी/ }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'mr');
    await expect
      .poll(async () => (await (await page.request.get('/api/v1/users/me', authed)).json()).data.language)
      .toBe('mr');
    await page.goto('/sos');
    await expect(page.getByText('112 ला कॉल होतोय')).toBeVisible();
    await expect(page.getByRole('link', { name: 'मी सुरक्षित आहे, रद्द करा' })).toBeVisible();
    await shot(page, `${theme}-sos-marathi`);
    await page.getByRole('link', { name: 'मी सुरक्षित आहे, रद्द करा' }).click();
  });
}

test('signing out clears the account data from memory', async ({ page }) => {
  const token = await setup(page, 'classic');
  await page.request.post('/api/v1/contacts', { data: { name: 'Aai', relation: 'Parent', phone: '9876543210' }, headers: { Authorization: `Bearer ${token}` } });
  await page.goto('/settings/contacts');
  await expect(page.getByText('Aai', { exact: true })).toBeVisible();
  await page.goto('/settings/sign-out');
  await page.getByRole('link', { name: /Sign out/ }).last().click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Guest traveller' })).toBeVisible();
  // SOS still knows who to text offline (device copy is kept on purpose)
  expect(await page.evaluate(() => localStorage.getItem('pe_sos_contacts'))).toContain('Aai');
});
