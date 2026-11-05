// Particle target shapes. Each generator returns a Float32Array of `count` xyz positions.
// Image-based shapes sample the small grayscale PNGs produced by scripts/optimize-images.mjs.

const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

async function readPixels(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const lum = new Float32Array(canvas.width * canvas.height);
  for (let i = 0; i < lum.length; i++) lum[i] = data[i * 4] / 255;
  return { lum, w: canvas.width, h: canvas.height };
}

/**
 * Sample an image: pixels brighter than `threshold` become candidate points.
 * `depth(v)` maps brightness → z.
 */
function sampleImage({ lum, w, h }, count, { height, threshold, depth }) {
  const candidates = [];
  for (let i = 0; i < lum.length; i++) if (lum[i] > threshold) candidates.push(i);
  const width = height * (w / h);
  const out = new Float32Array(count * 3);
  for (let n = 0; n < count; n++) {
    const idx = candidates[(Math.random() * candidates.length) | 0];
    const px = (idx % w) + Math.random();
    const py = Math.floor(idx / w) + Math.random();
    out[n * 3] = (px / w - 0.5) * width;
    out[n * 3 + 1] = -(py / h - 0.5) * height;
    out[n * 3 + 2] = depth(lum[idx]);
  }
  return out;
}

export async function portraitBust(count) {
  const { lum, w, h } = await readPixels('/home/data/portrait-depth.png');
  // Depth map: white = near. Weight sampling toward the silhouette outline and toward strong
  // depth changes (nose, brow, jaw, ears) so the face reads clearly instead of as a flat blob.
  const T = 0.07;
  const idx = [];
  const wts = [];
  let total = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (lum[i] <= T) continue;
      const gx = lum[i + 1] - lum[i - 1];
      const gy = lum[i + w] - lum[i - w];
      const grad = Math.min(1, Math.hypot(gx, gy) * 6);
      const edge = lum[i - 1] <= T || lum[i + 1] <= T || lum[i - w] <= T || lum[i + w] <= T ? 1 : 0;
      const wt = 0.35 + grad * 2.2 + edge * 3.5 + lum[i] * 0.6;
      idx.push(i);
      total += wt;
      wts.push(total);
    }
  }
  const height = 4.8, width = height * (w / h);
  const out = new Float32Array(count * 3);
  for (let n = 0; n < count; n++) {
    const r = Math.random() * total;
    let lo = 0, hi = wts.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (wts[mid] < r) lo = mid + 1; else hi = mid; }
    const i = idx[lo];
    const px = (i % w) + Math.random(), py = Math.floor(i / w) + Math.random();
    out[n * 3] = (px / w - 0.5) * width;
    out[n * 3 + 1] = -(py / h - 0.5) * height;
    out[n * 3 + 2] = lum[i] * 1.6 - 0.5 + gauss() * 0.03;
  }
  return out;
}

export async function brain(count) {
  const img = await readPixels('/home/data/brain-silhouette.png');
  // Emphasise contours: copy the image, keeping only white pixels that touch black (the folds),
  // then mix 65% contour points with 35% fill points so the sulci read clearly.
  const { lum, w, h } = img;
  const edge = new Float32Array(lum.length);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (lum[i] < 0.62) continue;
      const nearDark = lum[i - 1] < 0.4 || lum[i + 1] < 0.4 || lum[i - w] < 0.4 || lum[i + w] < 0.4
        || lum[i - 2] < 0.4 || lum[i + 2] < 0.4 || lum[i - 2 * w] < 0.4 || lum[i + 2 * w] < 0.4;
      if (nearDark) edge[i] = 1;
    }
  }
  const nEdge = Math.round(count * 0.65);
  const opts = { height: 3.6, threshold: 0.62, depth: () => 0 };
  const pts = new Float32Array(count * 3);
  pts.set(sampleImage({ lum: edge, w, h }, nEdge, opts));
  pts.set(sampleImage(img, count - nEdge, opts), nEdge * 3);
  // Give the flat silhouette volume: bulge in the middle, thin at the edges.
  for (let i = 0; i < count; i++) {
    const x = pts[i * 3] / 2.6, y = pts[i * 3 + 1] / 1.7;
    const bulge = Math.max(0, 1 - x * x - y * y);
    pts[i * 3 + 2] = (Math.random() - 0.5) * (0.04 + bulge * 0.22);
  }
  return pts;
}

