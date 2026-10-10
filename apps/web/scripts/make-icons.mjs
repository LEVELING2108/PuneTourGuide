/**
 * App icons from the artwork in apps/web/art/icon-source.png (a rounded tile drawn on a grey backdrop).
 * Takes the tile's flat interior and fills the square edge to edge, so Android's masks and
 * iOS's rounded corners never show grey. Maskable icons keep the art inside the 80% safe zone.
 *   node apps/web/scripts/make-icons.mjs
 */
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
