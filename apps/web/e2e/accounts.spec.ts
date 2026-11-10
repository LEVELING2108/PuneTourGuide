import { expect, test, type Page } from '@playwright/test';

/**
 * Account flows against the dev stack. With no SMS/email provider configured (console mode,
 * development only) the API hands the code / reset link back, and the screens show it.
 */
const SHOTS = process.env.SHOTS_DIR;
const shot = async (page: Page, name: string) => {
  if (!SHOTS) return;
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

const freshPhone = () => `9${String(Date.now()).slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

async function prep(page: Page, theme: 'classic' | 'deccan') {
  await page.addInitScript((t) => {
    localStorage.setItem('pe_onboarded', '1');
    localStorage.setItem('pe_theme', JSON.stringify({ state: { theme: t }, version: 0 }));
  }, theme);
}

async function enterDevCode(page: Page) {
  const hint = page.getByText(/^Development: your code is \d{6}$/);
  await expect(hint).toBeVisible({ timeout: 10_000 });
  const code = (await hint.textContent())!.match(/\d{6}/)![0];
  await page.getByLabel('6-digit code').fill(code);
  return code;
}

for (const theme of ['classic', 'deccan'] as const) {
  test(`mobile sign-up: code → almost there → first contact (${theme})`, async ({ page }) => {
    await prep(page, theme);
    const phone = freshPhone();
    await page.goto('/signup');
    await page.getByRole('tab', { name: /Mobile/ }).click();
    await page.getByLabel('Mobile number').fill(phone);
    await page.getByRole('checkbox').first().click();
    await page.getByRole('link', { name: 'Send code' }).click();
    await expect(page).toHaveURL(/\/otp$/);
    await expect(page.getByText(`+91 ${phone.slice(0, 2)}••• ••${phone.slice(7)}`)).toBeVisible();
    await shot(page, `${theme}-otp`);

    // A wrong code first
    await page.getByLabel('6-digit code').fill('000001');
    await expect(page.getByRole('alert')).toContainText(/not right|expired/);
    await enterDevCode(page);
    await expect(page).toHaveURL(/\/almost-there/, { timeout: 10_000 });

    await page.getByLabel('Your name').fill('Asha Patil');
    await page.getByRole('checkbox').first().click();
    await page.getByRole('link', { name: /Continue/ }).click();
    await expect(page).toHaveURL(/\/first-contact/);
    await shot(page, `${theme}-first-contact`);

    await page.getByLabel('Their name').fill('Aai');
    await page.getByLabel('Their mobile number').fill('98765 43210');
    await page.getByRole('link', { name: /Save/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/settings/contacts');
    await expect(page.getByText('Aai', { exact: true })).toBeVisible();
    await expect(page.getByText('PRIMARY')).toBeVisible();
  });
}

test('returning mobile user goes straight back in', async ({ page }) => {
  await prep(page, 'classic');
  const phone = freshPhone();
  // First visit creates the account
  await page.goto('/login');
  await page.getByRole('tab', { name: /Mobile/ }).click();
  await page.getByPlaceholder('98XXX XXXXX').fill(phone);
  await page.getByRole('link', { name: 'Send code' }).click();
  await enterDevCode(page);
  await expect(page).toHaveURL(/\/almost-there/);
  await page.getByLabel('Your name').fill('Ravi');
  await page.getByRole('checkbox').first().click();
  await page.getByRole('link', { name: /Continue/ }).click();
  await page.getByRole('link', { name: /Skip/ }).click();
  await expect(page).toHaveURL(/\/$/);

  // Sign out, wait out the resend timer, sign in again: no onboarding this time
  await page.goto('/settings/sign-out');
  await page.getByRole('link', { name: /Sign out/ }).last().click();
  await page.waitForTimeout(31_000);
  await page.goto('/login?next=%2Fplan');
  await page.getByRole('tab', { name: /Mobile/ }).click();
  await page.getByPlaceholder('98XXX XXXXX').fill(phone);
  await page.getByRole('link', { name: 'Send code' }).click();
  await enterDevCode(page);
  await expect(page).toHaveURL(/\/plan$/, { timeout: 10_000 });
});

test('email sign-up, then forgot and reset password', async ({ page }) => {
  await prep(page, 'deccan');
  const email = `acct-${Date.now()}@example.com`;
  await page.goto('/signup');
  await page.getByLabel('Your name').fill('Meera Kulkarni');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('weak');
  await page.getByRole('checkbox').first().click();
  await page.getByRole('link', { name: 'Create account' }).click();
  await expect(page.getByRole('alert')).toContainText('at least 8');
  await page.getByLabel('Password').fill('Strong-pass-42');
  await page.getByRole('link', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/first-contact/);
  await page.getByRole('link', { name: /Skip/ }).click();
  await expect(page).toHaveURL(/\/$/);

  // Forgot → link → new password
  await page.goto('/settings/sign-out');
  await page.getByRole('link', { name: /Sign out/ }).last().click();
  await page.goto('/forgot');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: /Send/ }).first().click();
  await page.getByRole('link', { name: 'Development: open the reset link' }).click();
  await expect(page).toHaveURL(/\/reset\?token=/);
  await page.getByLabel('New password', { exact: true }).fill('Brand-new-77');
  await page.getByLabel('Type the new password again').fill('Brand-new-77');
  await page.getByRole('button', { name: 'Save new password' }).click();
  await expect(page.getByRole('heading', { name: 'Password changed' })).toBeVisible();
  await shot(page, 'reset-done');

  const ok = await page.request.post('/api/v1/auth/login', { data: { email, password: 'Brand-new-77' } });
  expect(ok.status()).toBe(200);
  const old = await page.request.post('/api/v1/auth/login', { data: { email, password: 'Strong-pass-42' } });
  expect(old.status()).toBe(401);
});

test('Google button explains when it is not set up', async ({ page }) => {
  await prep(page, 'classic');
  await page.goto('/login');
  await page.getByRole('link', { name: /Google/ }).click();
  await expect(page.getByText("Google sign-in isn't set up yet. Use email or mobile.")).toBeVisible();
});
