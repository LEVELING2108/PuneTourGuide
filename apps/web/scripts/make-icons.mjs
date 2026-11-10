/**
 * Every app icon from the drawing in apps/web/art/icon.svg (Gilded night: Shaniwar Wada's Delhi
 * Darwaza with the bhagwa) and its simplified twin art/icon-small.svg for 16-32 px.
 * The drawing has two groups: #bg (sky and glow) and #fg (the gate). Web and iOS icons use both;
 * Android draws them as separate adaptive-icon layers so its masks and motion effects work.
 * Writes the web app icons, the landing page icons, and (when apps/web/android exists) the Android
 * launcher icons and launch screens.
 *   npm run icons -w apps/web
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(web, 'public');
const landing = path.resolve(web, '../landing/img');
const full = fs.readFileSync(path.join(web, 'art/icon.svg'), 'utf8');
const small = fs.readFileSync(path.join(web, 'art/icon-small.svg'), 'utf8');

// The two layers of the drawing, each as a whole SVG
const group = (svg, id) => {
  const start = svg.indexOf(`<g id="${id}">`);
  if (start < 0) throw new Error(`art/icon.svg has no <g id="${id}">`);
  let depth = 0, i = start;
  for (const m of svg.slice(start).matchAll(/<g[\s>]|<\/g>/g)) {
    depth += m[0] === '</g>' ? -1 : 1;
    if (depth === 0) { i = start + m.index + 4; break; }
  }
  return svg.slice(start, i);
};
const only = (svg, drop) => svg.replace(group(svg, drop), '');
const bgOnly = only(full, 'fg');
// Android shows the middle 72 of the 108 dp foreground through a mask as small as a 66 dp circle
const fgAdaptive = only(full, 'bg').replace('<g id="fg">', '<g id="fg"><g transform="translate(512 512) scale(0.72) translate(-512 -512)">').replace(/<\/svg>\s*$/, '</g></svg>');

const png = (svg, size) => sharp(Buffer.from(svg), { density: Math.max(72, (72 * size) / 1024 * 4) }).resize(size, size);
const out = (img) => img.png({ compressionLevel: 9, effort: 10 });
const mask = (size, shape) =>
  Buffer.from(
    shape === 'circle'
      ? `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`
      : `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * 0.225}"/></svg>`
  );
const write = async (img, file) => {
  await out(img).toFile(file);
  console.log(path.relative(path.resolve(web, '../..'), file));
};
// "any" icons are shown as they are (browser install dialogs, desktop): rounded, clear corners.
// Maskable and Apple icons are full bleed: the platform cuts its own shape.
const rounded = async (size) => sharp(await png(full, size).png().toBuffer()).composite([{ input: mask(size, 'rounded'), blend: 'dest-in' }]);

for (const dir of [pub, landing]) {
  await write(await rounded(192), path.join(dir, 'icon-192.png'));
  await write(await rounded(512), path.join(dir, 'icon-512.png'));
  await write(png(full, 180).flatten({ background: '#0B0A09' }), path.join(dir, 'apple-touch-icon.png'));
  fs.writeFileSync(path.join(dir, 'favicon.svg'), small);
}
await write(png(full, 192), path.join(pub, 'icon-maskable-192.png'));
await write(png(full, 512), path.join(pub, 'icon-maskable-512.png'));
await write(png(full, 1024), path.join(web, 'art/icon-1024.png'));

// ── Android app (Capacitor), when apps/web/android exists ──────────
const res = path.join(web, 'android/app/src/main/res');
if (fs.existsSync(res)) {
  const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(densities)) {
    const dir = path.join(res, `mipmap-${d}`);
    const legacy = Math.round(48 * k);
    const layer = Math.round(108 * k);
    // Pre-Android 8 square and round icons
    await write(await rounded(legacy), path.join(dir, 'ic_launcher.png'));
    await write(sharp(await png(full, legacy).png().toBuffer()).composite([{ input: mask(legacy, 'circle'), blend: 'dest-in' }]), path.join(dir, 'ic_launcher_round.png'));
    // Adaptive icon layers (108 dp each)
    await write(png(fgAdaptive, layer), path.join(dir, 'ic_launcher_foreground.png'));
    await write(png(bgOnly, layer), path.join(dir, 'ic_launcher_background.png'));
  }
  const adaptive = '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@mipmap/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n';
  for (const f of ['ic_launcher.xml', 'ic_launcher_round.xml']) fs.writeFileSync(path.join(res, 'mipmap-anydpi-v26', f), adaptive);
  // Launch screen: the icon, rounded, on the app's light background
  for (const dir of fs.readdirSync(res).filter((n) => n.startsWith('drawable'))) {
    const file = path.join(res, dir, 'splash.png');
    if (!fs.existsSync(file)) continue;
    const { width, height } = await sharp(file).metadata();
    const size = Math.round(Math.min(width, height) * 0.32);
    const tile = await (await rounded(size)).png().toBuffer();
    await out(sharp({ create: { width, height, channels: 4, background: '#F6F6F3' } }).composite([{ input: tile, gravity: 'center' }])).toFile(file);
  }
  console.log('android launch screens');
}
