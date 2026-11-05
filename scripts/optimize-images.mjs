// Converts the raw ChatGPT renders in design/raw/ into web-ready assets in public/home/.
// Run with: npm run images
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const RAW = 'design/raw';
const OUT = 'public/home';
const DATA = path.join(OUT, 'data');

await mkdir(DATA, { recursive: true });

const raw = (f) => path.join(RAW, f);

// Photographic / illustrative images → WebP at full + small width
const photos = [
  ['journey-class10.png', 'journey-class10'],
  ['journey-class12.png', 'journey-class12'],
  ['og-banner.png', 'journey-btech'],
];
for (const [src, name] of photos) {
  await sharp(raw(src)).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, `${name}.webp`));
  await sharp(raw(src)).resize({ width: 900 }).webp({ quality: 76 }).toFile(path.join(OUT, `${name}-sm.webp`));
}

// Hero/outro backdrops and pillar visuals are drawn in code (src/home/backdrops, PillarVisuals.jsx).

// Matcaps → trim the white background so the sphere fills the square exactly
for (const name of ['matcap-porcelain', 'matcap-graphite', 'matcap-ember']) {
  const trimmed = await sharp(raw(`${name}.png`)).trim({ background: '#ffffff', threshold: 18 }).toBuffer();
  await sharp(trimmed).resize(512, 512, { fit: 'fill' }).webp({ quality: 90 }).toFile(path.join(OUT, `${name}.webp`));
}

// Particle sources → small lossless grayscale PNGs sampled at runtime
await sharp(raw('portrait-depth.png')).resize({ width: 220 }).grayscale().png().toFile(path.join(DATA, 'portrait-depth.png'));
await sharp(raw('brain-silhouette.png')).trim({ background: '#000000', threshold: 30 }).resize({ width: 480 }).grayscale().png().toFile(path.join(DATA, 'brain-silhouette.png'));

// Social preview image (1200×630), network kept on the right
await sharp(raw('og-banner.png')).resize({ height: 630 }).extract({ left: 690, top: 0, width: 1200, height: 630 }).jpeg({ quality: 84 }).toFile('public/og-image.jpg');

console.log('images optimized →', OUT);
