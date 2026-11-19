// Pose data + maths for the SVG character rig (see Rig.jsx).
// Facing +x. Angles are degrees; 0 = limb hanging straight down, negative = swung forward.
// Torso/head positive = lean forward. Blade world angle: -90 forward, ±180 up, +90 back.

export const BASE = {
  y: 0, rot: 0, dir: 1,
  torso: 2, head: 0,
  aBU: 10, aBL: -14, aFU: -8, aFL: -20,
  lBU: 6, lBL: 4, lFU: -8, lFL: 6,
  sword: 0, blade: 0, runW: 0, phase: 0, run: 0,
  cloak: 0, aura: 0, // released form: battle coat + burning blade
};

export const POSES = {
  stand: { torso: 2, head: 0, aBU: 10, aBL: -14, aFU: -8, aFL: -20, lBU: 6, lBL: 4, lFU: -8, lFL: 6, y: 0, sword: 0, blade: 0 },
  lookUp: { torso: -6, head: -22, aBU: 14, aBL: -10, aFU: -4, aFL: -16, lBU: 8, lBL: 2, lFU: -10, lFL: 4, y: 0 },
  crouch: { torso: 38, head: -24, aBU: 40, aBL: -30, aFU: -40, aFL: -50, lBU: 30, lBL: 100, lFU: -70, lFL: 92, y: 36 },
  leap: { torso: 18, head: -10, aBU: 120, aBL: -10, aFU: -150, aFL: -10, lBU: 40, lBL: 70, lFU: -95, lFL: 120, y: -10 },
  guard: { torso: 8, head: -4, aBU: -30, aBL: -60, aFU: -42, aFL: -52, lBU: 34, lBL: 14, lFU: -36, lFL: 22, y: 12, sword: -42, blade: 1 },
  raise: { torso: -6, head: -8, aBU: -150, aBL: -20, aFU: -160, aFL: -20, lBU: 26, lBL: 8, lFU: -30, lFL: 16, y: 8, sword: 10, blade: 1 },
  slash: { torso: 30, head: -26, aBU: 70, aBL: -10, aFU: -88, aFL: -6, lBU: 62, lBL: 16, lFU: -62, lFL: 40, y: 30, sword: 4, blade: 1 },
  followThrough: { torso: 22, head: -18, aBU: 80, aBL: -20, aFU: -40, aFL: -30, lBU: 58, lBL: 18, lFU: -60, lFL: 40, y: 28, sword: 100, blade: 1 },
  bow: { torso: 52, head: 26, aBU: 6, aBL: -4, aFU: -6, aFL: -6, lBU: 4, lBL: 4, lFU: -4, lFL: 4, y: 4, sword: 0, blade: 0 },
  land: { torso: 30, head: -18, aBU: 60, aBL: -20, aFU: -60, aFL: -30, lBU: 24, lBL: 96, lFU: -64, lFL: 88, y: 34 },
  point: { torso: -2, head: -4, aBU: 12, aBL: -10, aFU: -86, aFL: -4, lBU: 10, lBL: 4, lFU: -10, lFL: 6, y: 0, blade: 0 },
  wave: { torso: 0, head: -6, aBU: 10, aBL: -14, aFU: -160, aFL: -30, lBU: 8, lBL: 4, lFU: -8, lFL: 6, y: 0, blade: 0 },
};

/** Procedural run / walk cycle. phase in radians. */
export function cycle(phase, kind = 'run') {
  const s = Math.sin(phase);
  const lift = (p) => Math.max(0, Math.sin(p));
  if (kind === 'walk') {
    return {
      torso: 4, head: -2, y: -3 * Math.abs(Math.cos(phase)),
      lFU: -26 * s - 2, lBU: 26 * s - 2,
      lFL: 8 + 34 * lift(phase + 1.9), lBL: 8 + 34 * lift(phase + 1.9 + Math.PI),
      aFU: 24 * s, aBU: -24 * s, aFL: -16, aBL: -16,
    };
  }
  // ninja run: torso pitched forward, arms streaming straight back
  return {
    torso: 34, head: -28, y: -7 * Math.abs(Math.cos(phase)) + 10,
    lFU: -52 * s - 14, lBU: 52 * s - 14,
    lFL: 18 + 78 * lift(phase + 1.7), lBL: 18 + 78 * lift(phase + 1.7 + Math.PI),
    aFU: 74 + 6 * s, aBU: 80 - 6 * s, aFL: 8, aBL: 6,
  };
}

const KEYS = ['y', 'rot', 'torso', 'head', 'aBU', 'aBL', 'aFU', 'aFL', 'lBU', 'lBL', 'lFU', 'lFL'];

/** Write a pose object onto a rig's SVG. P.runW blends in the run/walk cycle at P.phase. */
export function applyPose(svg, P) {
  if (!svg) return;
  let Q = P;
  if (P.runW > 0) {
    const c = cycle(P.phase || 0, P.run === 1 ? 'walk' : 'run');
    Q = { ...P };
    KEYS.forEach((k) => { if (c[k] != null) Q[k] = P[k] + (c[k] - P[k]) * P.runW; });
  }
  const j = svg.__joints || (svg.__joints = Object.fromEntries([...svg.querySelectorAll('[data-j]')].map((n) => [n.dataset.j, n])));
  const set = (k, t) => j[k] && j[k].setAttribute('transform', t);
  set('root', `translate(0 ${Q.y || 0}) rotate(${Q.rot || 0}) scale(${Q.dir || 1} 1)`);
  set('torso', `rotate(${Q.torso})`);
  set('head', `translate(0 -64) rotate(${Q.head})`);
  set('aB', `translate(-2 -56) rotate(${Q.aBU})`);
  set('aBL', `translate(0 30) rotate(${Q.aBL})`);
  set('aF', `translate(2 -56) rotate(${Q.aFU})`);
  set('aFL', `translate(0 30) rotate(${Q.aFL})`);
  set('sword', `translate(0 28) rotate(${Q.sword || 0})`);
  set('lB', `translate(-4 2) rotate(${Q.lBU})`);
  set('lBL', `translate(0 44) rotate(${Q.lBL})`);
  set('fB', `translate(0 42) rotate(${-(Q.lBU + Q.lBL) * 0.8})`);
  set('lF', `translate(4 2) rotate(${Q.lFU})`);
  set('lFL', `translate(0 44) rotate(${Q.lFL})`);
  set('fF', `translate(0 42) rotate(${-(Q.lFU + Q.lFL) * 0.8})`);
  if (j.blade) j.blade.style.opacity = Q.blade ?? 0;
  if (j.cloak) j.cloak.style.opacity = Q.cloak ?? 0;
  if (j.aura) j.aura.style.opacity = Q.aura ?? 0;
  if (j.sheathed) j.sheathed.style.opacity = 1 - (Q.blade ?? 0);
}
