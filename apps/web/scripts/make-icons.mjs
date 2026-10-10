/**
 * App icons from the artwork in apps/web/art/icon-source.png (a rounded tile drawn on a grey backdrop).
 * Takes the tile's flat interior and fills the square edge to edge, so Android's masks and
 * iOS's rounded corners never show grey. Maskable icons keep the art inside the 80% safe zone.
 * Also writes the Android launcher icons and launch screens when apps/web/android exists.
 *   npm run icons
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const pub = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const src = path.resolve(pub, '../art/icon-source.png');

const meta = await sharp(src).metadata();
const scale = meta.width / 1024;
// Inside the tile, clear of its rounded corners
const box = { left: Math.round(187 * scale), top: Math.round(185 * scale), width: Math.round(650 * scale), height: Math.round(650 * scale) };
const art = await sharp(src).extract(box).png().toBuffer();

// The tile has a soft gradient, so the border is grown by repeating the crop's edge pixels
// (no flat colour band, no grey).
async function icon(file, size, artShare) {
  const inner = Math.round(size * artShare);
  const pad = Math.floor((size - inner) / 2);
  await sharp(art)
    .resize(inner, inner)
    .extend({ top: pad, left: pad, bottom: size - inner - pad, right: size - inner - pad, extendWith: 'copy' })
    .flatten({ background: '#B5481F' })
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
    .toFile(path.join(pub, file));
  console.log(file, size);
}

await icon('icon-192.png', 192, 0.94);
await icon('icon-512.png', 512, 0.94);
await icon('icon-maskable-192.png', 192, 0.76);
await icon('icon-maskable-512.png', 512, 0.76);
await icon('apple-touch-icon.png', 180, 0.86);

// ── Android app (Capacitor), when apps/web/android exists ──────────
const res = path.resolve(pub, '../android/app/src/main/res');
if (fs.existsSync(res)) {
  const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  const write = async (buf, file) => {
    await fs.promises.writeFile(file, buf);
  };
  for (const [d, k] of Object.entries(densities)) {
    const dir = path.join(res, `mipmap-${d}`);
    const legacy = Math.round(48 * k);
    const fg = Math.round(108 * k);
    const tile = async (size, share) => {
      const inner = Math.round(size * share);
      const pad = Math.floor((size - inner) / 2);
      return sharp(art)
        .resize(inner, inner)
        .extend({ top: pad, left: pad, bottom: size - inner - pad, right: size - inner - pad, extendWith: 'copy' })
        .png({ compressionLevel: 9, palette: true, quality: 90 })
        .toBuffer();
    };
    // Pre-Android 8 square and round icons
    await write(await tile(legacy, 0.94), path.join(dir, 'ic_launcher.png'));
    const round = Buffer.from(`<svg width="${legacy}" height="${legacy}"><circle cx="${legacy / 2}" cy="${legacy / 2}" r="${legacy / 2}"/></svg>`);
    await write(
      await sharp(await tile(legacy, 0.68)).composite([{ input: round, blend: 'dest-in' }]).png().toBuffer(),
      path.join(dir, 'ic_launcher_round.png')
    );
    // Adaptive icon foreground (108dp layer; the launcher shows the middle 72dp): art inside the safe zone
    await write(await tile(fg, 0.62), path.join(dir, 'ic_launcher_foreground.png'));
  }
  // Adaptive icon background: the tile's own colour, so the edges blend in
  fs.writeFileSync(
    path.join(res, 'values/ic_launcher_background.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#B5481F</color>\n</resources>\n'
  );
  // Launch screen: the icon on the app background (replaces the Capacitor logo)
  for (const dir of fs.readdirSync(res).filter((n) => n.startsWith('drawable'))) {
    const file = path.join(res, dir, 'splash.png');
    if (!fs.existsSync(file)) continue;
    const { width, height } = await sharp(file).metadata();
    const size = Math.round(Math.min(width, height) * 0.32);
    const icon = await sharp(art).resize(size, size).png().toBuffer();
    await write(
      await sharp({ create: { width, height, channels: 4, background: '#F6F6F3' } })
        .composite([{ input: icon, gravity: 'center' }])
        .png({ compressionLevel: 9, palette: true })
        .toBuffer(),
      file
    );
  }
  console.log('android icons and launch screens');
}
