import { expect, test, type Page } from '@playwright/test';

const SHOTS = process.env.SHOTS_DIR;

async function signIn(page: Page, theme: 'classic' | 'deccan' = 'classic') {
  await page.addInitScript((t) => {
    localStorage.setItem('pe_onboarded', '1');
    localStorage.setItem('pe_theme', JSON.stringify({ state: { theme: t }, version: 0 }));
  }, theme);
  const email = `discover-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  const res = await page.request.post('/api/v1/auth/register', {
    data: { name: 'Sourav Suman', email, password: 'Discover-1234', acceptTerms: true, theme },
  });
  expect(res.status()).toBe(201);
}

const shot = async (page: Page, name: string) => {
  if (!SHOTS) return;
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

for (const theme of ['classic', 'deccan'] as const) {
  test(`discover flow works (${theme})`, async ({ page }) => {
    await signIn(page, theme);

    // Home shows the user and a call to plan
    await page.goto('/');
    await expect(page.getByText('नमस्कार, Sourav')).toBeVisible();
    await expect(page.getByText('Plan your day')).toBeVisible();
    await shot(page, `${theme}-home`);

    // Explore lists real places; chips filter
    await page.goto('/explore');
    await page.getByRole('button', { name: 'Forts', exact: true }).click();
    await expect(page.getByText('Sinhagad Fort')).toBeVisible();
    await shot(page, `${theme}-explore-forts`);

    // + adds to plan with a toast, ✓ removes
    await page.getByRole('button', { name: 'Add Sinhagad Fort to plan' }).click();
    await expect(page.getByRole('status')).toContainText('Sinhagad Fort added to');
    await expect(page.getByRole('button', { name: 'Remove Sinhagad Fort from plan' })).toBeVisible();

    // Search
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByLabel('Search places').fill('shaniwar');
    await expect(page.getByText('Shaniwar Wada')).toBeVisible();

    // Filters sheet shows a live count
    await page.getByLabel('Search places').fill('');
    await page.getByRole('link', { name: 'Filters' }).click();
    await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    const show = page.getByRole('link', { name: /Show \d+ places/ });
    const before = await show.textContent();
    await page.getByRole('button', { name: 'Free entry' }).click();
    await expect(show).not.toHaveText(before!);
    await shot(page, `${theme}-filters`);
    await page.getByRole('button', { name: 'Reset' }).click();

    // Place detail: real data, save toggles with a toast
    await page.goto('/explore');
    await page.getByText('Shaniwar Wada').first().click();
    await expect(page).toHaveURL(/\/place\/\d+/);
    await expect(page.getByText('शनिवार वाडा')).toBeVisible();
    await expect(page.getByText('8:00 AM - 6:30 PM')).toBeVisible();
    await page.getByRole('button', { name: 'Save place' }).click();
    await expect(page.getByRole('status')).toContainText('Saved to your places');
    await expect(page.getByRole('button', { name: 'Remove from saved' })).toBeVisible();
    await shot(page, `${theme}-place`);

    // Home now shows the next stop from the plan
    await page.goto('/');
    await expect(page.getByText('Sinhagad Fort')).toBeVisible();
  });
}

test('guests are sent to log in when they try to save', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pe_onboarded', '1'));
  await page.goto('/explore');
  await page.getByRole('button', { name: /^Add .* to plan$/ }).first().click();
  await expect(page).toHaveURL(/\/login\?next=%2Fexplore/);
});
