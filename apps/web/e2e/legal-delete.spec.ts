import { expect, test } from '@playwright/test';

test('sign-up links to the Terms and the Privacy Policy', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pe_onboarded', '1'));
  await page.goto('/signup');
  await page.getByRole('link', { name: 'Terms' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole('heading', { name: 'Terms of Use' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pune Explorer is not an emergency service' })).toBeVisible();
  await page.getByRole('button', { name: '← Back' }).click();
  await page.getByRole('link', { name: 'Privacy Policy' }).click();
  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
  await expect(page.getByText(/Digital Personal Data Protection Act, 2023/)).toBeVisible();
});

for (const theme of ['classic', 'deccan'] as const) {
  test(`deleting the account removes it everywhere (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => {
      localStorage.setItem('pe_onboarded', '1');
      localStorage.setItem('pe_theme', JSON.stringify({ state: { theme: t }, version: 0 }));
    }, theme);
    const email = `delete-${Date.now()}-${theme}@example.com`;
    const reg = await page.request.post('/api/v1/auth/register', {
      data: { name: 'Delete Me', email, password: 'Delete-me-1234', acceptTerms: true, theme },
    });
    expect(reg.status()).toBe(201);

    await page.goto('/settings/sign-out');
    await page.getByRole('link', { name: 'Delete my account' }).click();
    await expect(page).toHaveURL(/\/settings\/delete-account$/);
    await expect(page.getByRole('heading', { name: 'Delete your account' })).toBeVisible();

    // The button stays off until DELETE is typed
    await expect(page.getByRole('button', { name: 'Delete my account' })).toBeDisabled();
    await page.getByLabel('Type DELETE to confirm').fill('delete');
    await page.getByRole('button', { name: 'Delete my account' }).click();
    await expect(page).toHaveURL(/\/$/);

    const login = await page.request.post('/api/v1/auth/login', { data: { email, password: 'Delete-me-1234' } });
    expect(login.status()).toBe(401);
    expect(await page.evaluate(() => localStorage.getItem('pe_sos_contacts'))).toBeNull();
  });
}