export function ribbon(count) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const a = t * Math.PI * 2;
    const spread = 0.12 + Math.abs(gauss()) * 0.45;
    out[i * 3] = (t - 0.5) * 15;
    out[i * 3 + 1] = Math.sin(a * 1.25) * 1.1 + gauss() * spread;
    out[i * 3 + 2] = Math.cos(a) * 1.6 - 2 + gauss() * spread;
  }
  return out;
}

export function shell(count) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const R = 2.6 + gauss() * 0.09;
    out[i * 3] = Math.cos(th) * r * R;
    out[i * 3 + 1] = y * R;
    out[i * 3 + 2] = Math.sin(th) * r * R;
  }
  return out;
}

export function terrain(count) {
  const out = new Float32Array(count * 3);
  const cols = Math.ceil(Math.sqrt(count * 1.7));
  const rows = Math.ceil(count / cols);
  for (let i = 0; i < count; i++) {
    const cx = i % cols, cz = Math.floor(i / cols);
    const x = (cx / (cols - 1) - 0.5) * 20 + rand(-0.02, 0.02);
    const z = (cz / (rows - 1)) * -12 + 3;
    out[i * 3] = x;
    out[i * 3 + 1] = -2.1 + Math.sin(x * 0.55) * 0.35 + Math.cos(z * 0.7 + x * 0.2) * 0.3;
    out[i * 3 + 2] = z;
  }
  return out;
}

/**
 * Lorenz strange attractor (σ=10, ρ=28, β=8/3): the chaotic "butterfly".
 * Points are sampled along one long trajectory, so density follows the dynamics.
 */
export function lorenz(count) {
  const out = new Float32Array(count * 3);
  let x = 0.1, y = 0, z = 0;
  const dt = 0.005, s = 10, r = 28, b = 8 / 3;
  for (let i = 0; i < 2000; i++) { // settle onto the attractor
    const dx = s * (y - x), dy = x * (r - z) - y, dz = x * y - b * z;
    x += dx * dt; y += dy * dt; z += dz * dt;
  }
  const stride = 3;
  for (let n = 0; n < count; n++) {
    for (let k = 0; k < stride; k++) {
      const dx = s * (y - x), dy = x * (r - z) - y, dz = x * y - b * z;
      x += dx * dt; y += dy * dt; z += dz * dt;
    }
    const j = 0.018;
    out[n * 3] = x * 0.1 + gauss() * j;
    out[n * 3 + 1] = (z - 25) * 0.1 + gauss() * j;
    out[n * 3 + 2] = y * 0.1 + gauss() * j;
  }
  return out;
}

/**
 * Klein bottle ("bottle" immersion): a closed surface with no inside or outside.
 * Area-weighted rejection sampling keeps the particle density even across the surface.
 */
function kleinPoint(u, v) {
  const c = Math.cos(u), si = Math.sin(u), cv = Math.cos(v), sv = Math.sin(v);
  const c2 = c * c, c3 = c2 * c, c4 = c2 * c2, c5 = c4 * c, c6 = c4 * c2, c7 = c6 * c;
  const x = (-2 / 15) * c * (3 * cv - 30 * si + 90 * c4 * si - 60 * c6 * si + 5 * c * cv * si);
  const y = (-1 / 15) * si * (3 * cv - 3 * c2 * cv - 48 * c4 * cv + 48 * c6 * cv - 60 * si
    + 5 * c * cv * si - 5 * c3 * cv * si - 80 * c5 * cv * si + 80 * c7 * cv * si);
  const z = (2 / 15) * (3 + 5 * c * si) * sv;
  return [x, y, z];
}
function kleinArea(u, v) {
  const e = 1e-3;
  const p = kleinPoint(u, v), pu = kleinPoint(u + e, v), pv = kleinPoint(u, v + e);
  const a = [pu[0] - p[0], pu[1] - p[1], pu[2] - p[2]];
  const b = [pv[0] - p[0], pv[1] - p[1], pv[2] - p[2]];
  return Math.hypot(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]) / (e * e);
}
export function kleinBottle(count) {
  let maxA = 0;
  for (let i = 0; i < 4000; i++) maxA = Math.max(maxA, kleinArea(Math.random() * Math.PI, Math.random() * Math.PI * 2));
  const out = new Float32Array(count * 3);
  const S = 0.98;
  let n = 0;
  while (n < count) {
    const u = Math.random() * Math.PI, v = Math.random() * Math.PI * 2;
    if (Math.random() * maxA > kleinArea(u, v)) continue;
    const [x, y, z] = kleinPoint(u, v);
    out[n * 3] = (x - 0.15) * S;
    out[n * 3 + 1] = (2.1 - y) * S;
    out[n * 3 + 2] = z * S;
    n++;
  }
  return out;
}
