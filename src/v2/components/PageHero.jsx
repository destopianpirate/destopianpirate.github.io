import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { onIntroDone } from '../core/intro';
import { reducedMotion } from '../core/store';

gsap.registerPlugin(SplitText);

/** Big manga title-page header used by every sub page. */
export default function PageHero({ ep, jp, kanji, title, accent, children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const el = ref.current;
    let unsub = () => {};
    const ctx = gsap.context(() => {
      const split = new SplitText(el.querySelector('.phero-title'), { type: 'chars,words', charsClass: 'hc' });
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .from('.phero-kanji', { scale: 1.6, rotate: -18, autoAlpha: 0, duration: 1.4 }, 0)
        .from(split.chars, { yPercent: 120, rotateX: -90, opacity: 0, stagger: 0.03, duration: 1.1, transformOrigin: '50% 100%' }, 0.1)
        .from('.phero-meta > *', { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.7 }, 0.2)
        .from('.phero-body > *', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9 }, 0.5)
        .from('.phero-slash', { scaleX: 0, duration: 0.8, ease: 'expo.inOut' }, 0.3);
      unsub = onIntroDone(() => tl.play());
      gsap.to('.phero-kanji', { yPercent: 30, rotate: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    }, el);
    return () => { unsub(); ctx.revert(); };
  }, []);

  return (
    <section className="phero" ref={ref}>
      <div className="phero-bg speed-bg" aria-hidden="true" />
      <div className="phero-sun" aria-hidden="true" />
      <span className="phero-kanji" aria-hidden="true">{kanji}</span>
      <div className="wrap phero-inner">
        <div className="phero-meta">
          <span className="tag tag--ink">{ep}</span>
          <span className="mono">{jp}</span>
        </div>
        <h1 className="phero-title">
          {title} {accent && <em>{accent}</em>}
        </h1>
        <span className="phero-slash" aria-hidden="true" />
        <div className="phero-body">{children}</div>
      </div>
    </section>
  );
}
