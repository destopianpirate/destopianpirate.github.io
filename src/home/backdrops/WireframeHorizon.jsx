import { useRef } from 'react';
import { useCanvasLoop } from './useCanvasLoop';

// Outro backdrop, drawn in code: misty layered hills on the horizon, an orange-red sun sinking
// behind them, and a perspective wireframe terrain (valley in the middle, hills rising left and
// right) that slowly flows toward the viewer and dissolves into fog.

const COLS = 70;
const ROWS = 46;
const Z_NEAR = 1.2;
const Z_FAR = 34;

function terrainHeight(x, z) {
  const side = Math.min(1, Math.abs(x) / 11);
  const valley = Math.pow(side, 2.2) * 2.6;                      // walls rise left & right
  const swell = Math.sin(x * 0.32 + z * 0.21) * 0.35 + Math.cos(z * 0.33 - x * 0.12) * 0.3;
  const dune = Math.sin(z * 0.12 + 1.3) * 0.25;
  return valley + swell * (0.4 + side) + dune;
}

export default function WireframeHorizon({ theme }) {
  const scene = useRef(null);
  const dark = theme === 'dark';

  const setup = (w, h) => {
    const css = getComputedStyle(document.documentElement);
    const bg = css.getPropertyValue('--bg-color').trim() || (dark ? '#030303' : '#ffffff');
    const horizon = h * 0.36;
    // Transparent stops must share the page colour, otherwise gradients blend through grey
    const clear = dark ? '3, 3, 3' : '255, 255, 255';
    const focal = w * 0.62;
    const sunR = Math.max(28, Math.min(w, h) * 0.06);
    const sunX = w * 0.5;

    // Far & mid hill silhouettes (static) → offscreen
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const off = document.createElement('canvas');
    off.width = w * dpr;
    off.height = h * dpr;
    const o = off.getContext('2d');
    o.scale(dpr, dpr);

    const ridge = (amp, freq, phase, base) => {
      const pts = [];
      for (let x = -10; x <= w + 10; x += 6) {
        const u = x / w;
        const y = base
          - amp * (0.55 * Math.sin(u * Math.PI * freq + phase) + 0.3 * Math.sin(u * Math.PI * freq * 2.3 + phase * 1.7) + 0.15 * Math.sin(u * 40 + phase));
        pts.push([x, y]);
      }
      return pts;
    };
    const fillRidge = (pts, top, stroke) => {
      // soft vertical gradient: tinted at the crest, melting into the page colour below
      const minY = Math.min(...pts.map((p) => p[1]));
      const g = o.createLinearGradient(0, minY, 0, minY + h * 0.14);
      g.addColorStop(0, top);
      g.addColorStop(1, bg);
      o.beginPath();
      o.moveTo(-10, h);
      pts.forEach(([x, y]) => o.lineTo(x, y));
      o.lineTo(w + 10, h);
      o.closePath();
      o.fillStyle = g;
      o.fill();
      if (stroke) {
        // contour lines following the ridge give the hills a fine wire texture
        for (let k = 0; k < 9; k++) {
          o.beginPath();
          pts.forEach(([x, y], i) => {
            const yy = y + k * k * 0.9 + Math.sin(x * 0.015 + k * 0.7) * k * 0.6;
            return i ? o.lineTo(x, yy) : o.moveTo(x, yy);
          });
          o.globalAlpha = Math.pow(1 - k / 9, 1.5);
          o.strokeStyle = stroke;
          o.lineWidth = 0.7;
          o.stroke();
        }
        o.globalAlpha = 1;
      }
    };

    // Farthest range (behind the sun)
    fillRidge(ridge(h * 0.06, 2.2, 0.6, horizon - h * 0.01), dark ? '#141416' : '#ebebee', dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');

    // Sun: solid top, dissolving into haze at the bottom
    const sunY = horizon - sunR * 0.55;
    const sg = o.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
    sg.addColorStop(0, dark ? '#ff4d2e' : '#e8401f');
    sg.addColorStop(0.62, dark ? '#ff5a35' : '#ff5a2e');
    sg.addColorStop(1, dark ? 'rgba(255,77,46,0)' : 'rgba(255,90,46,0)');
    o.fillStyle = sg;
    o.beginPath();
    o.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    o.fill();

    // Haze band across the horizon
    const hz = o.createLinearGradient(0, horizon - h * 0.04, 0, horizon + h * 0.06);
    hz.addColorStop(0, `rgba(${clear}, 0)`);
    hz.addColorStop(0.5, `rgba(${clear}, 0.9)`);
    hz.addColorStop(1, `rgba(${clear}, 0)`);
    o.fillStyle = hz;
    o.fillRect(0, horizon - h * 0.04, w, h * 0.1);

    // Mid ranges in front of the sun, each fading lighter
    fillRidge(ridge(h * 0.04, 3.1, 2.1, horizon + h * 0.014), dark ? '#101012' : '#f1f1f3', dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)');

    scene.current = { off, horizon, focal, bg, clear };
  };

  const draw = (ctx, w, h) => {
    const s = scene.current;
    if (!s) return;
    ctx.drawImage(s.off, 0, 0, w, h);

    const camH = 3.1;
    const flow = 2.4; // static frame (canvas is drawn once)
    const project = (x, y, z) => [w / 2 + (x / z) * s.focal, s.horizon + ((camH - y) / z) * s.focal];

    // Build the projected grid
    const grid = [];
    for (let j = 0; j < ROWS; j++) {
      const zf = j / (ROWS - 1);
      const z = Z_NEAR + Math.pow(zf, 1.7) * (Z_FAR - Z_NEAR);
      const row = [];
      for (let i = 0; i < COLS; i++) {
        const x = (i / (COLS - 1) - 0.5) * 30;
        row.push(project(x, terrainHeight(x, z + flow), z));
      }
      grid.push({ z, row });
    }

    // Occlusion: paint each band's ground with the page colour from far to near so nearer
    // hills hide the lines behind them, then stroke its lines.
    const line = dark ? '230, 230, 235' : '30, 30, 32';
    ctx.lineJoin = 'round';
    for (let j = ROWS - 2; j >= 0; j--) {
      const a = grid[j + 1].row, b = grid[j].row;
      const zf = (grid[j].z - Z_NEAR) / (Z_FAR - Z_NEAR);
      // fade into the horizon haze: by depth, and by how close the row sits to the horizon on screen
      const rowY = b[COLS >> 1][1];
      const fogFar = Math.pow(1 - zf, 1.6) * Math.min(1, Math.max(0, (rowY - s.horizon) / (h * 0.16)));
      const fogNear = Math.min(1, (grid[j].z - Z_NEAR) / 2.2); // fade at the very bottom
      const alpha = (dark ? 0.42 : 0.5) * fogFar * (0.15 + 0.85 * fogNear);

      ctx.beginPath();
      ctx.moveTo(a[0][0], a[0][1]);
      for (let i = 1; i < COLS; i++) ctx.lineTo(a[i][0], a[i][1]);
      for (let i = COLS - 1; i >= 0; i--) ctx.lineTo(b[i][0], b[i][1]);
      ctx.closePath();
      // occlude what's behind only where the terrain is solid; far bands melt into the haze
      ctx.fillStyle = `rgba(${s.clear}, ${Math.min(1, fogFar * 1.4)})`;
      ctx.fill();

      if (alpha < 0.01) continue;
      ctx.strokeStyle = `rgba(${line}, ${alpha})`;
      ctx.lineWidth = 0.7 + (1 - zf) * 0.5;
      ctx.beginPath();
      // row line (constant z)
      ctx.moveTo(b[0][0], b[0][1]);
      for (let i = 1; i < COLS; i++) ctx.lineTo(b[i][0], b[i][1]);
      // column segments of this band
      for (let i = 0; i < COLS; i++) {
        ctx.moveTo(a[i][0], a[i][1]);
        ctx.lineTo(b[i][0], b[i][1]);
      }
      ctx.stroke();
    }

  };

  // Drawn once (no per-frame work); the motion over it comes from the GPU particle wave.
  const ref = useCanvasLoop({ setup, draw, deps: [theme], maxDpr: 1.5, animate: false });
  return <canvas ref={ref} className="h3-backdrop-canvas" aria-hidden="true" />;
}
