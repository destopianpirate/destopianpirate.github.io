import { useEffect, useRef } from 'react';
import { useCanvasLoop, mulberry32 } from './useCanvasLoop';

// Hero backdrop, drawn in code. Two layers:
//  1. A dense static "membrane" (rendered once): thousands of hair-thin curved filaments and
//     looping arcs through a cloud of nodes, with curved orange-red rays bursting from a core.
//  2. A live layer of drifting neurons that react to the pointer: they are pushed away, glow,
//     and link to the cursor with orange-red synapses. Both layers parallax with the pointer.

const PALETTE = {
  light: { line: '24, 24, 27', node: '20, 20, 22', accent: '232, 64, 31', core: '#fff3ee' },
  dark: { line: '232, 232, 238', node: '245, 245, 247', accent: '255, 77, 46', core: '#ffffff' },
};

export default function NeuralNebula({ theme }) {
  const scene = useRef({});
  const pointer = useRef({ x: -9999, y: -9999, px: 0, py: 0, active: false });
  const pal = PALETTE[theme === 'dark' ? 'dark' : 'light'];

  const setup = (w, h) => {
    const rnd = mulberry32(1337);
    const gauss = () => (rnd() + rnd() + rnd() + rnd() + rnd() + rnd() - 3) / 3;
    const mobile = w < 768;
    // core sits up and to the right of the particle bust, so it frames the head instead of covering the face
    const cx = w * (mobile ? 0.7 : 0.9);
    const cy = h * (mobile ? 0.22 : 0.3);
    const sx = w * (mobile ? 0.5 : 0.3);
    const sy = h * 0.42;
    const minX = w * (mobile ? 0 : 0.48);

    // ---- cloud nodes: several overlapping lobes → organic, brain-like mass
    const lobes = [[0, 0, 0.75], [-0.6, -0.4, 0.55], [0.45, -0.55, 0.5], [-0.45, 0.5, 0.55], [0.55, 0.45, 0.5], [-0.95, 0.05, 0.45], [0.95, 0, 0.45]];
    const N = Math.round(Math.min(1500, Math.max(500, (w * h) / 900)));
    const nodes = [];
    while (nodes.length < N) {
      const [lx, ly, ls] = lobes[(rnd() * lobes.length) | 0];
      const x = cx + (lx + gauss() * ls) * sx;
      const y = cy + (ly + gauss() * ls) * sy;
      if (x < minX - 40 || x > w + 40 || y < -40 || y > h + 40) continue;
      const d = Math.hypot((x - cx) / sx, (y - cy) / sy);
      nodes.push({ x, y, d });
    }
    const edgeFade = (x) => Math.min(1, Math.max(0, (x - minX + 40) / (w * 0.12)));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const off = document.createElement('canvas');
    off.width = w * dpr;
    off.height = h * dpr;
    const o = off.getContext('2d');
    o.scale(dpr, dpr);
    o.lineCap = 'round';

    // ---- 1) long curved filaments (cubic Béziers) between nodes: the membrane texture
    const F = Math.round(N * 2.2);
    o.lineWidth = 0.45;
    for (let i = 0; i < F; i++) {
      const a = nodes[(rnd() * N) | 0];
      const b = nodes[(rnd() * N) | 0];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 25 || len > sx * 0.9) continue;
      const nx = -dy / len, ny = dx / len;
      const bend1 = (rnd() - 0.5) * len * 1.1;
      const bend2 = (rnd() - 0.5) * len * 1.1;
      const dens = Math.max(0, 1 - (a.d + b.d) / 3.2);
      const alpha = (0.025 + 0.11 * dens) * edgeFade(Math.min(a.x, b.x));
      if (alpha < 0.006) continue;
      o.strokeStyle = `rgba(${pal.line}, ${alpha})`;
      o.beginPath();
      o.moveTo(a.x, a.y);
      o.bezierCurveTo(
        a.x + dx * 0.33 + nx * bend1, a.y + dy * 0.33 + ny * bend1,
        a.x + dx * 0.66 + nx * bend2, a.y + dy * 0.66 + ny * bend2,
        b.x, b.y
      );
      o.stroke();
    }

    // ---- 2) looping arcs: the soft circular swirls of the reference render
    for (let i = 0; i < Math.round(N * 0.45); i++) {
      const n = nodes[(rnd() * N) | 0];
      const R = 20 + Math.pow(rnd(), 1.6) * sx * 0.55;
      const a0 = rnd() * Math.PI * 2;
      const alpha = (0.02 + 0.06 * Math.max(0, 1 - n.d / 1.8)) * edgeFade(n.x - R);
      o.strokeStyle = `rgba(${pal.line}, ${alpha})`;
      o.lineWidth = 0.4;
      o.beginPath();
      o.ellipse(n.x, n.y, R, R * (0.55 + rnd() * 0.45), rnd() * Math.PI, a0, a0 + 1 + rnd() * 2.6);
      o.stroke();
    }

    // ---- 3) short curved links between near neighbours (spatial hash)
    const grid = new Map();
    const cell = 46;
    nodes.forEach((n, i) => {
      const k = `${(n.x / cell) | 0},${(n.y / cell) | 0}`;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(i);
    });
    o.lineWidth = 0.5;
    nodes.forEach((a) => {
      const gx = (a.x / cell) | 0, gy = (a.y / cell) | 0;
      let links = 0;
      for (let ox = -1; ox <= 1 && links < 3; ox++) {
        for (let oy = -1; oy <= 1 && links < 3; oy++) {
          for (const j of grid.get(`${gx + ox},${gy + oy}`) || []) {
            const b = nodes[j];
            const d = Math.hypot(b.x - a.x, b.y - a.y);
            if (b === a || d > cell || rnd() > 0.5) continue;
            o.strokeStyle = `rgba(${pal.line}, ${(0.05 + 0.12 * Math.max(0, 1 - a.d / 2)) * edgeFade(a.x)})`;
            o.beginPath();
            o.moveTo(a.x, a.y);
            o.quadraticCurveTo((a.x + b.x) / 2 + (rnd() - 0.5) * d * 0.6, (a.y + b.y) / 2 + (rnd() - 0.5) * d * 0.6, b.x, b.y);
            o.stroke();
            if (++links >= 3) break;
          }
        }
      }
    });

    // ---- 4) curved orange-red rays bursting from the core
    const rays = [];
    for (let i = 0; i < 90; i++) {
      const ang = rnd() * Math.PI * 2;
      const len = (0.12 + Math.pow(rnd(), 1.4) * 0.5) * sx;
      const tx = cx + Math.cos(ang) * len, ty = cy + Math.sin(ang) * len * 0.8;
      const curl = (rnd() - 0.5) * len * 0.7;
      const c1x = cx + Math.cos(ang) * len * 0.45 - Math.sin(ang) * curl;
      const c1y = cy + Math.sin(ang) * len * 0.36 + Math.cos(ang) * curl;
      rays.push({ tx, ty, c1x, c1y });
      const g = o.createLinearGradient(cx, cy, tx, ty);
      g.addColorStop(0, `rgba(${pal.accent}, 0.7)`);
      g.addColorStop(1, `rgba(${pal.accent}, 0)`);
      o.strokeStyle = g;
      o.lineWidth = 0.5 + rnd() * 0.5;
      o.beginPath();
      o.moveTo(cx, cy);
      o.quadraticCurveTo(c1x, c1y, tx, ty);
      o.stroke();
    }

    // ---- 5) nodes: tiny dark points, a few larger "somas", orange-red near the core
    for (const n of nodes) {
      const fade = edgeFade(n.x);
      const big = rnd() < 0.06;
      const hot = n.d < 0.4 && rnd() < 0.5;
      const r = big ? 1.6 + rnd() * 1.2 : 0.45 + rnd() * 0.75;
      o.fillStyle = hot
        ? `rgba(${pal.accent}, ${0.9 * fade})`
        : `rgba(${pal.node}, ${(0.25 + 0.6 * Math.max(0, 1 - n.d / 2.2)) * fade})`;
      o.beginPath();
      o.arc(n.x, n.y, hot ? r + 0.5 : r, 0, Math.PI * 2);
      o.fill();
    }

    // ---- live neurons (react to the pointer)
    const live = [];
    const L = mobile ? 70 : 170;
    while (live.length < L) {
      const x = cx + gauss() * sx * 1.1, y = cy + gauss() * sy * 1.1;
      if (x < minX || x > w || y < 0 || y > h) continue;
      live.push({ ox: x, oy: y, x, y, vx: 0, vy: 0, ph: rnd() * 6.28, r: 0.9 + rnd() * 1.4 });
    }

    Object.assign(scene.current, { off, cx, cy, sx, rays, live });
  };

  const draw = (ctx, w, h, t) => {
    const s = scene.current;
    if (!s.off) return;
    const p = pointer.current;
    // smoothed parallax
    s.mx = (s.mx || 0) + (p.px - (s.mx || 0)) * 0.06;
    s.my = (s.my || 0) + (p.py - (s.my || 0)) * 0.06;
    const ox = -s.mx * 22, oy = -s.my * 14;

    // static membrane
    ctx.drawImage(s.off, ox, oy, w, h);

    // breathing core glow
    const pulse = 0.75 + 0.25 * Math.sin(t * 1.6);
    const ccx = s.cx + ox, ccy = s.cy + oy;
    const R = s.sx * 0.55;
    const glow = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, R);
    glow.addColorStop(0, `rgba(${pal.accent}, ${0.3 * pulse})`);
    glow.addColorStop(0.2, `rgba(${pal.accent}, ${0.1 * pulse})`);
    glow.addColorStop(1, `rgba(${pal.accent}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(ccx - R, ccy - R, R * 2, R * 2);

    // pulses travelling along the curved rays
    for (let i = 0; i < s.rays.length; i += 2) {
      const r = s.rays[i];
      const k = (t * 0.28 + i * 0.173) % 1;
      const a = 1 - k;
      const x = a * a * s.cx + 2 * a * k * r.c1x + k * k * r.tx;
      const y = a * a * s.cy + 2 * a * k * r.c1y + k * k * r.ty;
      ctx.fillStyle = `rgba(${pal.accent}, ${a * 0.9})`;
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // core sparkle
    ctx.fillStyle = pal.core;
    ctx.beginPath();
    ctx.arc(ccx, ccy, 3.4 + pulse * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${pal.accent}, 1)`;
    ctx.beginPath();
    ctx.arc(ccx, ccy, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // live neurons: drift, flee the pointer, spring home
    const lx = -s.mx * 34, ly = -s.my * 22; // nearer depth → more parallax
    const px = p.x - lx, py = p.y - ly;
    const RAD = 150;
    for (const n of s.live) {
      const hx = n.ox + Math.sin(t * 0.5 + n.ph) * 8;
      const hy = n.oy + Math.cos(t * 0.4 + n.ph) * 8;
      n.vx += (hx - n.x) * 0.012;
      n.vy += (hy - n.y) * 0.012;
      if (p.active) {
        const dx = n.x - px, dy = n.y - py;
        const d = Math.hypot(dx, dy);
        if (d < RAD && d > 0.1) {
          const f = (1 - d / RAD) * 1.6;
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
      }
      n.vx *= 0.88;
      n.vy *= 0.88;
      n.x += n.vx;
      n.y += n.vy;
    }
    // neighbour links among live neurons
    ctx.lineWidth = 0.7;
    for (let i = 0; i < s.live.length; i++) {
      const a = s.live[i];
      for (let j = i + 1; j < s.live.length; j++) {
        const b = s.live[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 4900) continue;
        ctx.strokeStyle = `rgba(${pal.line}, ${0.16 * (1 - Math.sqrt(d2) / 70)})`;
        ctx.beginPath();
        ctx.moveTo(a.x + lx, a.y + ly);
        ctx.lineTo(b.x + lx, b.y + ly);
        ctx.stroke();
      }
    }
    // synapses to the pointer + nodes
    for (const n of s.live) {
      const d = p.active ? Math.hypot(n.x - px, n.y - py) : 9999;
      const near = Math.max(0, 1 - d / (RAD * 1.5));
      if (near > 0) {
        ctx.strokeStyle = `rgba(${pal.accent}, ${near * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo((p.x + n.x + lx) / 2 + (n.y - py) * 0.15, (p.y + n.y + ly) / 2 - (n.x - px) * 0.15, n.x + lx, n.y + ly);
        ctx.stroke();
      }
      ctx.fillStyle = near > 0 ? `rgba(${pal.accent}, ${0.5 + near * 0.5})` : `rgba(${pal.node}, 0.6)`;
      ctx.beginPath();
      ctx.arc(n.x + lx, n.y + ly, n.r + near * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p.active && p.x > s.cx - s.sx * 1.6) {
      ctx.strokeStyle = `rgba(${pal.accent}, 0.35)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const canvasRef = useCanvasLoop({ setup, draw, deps: [theme] });

  // Pointer in canvas space (the hero canvas is full-bleed)
  useEffect(() => {
    const onMove = (e) => {
      const c = canvasRef.current;
      if (!c) return;
      const r = c.getBoundingClientRect();
      const p = pointer.current;
      p.x = e.clientX - r.left;
      p.y = e.clientY - r.top;
      p.px = (e.clientX / window.innerWidth) * 2 - 1;
      p.py = (e.clientY / window.innerHeight) * 2 - 1;
      p.active = p.y > 0 && p.y < r.height;
    };
    const onLeave = () => { pointer.current.active = false; };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="h3-backdrop-canvas" aria-hidden="true" />;
}
