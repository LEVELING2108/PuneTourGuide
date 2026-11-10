import { expect, test } from '@playwright/test';

/** Needs the web dev server (:5050) and Tour API (:3001) running. */
test('email sign-in persists across reloads and sign-out ends it', async ({ page, request }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = 'E2e-password-1';
  const reg = await request.post('/api/v1/auth/register', {
    data: { name: 'E2E Tester', email, password, acceptTerms: true },
  });
  expect(reg.status()).toBe(201);
  await page.context().clearCookies();

  await page.addInitScript(() => localStorage.setItem('pe_onboarded', '1'));
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Your password').fill('wrong-password');
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('incorrect');

  await page.getByPlaceholder('Your password').fill(password);
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);

  // No tokens in localStorage
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toMatch(/eyJ/);

  // Session restored from the httpOnly refresh cookie after a reload
  await page.reload();
  const me = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    return r.status;
  });
  expect(me).toBe(200);

  await page.goto('/settings/sign-out');
  await page.getByRole('dialog', { name: 'Sign out' }).getByRole('link', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  const after = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    return r.status;
  });
  expect(after).toBe(401);
});
