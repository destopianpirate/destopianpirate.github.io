import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { onIntroDone } from '../core/intro';
import { reducedMotion, store } from '../core/store';
import Rig from '../story/Rig';
import { POSES } from '../story/pose';
import { Layer, Ridge } from '../story/Scenery';
import '../styles/story.css';
import '../styles/story-cover.css';
import '../styles/hero2.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

function Tape({ words, className, reverse }) {
  const row = words.map((t, i) => <span key={i} className={/[぀-鿿]/.test(t) ? 'tape-jp' : undefined}>{t}<b>✦</b></span>);
  return (
    <div className={`tape ${className}`}>
      <div className={`tape-run ${reverse ? 'tape-run--rev' : ''}`}>{row}{row}</div>
    </div>
  );
}

/**
 * Cinematic manga title page shared by every sub page: night scene, speed lines, the wanderer in a
 * page-specific pose next to page-specific art, a glitching title and crossing tapes.
 */
export default function PageHero({ ep, jp, kanji, title, accent, children, vol = '第二巻', pose = 'guard', art, tape = [], vert, stats = [], orb = 'moon', glow = false, center = false }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    let unsub = () => {};
    const ctx = gsap.context(() => {
      if (reducedMotion()) return;
      const split = new SplitText(el.querySelectorAll('.ph2-title .ln'), { type: 'words,chars', charsClass: 'hc' });
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .from('.ph2-orb', { scale: 0.4, autoAlpha: 0, duration: 1.6 }, 0)
        .from('.ph2-kanji', { scale: 1.5, rotate: -14, autoAlpha: 0, duration: 1.4 }, 0)
        .from('.ph2-far, .ph2-mid', { yPercent: 30, duration: 1.2, stagger: 0.1 }, 0.05)
        .from('.ph2-meta > *', { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.15)
        .from(split.chars, { yPercent: 120, rotate: 10, opacity: 0, stagger: 0.03, duration: 1 }, 0.2)
        .from('.ph2-body > *, .ph2-stats li', { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.5)
        .fromTo('.ph2-enso path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0.4)
        .from('.ph2-lines', { autoAlpha: 0, scale: 0.6, duration: 1.2 }, 0.5)
        .from('.ph2-art', { scale: 0.7, rotate: -6, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.8)' }, 0.55)
        .from('.ph2-ninja', { y: 80, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, 0.75)
        .fromTo('.ph2-flash', { opacity: 0.9 }, { opacity: 0, duration: 0.35, ease: 'power1.out' }, 0.95)
        .from('.ph2-sfx', { scale: 3, rotate: -20, autoAlpha: 0, duration: 0.25, ease: 'power4.in' }, 0.95)
        .from('.ph2-tapes .tape', { xPercent: (i) => (i ? 110 : -110), duration: 1, ease: 'power3.out' }, 0.8)
        .from('.ph2-vert', { y: -40, autoAlpha: 0, duration: 0.9 }, 0.6)
        .from('.pro-caret', { autoAlpha: 0, duration: 0.2 }, 1);
      unsub = onIntroDone(() => tl.play());

      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 } })
        .to('.ph2-copy', { yPercent: -18, autoAlpha: 0.2 }, 0)
        .to('.ph2-stage', { yPercent: -10, scale: 0.94 }, 0)
        .to('.ph2-kanji', { yPercent: 30, rotate: 8 }, 0)
        .to('.ph2-orb', { yPercent: 20 }, 0)
        .to('.ph2-tapes', { yPercent: 120, autoAlpha: 0 }, 0);
    }, el);
    return () => { unsub(); ctx.revert(); };
  }, []);

  // the stage leans toward the pointer
  useEffect(() => {
    const st = ref.current?.querySelector('.ph2-stage-tilt');
    let raf, rx = 0, ry = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (window.scrollY > window.innerHeight * 1.2) return;
      const dy = store.mouse.x * 8 - ry, dx = store.mouse.y * 6 - rx;
      if (Math.abs(dx) + Math.abs(dy) < 0.01) return;
      ry += dy * 0.06; rx += dx * 0.06;
      if (st) st.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className={`phero2 phero2--${orb} ${center ? 'phero2--center' : ''}`} ref={ref}>
      <div className="ph2-stars" aria-hidden="true" />
      <div className="ph2-orb" aria-hidden="true" />
      <Layer className="ph2-far"><Ridge seed={kanji.charCodeAt(0) % 97} base={760} peaks={6} height={260} spread={190} fill="#18181e" /></Layer>
      <Layer className="ph2-mid"><Ridge seed={(kanji.charCodeAt(0) % 89) + 7} base={840} peaks={5} height={170} spread={160} fill="#101014" /></Layer>
      <span className="ph2-kanji" aria-hidden="true">{kanji}</span>
      {vert && <span className="ph2-vert" aria-hidden="true">{vert}</span>}

      <div className="wrap ph2-inner">
        <div className="ph2-copy">
          <div className="ph2-meta">
            <b className="pro-weekly">{vol}</b>
            <span className="mono">{ep}</span>
            <span className="mono ph2-jp">{jp}</span>
          </div>
          <h1 className="ph2-title" aria-label={`${title} ${accent || ''}`.trim()}>
            <span className="ln">{title}</span>
            {accent && <span className="ln"><em className="pro-glitch">{accent}</em><i className="pro-caret" aria-hidden="true" /></span>}
          </h1>
          <div className="ph2-body">{children}</div>
          {stats.length > 0 && (
            <ul className="ph2-stats">
              {stats.map(([v, l]) => <li key={l}><b>{v}</b><span>{l}</span></li>)}
            </ul>
          )}
        </div>

        <div className="ph2-stage" aria-hidden="true">
          <div className="ph2-lines" />
          <svg className="ph2-enso" viewBox="-6 -6 112 112">
            <path pathLength="1" d="M78 14 C62 2 30 2 14 22 C-2 42 4 76 30 92 C56 106 90 94 98 64 C102 46 96 30 86 20" />
          </svg>
          <div className="ph2-stage-tilt">
            <div className="ph2-art">{art}</div>
            <div className={`actor actor--line ph2-ninja ${glow ? 'actor--glow' : ''}`}><Rig pose={POSES[pose]} /></div>
            <div className="ph2-rock" />
          </div>
        </div>
      </div>

      <div className="ph2-flash" aria-hidden="true" />
      {tape.length > 0 && (
        <div className="pro-tapes ph2-tapes" aria-hidden="true">
          <Tape words={tape} className="tape--ink" reverse />
          <Tape words={tape} className="tape--red" />
        </div>
      )}
    </section>
  );
}
