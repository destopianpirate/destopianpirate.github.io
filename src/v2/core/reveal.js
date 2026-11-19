import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { reducedMotion } from './store';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

export const SCRAMBLE = '!<>-_\\/[]{}—=+*^?#アカサタナ01';

const st = (el, extra = {}) => ({
  trigger: el,
  start: el.dataset.start || 'top 86%',
  toggleActions: el.dataset.once != null ? 'play none none none' : 'play none none reverse',
  pinnedContainer: el.closest('[data-pinned]') || undefined,
  ...extra,
});

/**
 * Declarative scroll animations. Any element under `rootRef` with
 *   data-anim="chars|words|lines|up|panel|pop|stagger|count|scramble|ink|draw|tilt"
 * gets wired to a ScrollTrigger. data-speed="0.2" adds scroll parallax.
 * `build(ctx)` runs inside the same gsap.context for page-specific timelines.
 */
export function useReveal(rootRef, build, deps = []) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = reducedMotion();

    const ctx = gsap.context(() => {
      if (!reduced) {
        const q = (sel) => gsap.utils.toArray(sel, root);

        q('[data-anim="chars"]').forEach((el) => {
          const s = new SplitText(el, { type: 'lines,words,chars', linesClass: 'sl', charsClass: 'sc', mask: 'lines' });
          gsap.from(s.chars, {
            yPercent: 115, rotateX: -80, rotate: 6, opacity: 0, transformOrigin: '50% 100%',
            duration: 1.05, ease: 'expo.out', stagger: { each: 0.018, from: el.dataset.from || 'start' },
            scrollTrigger: st(el),
          });
        });

        q('[data-anim="words"]').forEach((el) => {
          const s = new SplitText(el, { type: 'words', mask: 'words' });
          gsap.from(s.words, { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.018, scrollTrigger: st(el) });
        });

        q('[data-anim="lines"]').forEach((el) => {
          const s = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'sl' });
          gsap.from(s.lines, { yPercent: 105, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: st(el) });
        });

        q('[data-anim="up"]').forEach((el) => {
          gsap.fromTo(el, { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', delay: +(el.dataset.delay || 0), clearProps: 'transform', scrollTrigger: st(el) });
        });

        // manga panel wipe: the frame is cut open along a slanted edge
        q('[data-anim="panel"]').forEach((el) => {
          const dir = el.dataset.dir || 'left';
          const from = {
            left: 'polygon(0% 0%, 0% 0%, -15% 100%, -15% 100%)',
            right: 'polygon(115% 0%, 100% 0%, 100% 100%, 115% 100%)',
            up: 'polygon(0% 100%, 100% 115%, 100% 115%, 0% 100%)',
            down: 'polygon(0% -15%, 100% 0%, 100% 0%, 0% -15%)',
          }[dir];
          gsap.fromTo(el, { clipPath: from }, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: 1.2, ease: 'expo.inOut', delay: +(el.dataset.delay || 0),
            scrollTrigger: st(el), clearProps: el.dataset.keepclip != null ? '' : 'clipPath',
          });
        });

        q('[data-anim="pop"]').forEach((el) => {
          gsap.fromTo(el, { scale: 0, rotate: -25, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(2.6)', delay: +(el.dataset.delay || 0), clearProps: 'transform', scrollTrigger: st(el) });
        });

        q('[data-anim="stagger"]').forEach((el) => {
          gsap.fromTo(el.children, { y: 60, rotate: 2, autoAlpha: 0 }, {
            y: 0, rotate: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: +(el.dataset.each || 0.08),
            clearProps: 'transform', scrollTrigger: st(el),
          });
        });

        q('[data-anim="tilt"]').forEach((el) => {
          gsap.fromTo(el, { rotateX: 35, rotateY: -20, y: 120, z: -200, autoAlpha: 0, transformPerspective: 1200 }, {
            rotateX: 0, rotateY: 0, y: 0, z: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(el),
          });
        });

        q('[data-anim="scramble"]').forEach((el) => {
          const text = el.textContent;
          gsap.to(el, { duration: 1.2, ease: 'none', scrambleText: { text, chars: SCRAMBLE, speed: 0.6 }, scrollTrigger: st(el) });
        });

        // svg strokes drawn on scroll (paths need pathLength="1")
        q('[data-anim="draw"]').forEach((el) => {
          const paths = el.matches('path,line,polyline,polygon,circle,rect') ? [el] : el.querySelectorAll('[pathLength]');
          gsap.fromTo(paths, { strokeDasharray: 1, strokeDashoffset: 1 }, {
            strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.08, scrollTrigger: st(el),
          });
        });

        // text inks in word by word while scrolling through it
        q('[data-anim="ink"]').forEach((el) => {
          const s = new SplitText(el, { type: 'words' });
          gsap.fromTo(s.words, { opacity: 0.12 }, {
            opacity: 1, ease: 'none', stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: 0.5, pinnedContainer: el.closest('[data-pinned]') || undefined },
          });
        });

        q('[data-speed]').forEach((el) => {
          const sp = parseFloat(el.dataset.speed);
          gsap.fromTo(el, { y: () => -sp * 300 }, {
            y: () => sp * 300, ease: 'none',
            scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
          });
        });
      }

      // counters run even with reduced motion (they just land instantly)
      gsap.utils.toArray('[data-anim="count"]', root).forEach((el) => {
        const to = parseFloat(el.dataset.to);
        const dec = +(el.dataset.dec || 0);
        const suf = el.dataset.suf || '';
        const o = { v: 0 };
        const fmt = () => { el.textContent = o.v.toFixed(dec) + suf; };
        if (reduced) { o.v = to; fmt(); return; }
        fmt();
        gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: fmt, scrollTrigger: { ...st(el), toggleActions: 'play none none none' } });
      });

      const cleanup = build?.({ root, reduced, isMobile: window.innerWidth <= 860 });
      // pins are created after the generic reveals: re-order so later triggers account for pin spacing
      ScrollTrigger.sort();
      return cleanup;
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    const imgs = Array.from(root.querySelectorAll('img'));
    imgs.forEach((img) => img.complete || img.addEventListener('load', refresh, { once: true }));
    const t = setTimeout(refresh, 600);

    return () => {
      clearTimeout(t);
      imgs.forEach((img) => img.removeEventListener('load', refresh));
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
