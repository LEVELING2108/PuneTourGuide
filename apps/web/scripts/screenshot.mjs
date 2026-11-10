// Screenshot helper: node scripts-shot.mjs <outDir> <theme> <route> [<route>...]
import { chromium } from '@playwright/test';
const [, , out, theme, ...routes] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await ctx.addInitScript((t) => {
  localStorage.setItem('pe_theme', JSON.stringify({ state: { theme: t }, version: 0 }));
  localStorage.setItem('pe_onboarded', '1');
}, theme);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
for (const r of routes) {
  await page.goto('http://localhost:5050' + r, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  const name = `${theme}-${r.replace(/\//g, '_') || 'home'}.png`;
  await page.screenshot({ path: `${out}/${name}` });
  console.log('shot', name);
}
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'));
await browser.close();
