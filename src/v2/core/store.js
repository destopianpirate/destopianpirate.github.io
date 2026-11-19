// Tiny mutable store shared between the DOM (GSAP/Lenis) and the WebGL scene.
// Read every frame from useFrame / rAF loops, so it is deliberately not React state.
export const store = {
  progress: 0, // whole-page scroll progress 0..1
  velocity: 0, // Lenis scroll velocity (px per frame, signed)
  mouse: { x: 0, y: 0 }, // normalised pointer, -1..1
  impact: 0, // 0..1 flash, set by "impact frame" moments, decays in the scene
  journey: 0, // 0..1 progress of the story's torii-corridor scene
};

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      store.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;
