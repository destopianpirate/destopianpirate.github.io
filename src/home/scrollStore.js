// Shared, mutable scroll/pointer state. Written by GSAP ScrollTrigger + pointer listeners,
// read every frame by the R3F scene. Deliberately not React state: scrolling never re-renders.
export const scrollStore = {
  progress: 0,     // 0 → 1 across the whole homepage
  stage: 0,        // 0 hero · 1 bio · 2 journey · 3 pillars · 4 outro (fractional while morphing)
  velocity: 0,     // px/s from ScrollTrigger, used for scroll "energy"
  mouse: { x: 0, y: 0 }, // normalized -1 → 1
  ncaReady: false, // true once the voxel NCA bust is live (particles then stay hidden on the hero)
};

export const STAGE_COUNT = 5;
