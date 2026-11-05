// 3D Neural Cellular Automaton runtime (Web Worker).
// Mirrors scripts/nca/train_nca.py exactly: perception = [identity, sobel x, sobel y, sobel z]
// per channel (zero padding), MLP 4C -> HID (relu) -> C, stochastic update (p = 0.5),
// life mask = 3x3x3 max-pool(alpha) > 0.1 before AND after the update.
// Only cells inside the pre-alive region are computed: all others are zeroed by the mask anyway.

let C, HID, GX, GY, GZ, N, W1, B1, W2, state, next, seedPos, shapeName = '', stepCount = 0;
let preAlive, postAlive, aliveRaw, activity;
let running = false;
let timer = 0;
let stepsPerTick = 1;

const KID = new Float32Array(27);
const KX = new Float32Array(27);
const KY = new Float32Array(27);
const KZ = new Float32Array(27);
{
  const s = [1, 2, 1];
  const d = [-1, 0, 1];
  let k = 0;
  for (let dz = 0; dz < 3; dz++) {
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++, k++) {
        KID[k] = dz === 1 && dy === 1 && dx === 1 ? 1 : 0;
        KX[k] = (s[dz] * s[dy] * d[dx]) / 32;
        KY[k] = (s[dz] * d[dy] * s[dx]) / 32;
        KZ[k] = (d[dz] * s[dy] * s[dx]) / 32;
      }
    }
  }
}

const idx = (x, y, z) => (z * GY + y) * GX + x;

function dilateAlpha(src, out) {
  // out[v] = 1 if any cell in the 3x3x3 neighbourhood has alpha > 0.1
  for (let v = 0; v < N; v++) aliveRaw[v] = src[v * C + 3] > 0.1 ? 1 : 0;
  out.fill(0);
  for (let z = 0; z < GZ; z++) {
    for (let y = 0; y < GY; y++) {
      for (let x = 0; x < GX; x++) {
        if (!aliveRaw[idx(x, y, z)]) continue;
        for (let dz = -1; dz <= 1; dz++) {
          const zz = z + dz;
          if (zz < 0 || zz >= GZ) continue;
          for (let dy = -1; dy <= 1; dy++) {
            const yy = y + dy;
            if (yy < 0 || yy >= GY) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const xx = x + dx;
              if (xx < 0 || xx >= GX) continue;
              out[idx(xx, yy, zz)] = 1;
            }
          }
        }
      }
    }
  }
}

const perc = new Float32Array(64 * 4);
const hid = new Float32Array(256);

function step() {
  stepCount++;
  dilateAlpha(state, preAlive);
  next.fill(0);
  const P = 4 * C;
  for (let z = 0; z < GZ; z++) {
    for (let y = 0; y < GY; y++) {
      for (let x = 0; x < GX; x++) {
        const v = idx(x, y, z);
        if (!preAlive[v]) continue;
        // perception
        perc.fill(0, 0, P);
        let k = 0;
        for (let dz = -1; dz <= 1; dz++) {
          const zz = z + dz;
          for (let dy = -1; dy <= 1; dy++) {
            const yy = y + dy;
            for (let dx = -1; dx <= 1; dx++, k++) {
              const xx = x + dx;
              if (zz < 0 || zz >= GZ || yy < 0 || yy >= GY || xx < 0 || xx >= GX) continue;
              const base = idx(xx, yy, zz) * C;
              const ki = KID[k], kx = KX[k], ky = KY[k], kz = KZ[k];
              for (let c = 0; c < C; c++) {
                const s = state[base + c];
                if (s === 0) continue;
                const o = c * 4;
                perc[o] += ki * s;
                perc[o + 1] += kx * s;
                perc[o + 2] += ky * s;
                perc[o + 3] += kz * s;
              }
            }
          }
        }
        // MLP
        for (let h = 0; h < HID; h++) {
          let acc = B1[h];
          const row = h * P;
          for (let i = 0; i < P; i++) acc += W1[row + i] * perc[i];
          hid[h] = acc > 0 ? acc : 0;
        }
        const base = v * C;
        const fire = Math.random() < 0.5;
        for (let c = 0; c < C; c++) {
          let d = 0;
          if (fire) {
            const row = c * HID;
            for (let h = 0; h < HID; h++) d += W2[row + h] * hid[h];
          }
          next[base + c] = state[base + c] + d;
        }
      }
    }
  }
  dilateAlpha(next, postAlive);
  for (let v = 0; v < N; v++) {
    const base = v * C;
    const keep = preAlive[v] && postAlive[v];
    const prevA = state[base + 3];
    for (let c = 0; c < C; c++) state[base + c] = keep ? next[base + c] : 0;
    // activity: how much the cell is changing (growth front / healing wound) → decays slowly
    // ignore the small steady-state flicker of a mature NCA; only real growth / repair glows
    const da = Math.abs(state[base + 3] - prevA);
    const born = prevA <= 0.1 && state[base + 3] > 0.1 ? 1 : 0;
    activity[v] = Math.min(1, activity[v] * 0.9 + Math.max(0, da - 0.06) * 5 + born);
  }
}

