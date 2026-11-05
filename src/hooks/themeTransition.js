import { flushSync } from 'react-dom';

/**
 * Switches the theme with a circular reveal that expands from `origin` (the toggle button), sweeping the
 * whole page including the 3D scene. Uses the View Transitions API; where it is unsupported, or the
 * visitor prefers reduced motion, the change is applied instantly.
 *
 * `apply` must update both the React state and the `data-theme` attribute synchronously.
 */
export function animateThemeChange(apply, origin) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof document.startViewTransition !== 'function') {
    apply();
    return;
  }
  const x = origin?.x ?? window.innerWidth - 40;
  const y = origin?.y ?? 38;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = document.startViewTransition(() => {
    flushSync(apply);
  });
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 1000, easing: 'cubic-bezier(0.22, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    })
    .catch(() => { /* the transition was skipped (e.g. tab hidden); the theme is already applied */ });
}
