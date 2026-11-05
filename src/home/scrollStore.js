// Shared, mutable scroll/pointer state. Written by GSAP ScrollTrigger + pointer listeners,
// read every frame by the R3F scene. Deliberately not React state: scrolling never re-renders.
export const scrollStore = {
  progress: 0,     // 0 → 1 across the whole homepage
  stage: 0,        // 0 hero · 1 bio · 2 journey · 3 pillars · 4 outro (fractional while morphing)
  velocity: 0,     // px/s from ScrollTrigger, used for scroll "energy"
  mouse: { x: 0, y: 0 }, // normalized -1 → 1
  ncaReady: false, // true once the voxel NCA bust is live (particles then stay hidden on the hero)
  ncaShape: 'bust',   // requested NCA model: bust | initials | brain | chip (written by the hero chips)
  ncaReseed: 0,       // bump to regrow the current model from a single cell
  ncaInfo: null,      // { shape, label, target, params, grid } of the loaded model (written by NCAVoxels)
  ncaStats: null,     // { step, alive } of the running automaton (written every frame by NCAVoxels)
  hoverPillar: -1,    // index of the hovered "Three disciplines" card, -1 when none
  journeyProgress: 0, // 0 -> 1 across the pinned Academic Journey (drives the Lorenz ride)
};

export const STAGE_COUNT = 5;