function emit() {
  // Compact list of visible voxels: [x, y, z, alpha, grey, activity] per cell
  let n = 0;
  for (let v = 0; v < N; v++) if (state[v * C + 3] > 0.1) n++;
  const out = new Float32Array(n * 6);
  let o = 0;
  for (let z = 0; z < GZ; z++) {
    for (let y = 0; y < GY; y++) {
      for (let x = 0; x < GX; x++) {
        const v = idx(x, y, z);
        const a = state[v * C + 3];
        if (a <= 0.1) continue;
        const g = (state[v * C] + state[v * C + 1] + state[v * C + 2]) / 3;
        out[o++] = x; out[o++] = y; out[o++] = z;
        out[o++] = Math.min(1, a);
        out[o++] = Math.max(0, Math.min(1, g));
        out[o++] = activity[v];
      }
    }
  }
  self.postMessage({ type: 'frame', cells: out, count: n, step: stepCount, shape: shapeName }, [out.buffer]);
}

function reseed() {
  stepCount = 0;
  state.fill(0);
  activity.fill(0);
  const [sx, sy, sz] = seedPos;
  const b = idx(sx, sy, sz) * C;
  for (let c = 3; c < C; c++) state[b + c] = 1;
}

function damage(cx, cy, cz, r) {
  const r2 = r * r;
  for (let z = 0; z < GZ; z++) {
    for (let y = 0; y < GY; y++) {
      for (let x = 0; x < GX; x++) {
        const d2 = (x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2;
        if (d2 > r2) continue;
        const v = idx(x, y, z);
        state.fill(0, v * C, v * C + C);
        activity[v] = 1;
      }
    }
  }
}

function loop() {
  if (!running) return;
  const t0 = performance.now();
  for (let i = 0; i < stepsPerTick; i++) step();
  emit();
  const spent = performance.now() - t0;
  timer = setTimeout(loop, Math.max(0, 55 - spent)); // ~18 steps/s, never hogs the worker
}

async function loadModel(base) {
  const [meta, buf] = await Promise.all([
    fetch(base + 'meta.json').then((r) => r.json()),
    fetch(base + 'weights.bin').then((r) => r.arrayBuffer()),
  ]);
  ({ C, HID } = meta);
  [GX, GY, GZ] = meta.grid;
  seedPos = meta.seed;
  shapeName = meta.shape || '';
  N = GX * GY * GZ;
  const f = new Float32Array(buf);
  const P = 4 * C;
  W1 = f.subarray(0, HID * P);
  B1 = f.subarray(HID * P, HID * P + HID);
  W2 = f.subarray(HID * P + HID, HID * P + HID + C * HID);
  state = new Float32Array(N * C);
  next = new Float32Array(N * C);
  preAlive = new Uint8Array(N);
  postAlive = new Uint8Array(N);
  aliveRaw = new Uint8Array(N);
  activity = new Float32Array(N);
  reseed();
  self.postMessage({ type: 'ready', grid: meta.grid, targetCount: meta.targetCount, shape: shapeName, label: meta.label, weights: f.length });
}

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === 'init' || m.type === 'load') {
    // 'load' swaps in another trained model (the old one keeps stepping until the new one is ready)
    try { await loadModel(m.base); } catch (err) { self.postMessage({ type: 'error', message: String(err) }); }
  } else if (m.type === 'run') {
    if (!running && m.value) { running = true; loop(); }
    if (!m.value) { running = false; clearTimeout(timer); }
  } else if (m.type === 'damage') {
    damage(m.x, m.y, m.z, m.r);
  } else if (m.type === 'reseed') {
    reseed();
  }
};
