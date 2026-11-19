// Shared world size + seeded helpers for the story scenery.
export const W = 1600;
export const H = 900;

export function rand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ridge line built from gaussian peaks + brushy jitter, closed down to the bottom. */
export function ridgePath({ seed = 1, base = 600, peaks = 5, height = 260, spread = 160, jitter = 6, width = W, bottom = H + 40 }) {
  const r = rand(seed);
  const ps = Array.from({ length: peaks }, () => ({ c: r() * width, h: height * (0.45 + r() * 0.55), w: spread * (0.6 + r() * 0.8) }));
  let d = `M -40 ${bottom} L -40 ${base}`;
  for (let x = -40; x <= width + 40; x += 10) {
    let y = base;
    ps.forEach((p) => { y -= p.h * Math.exp(-(((x - p.c) / p.w) ** 2)); });
    y += (r() - 0.5) * jitter;
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return `${d} L ${width + 40} ${bottom} Z`;
}
