import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { store, reducedMotion } from './store';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function scrollToY(y, opts = {}) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4, ...opts });
  else window.scrollTo({ top: typeof y === 'number' ? y : 0, behavior: 'smooth' });
}

/** Freeze page scrolling (menus, dialogs). */
export function setScrollLocked(locked) {
  document.documentElement.classList.toggle('menu-open', locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/** Lenis smooth scroll on the GSAP ticker; mirrors progress + velocity into the shared store. */
export function useSmoothScroll() {
  useEffect(() => {
    const syncNative = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      store.progress = max > 0 ? window.scrollY / max : 0;
    };

    if (reducedMotion()) {
      window.addEventListener('scroll', syncNative, { passive: true });
      return () => window.removeEventListener('scroll', syncNative);
    }

    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', (l) => {
      store.progress = l.progress || 0;
      store.velocity = l.velocity || 0;
      ScrollTrigger.update();
    });
    const tick = (t) => {
      lenis.raf(t * 1000);
      // let velocity settle to zero when the wheel stops
      store.velocity *= 0.92;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // in-page anchor links (#contact etc.) glide instead of jumping
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6, offset: -40 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
    };
  }, []);
}
