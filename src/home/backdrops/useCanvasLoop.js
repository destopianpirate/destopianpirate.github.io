import { useEffect, useRef } from 'react';

/**
 * Sizes a <canvas> to its parent (DPR-aware), runs `draw(ctx, w, h, t)` every frame while the
 * canvas is on screen, and calls `setup(w, h)` again whenever the size or `deps` change.
 * With reduced motion it draws a single frame.
 */
export function useCanvasLoop({ setup, draw, deps = [], fps = 60, maxDpr = 2, animate = true }) {
  const canvasRef = useRef(null);
  const fns = useRef({ setup, draw });

  useEffect(() => {
    fns.current = { setup, draw };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // static canvases draw once per resize/theme change and never run a frame loop
    const reduced = !animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0, visible = true, start = performance.now();

    const resize = () => {
      // clientWidth/Height = layout size, unaffected by GSAP scale transforms on the parent
      const parent = canvas.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      w = Math.max(1, parent.clientWidth);
      h = Math.max(1, parent.clientHeight);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fns.current.setup?.(w, h);
      if (reduced || !visible) frame(performance.now(), true);
    };

    const minGap = 1000 / fps - 2;
    let last = 0;
    const frame = (now, once = false) => {
      if (!once && now - last < minGap) {
        raf = requestAnimationFrame(frame);
        return;
      }
      last = now;
      ctx.clearRect(0, 0, w, h);
      fns.current.draw(ctx, w, h, (now - start) / 1000);
      if (!once && !reduced && visible) raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    resize();
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}

/** Deterministic PRNG so the drawing is identical on every resize/theme change. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
