import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Mail, Github, Linkedin, ArrowRight } from 'lucide-react';
import AttentionText from '../components/AttentionText/AttentionText';
import { scrollStore } from './scrollStore';
import PillarVisual from './PillarVisuals';
import JourneyVisual from './JourneyVisuals';
import NeuralNebula from './backdrops/NeuralNebula';
import './HomePage.css';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

const SCRAMBLE_CHARS = '01<>/{}[]#*+=';
// enter: play · leave: keep · come back from below: restart · scroll back above: reset (replays next time)
const REPLAY = 'play none restart reset';

const HomeCanvas = lazy(() => import('./three/HomeCanvas'));


const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HomePage({ theme, isMobile, introReady, bioPillars, timelineData, projectsSlot }) {
  const rootRef = useRef(null);
  const introTl = useRef(null);
  const [reduced] = useState(prefersReducedMotion);
  const [canvasReady, setCanvasReady] = useState(false);
  const onCanvasReady = useCallback(() => setCanvasReady(true), []);

  // ---------- Scroll choreography ----------
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    scrollStore.stage = 0;
    scrollStore.progress = 0;

    const ctx = gsap.context(() => {
      // Whole-page progress → 3D scene + progress bar
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrollStore.progress = self.progress;
          scrollStore.velocity = self.getVelocity();
        },
      });

      // Each [data-stage] section morphs the particles into its shape as it scrolls in
      const stageSections = gsap.utils.toArray('[data-stage]', root).filter((el) => Number(el.dataset.stage) > 0);
      const parts = stageSections.map(() => 0);
      stageSections.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          // begin only once the section is clearly scrolling in, so the hero bust is crisp at load
          start: 'top 70%',
          end: 'top 25%',
          onUpdate: (self) => {
            parts[i] = self.progress;
            scrollStore.stage = parts.reduce((a, b) => a + b, 0);
          },
        });
      });

      if (reduced) return;

      // ---- Hero intro (played once the page loader is gone) ----
      const heroSub = new SplitText('.h3-hero-sub', { type: 'words', mask: 'words' });
      const title = new SplitText('.h3-hero-title .line', { type: 'lines,chars', linesClass: 'h3-line', charsClass: 'h3-char', mask: 'lines' });
      introTl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .from(title.chars, {
          yPercent: 120, rotateX: -90, rotateY: 25, z: -120, filter: 'blur(10px)', opacity: 0,
          transformOrigin: '50% 100% -40px', duration: 1.4, stagger: { each: 0.035, from: 'start' },
        })
        .fromTo('.h3-bang', { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(3)' }, '-=0.7')
        .from(heroSub.words, { yPercent: 100, opacity: 0, duration: 0.9, stagger: 0.025 }, '-=0.9')
        .fromTo('.h3-hero .about-socials > *', { y: 24, scale: 0.85, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: 'back.out(1.8)', clearProps: 'transform,opacity,visibility' }, '-=0.75')
        .from('.h3-hero-bg', { scale: 1.12, autoAlpha: 0, duration: 2, ease: 'power2.out' }, 0);

      // replay the hero intro whenever you scroll back up to it
      ScrollTrigger.create({
        trigger: '.h3-hero',
        start: 'top top',
        end: 'bottom top',
        onEnterBack: () => introTl.current?.restart(),
      });

      // ---- Hero scroll-out ----
      gsap.to('.h3-hero-copy', {
        yPercent: -18, autoAlpha: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.h3-hero', start: 'top top', end: 'bottom 20%', scrub: true },
      });
      gsap.to('.h3-hero-bg', {
        yPercent: 18, scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: '.h3-hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // ---- Section kickers + headings ----
      // triggers inside a pinned section must know about the pin, or they think they've scrolled away
      const pinnedIn = (el) => (isMobile ? undefined : el.closest('.h3-bio, .h3-journey, .h3-pillars') || undefined);
      gsap.utils.toArray('.h3-heading', root).forEach((h) => {
        const pc = pinnedIn(h);
        const split = new SplitText(h, { type: 'words,chars', charsClass: 'h3-char' });
        gsap.set(h, { perspective: 800 });
        gsap.from(split.chars, {
          opacity: 0, yPercent: 80, rotateX: -100, z: -80, filter: 'blur(8px)',
          transformOrigin: '50% 50% -30px',
          duration: 1.1, ease: 'expo.out', stagger: { each: 0.022, from: 'random' },
          scrollTrigger: { trigger: h, toggleActions: REPLAY, start: 'top 85%', pinnedContainer: pc },
        });
        // a thin accent line wipes under the heading
        gsap.fromTo(h, { '--rule': 0 }, { '--rule': 1, duration: 1.2, ease: 'expo.inOut', delay: 0.3, scrollTrigger: { trigger: h, toggleActions: REPLAY, start: 'top 85%', pinnedContainer: pc } });
      });

      // ---- About: highlighter scrub ----
      // Pinned on desktop: each word inks from grey to black as you scroll, and key phrases get an
      // orange-red marker swipe the moment the ink reaches them.
      const bioSplit = new SplitText('.h3-bio .about-bio, .h3-bio .about-bio-highlight', { type: 'words' });
      const words = bioSplit.words;
      const STEP = 0.05;
      const bioTl = gsap.timeline({
        scrollTrigger: isMobile
          ? { trigger: '.h3-bio-copy', start: 'top 75%', end: 'bottom 45%', scrub: 0.6 }
          : { trigger: '.h3-bio', start: 'top top', end: '+=140%', scrub: 0.6, pin: true, anticipatePin: 1 },
      });
      bioTl.fromTo(words, { opacity: 0.14 }, { opacity: 1, duration: 0.25, stagger: STEP, ease: 'none' }, 0);
      gsap.utils.toArray('.h3-mark', root).forEach((mark) => {
        const first = words.findIndex((w) => mark.contains(w));
        const count = words.filter((w) => mark.contains(w)).length;
        bioTl.fromTo(mark, { '--hl': 0 }, { '--hl': 1, duration: Math.max(0.3, count * STEP), ease: 'power1.inOut' }, Math.max(0, first) * STEP + 0.1);
      });
      bioTl.to({}, { duration: 0.4 }); // hold the finished paragraph briefly before un-pinning

      // ---- Journey ----
      const milestones = gsap.utils.toArray('.h3-milestone', root);
      const buildMilestone = (m, st) => {
        const body = m.querySelector('.h3-milestone-body');
        const date = body.querySelector('.timeline-date');
        const titleSplit = new SplitText(body.querySelector('.h3-milestone-title'), { type: 'words', mask: 'words' });
        const descSplit = new SplitText(body.querySelector('.timeline-description'), { type: 'words', mask: 'words' });
        const counter = m.querySelector('[data-count]');
        const tl = gsap.timeline({ scrollTrigger: { ...st, toggleActions: REPLAY }, defaults: { ease: 'expo.out' } });
        tl.from(body, { x: isMobile ? 0 : 50, y: isMobile ? 30 : 0, autoAlpha: 0, duration: 1.1 })
          .to(date, { duration: 1.1, scrambleText: { text: date.textContent, chars: SCRAMBLE_CHARS, speed: 0.6 }, ease: 'none' }, 0)
          .from(titleSplit.words, { yPercent: 110, rotate: 4, duration: 1, stagger: 0.06 }, 0.1)
          .from(body.querySelector('.timeline-institution'), { autoAlpha: 0, x: -16, duration: 0.8 }, 0.35)
          .from(descSplit.words, { yPercent: 100, duration: 0.8, stagger: 0.012 }, 0.4)
          .from(m.querySelector('.h3-milestone-media'), { scale: 0.86, rotateY: isMobile ? 0 : -14, autoAlpha: 0, duration: 1.2, transformPerspective: 1000 }, 0);
        if (counter) {
          const target = parseFloat(counter.dataset.count);
          const obj = { v: 0 };
          counter.textContent = '0.0%';
          tl.to(obj, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: () => { counter.textContent = `${obj.v.toFixed(1)}%`; } }, 0.3);
        }
      };

      if (isMobile) {
        gsap.fromTo('.h3-journey-line span', { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: '.h3-journey-list', start: 'top 70%', end: 'bottom 70%', scrub: true },
        });
        milestones.forEach((m) => {
          buildMilestone(m, { trigger: m, start: 'top 75%' });
          ScrollTrigger.create({ trigger: m, start: 'top 55%', toggleClass: { targets: m.querySelector('.h3-milestone-dot'), className: 'is-active' } });
        });
      } else {
        // Pin the section and translate the track sideways; one panel per milestone.
        const track = root.querySelector('.h3-journey-list');
        const viewport = root.querySelector('.h3-journey-viewport');
        const fill = root.querySelector('.h3-hprogress-fill');
        const ticks = gsap.utils.toArray('.h3-hprogress-tick', root);
        const distance = () => track.scrollWidth - viewport.clientWidth;
        const hTween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.h3-journey',
            start: 'top top',
            end: () => `+=${distance() * 1.15}`,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              fill.style.transform = `scaleX(${self.progress})`;
              const active = Math.min(ticks.length - 1, Math.round(self.progress * (ticks.length - 1)));
              ticks.forEach((t, k) => t.classList.toggle('is-active', k <= active));
            },
          },
        });
        milestones.forEach((m, i) => {
          if (i === 0) buildMilestone(m, { trigger: '.h3-journey', start: 'top 55%' });
          else buildMilestone(m, { trigger: m, containerAnimation: hTween, start: 'left 70%' });
        });
      }

      // ---- Pillars ----
      const pillars = gsap.utils.toArray('.h3-pillar', root);
      if (isMobile) {
        gsap.from(pillars, {
          y: 90, rotateX: 20, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, transformPerspective: 1000,
          scrollTrigger: { trigger: '.h3-pillars-grid', toggleActions: REPLAY, start: 'top 80%' },
        });
      } else {
        // Deck fan-out: the three cards start stacked on the middle slot, fan out like a hand of
        // cards, then settle into the row. Scrubbed while the section is pinned.
        const grid = root.querySelector('.h3-pillars-grid');
        const slot = () => pillars[1].offsetLeft - pillars[0].offsetLeft;
        const deck = gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: 'center 55%',
            end: '+=110%',
            scrub: 0.8,
            pin: '.h3-pillars',
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
          defaults: { ease: 'power2.inOut' },
        });
        deck
          .fromTo(pillars, {
            x: (k) => (1 - k) * slot(),
            y: (k) => Math.abs(k - 1) * 18 + 40,
            rotate: (k) => (k - 1) * -4,
            scale: 0.88,
            zIndex: (k) => 3 - Math.abs(k - 1),
          }, {
            x: (k) => (1 - k) * slot() * 0.55,
            y: (k) => Math.abs(k - 1) * 46,
            rotate: (k) => (k - 1) * 11,
            scale: 0.94,
            duration: 1,
          })
          .to(pillars, { x: 0, y: 0, rotate: 0, scale: 1, duration: 1, ease: 'power3.out' })
          .to({}, { duration: 0.25 });
      }
      gsap.utils.toArray('.h3-pillar .pillar-title', root).forEach((t, k) => {
        gsap.to(t, {
          duration: 1.2, delay: 0.35 + k * 0.14, ease: 'none',
          scrambleText: { text: t.textContent, chars: SCRAMBLE_CHARS, speed: 0.5, revealDelay: 0.2 },
          scrollTrigger: { trigger: '.h3-pillars-grid', toggleActions: REPLAY, start: 'top 80%', pinnedContainer: pinnedIn(t) },
        });
      });

      // ---- Projects ----
      gsap.from('.h3-projects-body', {
        y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.h3-projects', toggleActions: REPLAY, start: 'top 75%' },
      });

      // ---- Outro ----
      const outroSplit = new SplitText('.h3-outro-title', { type: 'lines,words,chars', linesClass: 'h3-line', charsClass: 'h3-char', mask: 'lines' });
      gsap.from(outroSplit.chars, {
        yPercent: 120, rotateX: -80, filter: 'blur(8px)', opacity: 0, duration: 1.3, ease: 'expo.out',
        stagger: { each: 0.025, from: 'start' },
        scrollTrigger: { trigger: '.h3-outro', toggleActions: REPLAY, start: 'top 60%' },
      });
      gsap.fromTo('.h3-outro .h3-reveal', { y: 30, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.h3-outro', toggleActions: REPLAY, start: 'top 50%' },
      });
      ScrollTrigger.sort();
    }, root);
    ScrollTrigger.refresh();

    // Layout shifts once fonts/images arrive → recompute trigger positions
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    const imgs = Array.from(root.querySelectorAll('img'));
    imgs.forEach((img) => img.complete || img.addEventListener('load', refresh, { once: true }));

    return () => {
      imgs.forEach((img) => img.removeEventListener('load', refresh));
      introTl.current = null;
      ctx.revert();
      scrollStore.stage = 0;
      scrollStore.progress = 0;
    };
  }, [reduced, isMobile]);

  useEffect(() => {
    if (introReady) introTl.current?.play();
  }, [introReady, isMobile]);

  // Pointer-driven tilt for pillar cards (CSS variables, no re-render)
  const onPillarMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`);
    el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const onPillarLeave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  return (
    <div className={`home3d ${canvasReady ? 'is-3d-ready' : ''}`} ref={rootRef}>
      {!reduced && (
        <Suspense fallback={null}>
          <HomeCanvas theme={theme} isMobile={isMobile} onReady={onCanvasReady} />
        </Suspense>
      )}

      {/* 0 · HERO */}
      <section className="h3-section h3-hero" data-stage="0">
        <div className="h3-hero-bg" aria-hidden="true">
          <NeuralNebula theme={theme} />
        </div>
        <div className="h3-hero-copy">
          <h1 className="h3-hero-title">
            <span className="line">Hi there, I'm</span>
            <span className="line">Ayush Singh<span className="h3-bang">!</span></span>
          </h1>
          <p className="h3-hero-sub h3-reveal">
            Pursuing B.Tech in Artificial Intelligence at IIT Gandhinagar (Entered 2025)
          </p>
          <div className="about-socials h3-reveal">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ayushspna4040@gmail.com" target="_blank" rel="noreferrer" className="footer-social-link h3-btn-primary">
              <Mail size={16} /> Email Me
            </a>
            <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" className="footer-social-link">
              <Github size={16} /> GitHub
            </a>
            <a href="https://linkedin.com/in/ayushxphoenix" target="_blank" rel="noreferrer" className="footer-social-link">
              <Linkedin size={16} /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* 1 · BIO */}
      <section className="h3-section h3-bio" data-stage="1">
        <div className="h3-bio-copy">
          <h2 className="h3-heading">Intelligence, engineered into interfaces.</h2>
          <AttentionText>
            <p className="about-bio">
              I design and engineer intelligent applications at the intersection of <mark className="h3-mark">Artificial Intelligence</mark> and <mark className="h3-mark">Full-Stack Web Development</mark>. I focus on translating complex <mark className="h3-mark">neural networks</mark> into beautiful, responsive, and <mark className="h3-mark">production-ready</mark> interfaces, bridging the gap between machine learning models and user-friendly software architectures.
            </p>
            <p className="about-bio-highlight">
              Let's build something <mark className="h3-mark">intelligent</mark>. Exploring ways to merge deep learning software with scalable systems and modern frontend aesthetics.
            </p>
          </AttentionText>
        </div>
      </section>

      {/* 2 · JOURNEY */}
      <section className="h3-section h3-journey" data-stage="2">
        <header className="h3-section-head">
          <h2 className="h3-heading">Academic Journey</h2>
        </header>
        <div className="h3-journey-viewport">
        <div className="h3-journey-list">
          <div className="h3-journey-line" aria-hidden="true"><span /></div>
          {timelineData.map((item, idx) => {
            return (
              <article className={`h3-milestone ${idx % 2 ? 'is-flipped' : ''}`} key={item.title}>
                <span className="h3-milestone-dot" aria-hidden="true" />
                <div className="h3-milestone-media">
                  <JourneyVisual index={idx} item={item} />
                </div>
                <div className="h3-milestone-body">
                  <div className="timeline-date">{item.date}</div>
                  <h3 className="h3-milestone-title">{item.title}</h3>
                  <div className="timeline-institution">{item.institution}</div>
                  <p className="timeline-description">{item.desc}</p>
                  {item.giantPercentage && (
                    <div className="h3-giant" data-count={parseFloat(item.giantPercentage)}>{item.giantPercentage}</div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        </div>
        <div className="h3-hprogress" aria-hidden="true">
          <div className="h3-hprogress-bar"><span className="h3-hprogress-fill" /></div>
          <div className="h3-hprogress-ticks">
            {timelineData.map((item) => (
              <span className="h3-hprogress-tick" key={item.title}>{item.title.replace(/\s*\(.*\)$/, '')}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · PILLARS */}
      <section className="h3-section h3-pillars" data-stage="3">
        <header className="h3-section-head">
          <h2 className="h3-heading h3-heading--xl">Three disciplines, one system.</h2>
        </header>
        <div className="h3-pillars-grid">
          {bioPillars.map((pillar, idx) => (
            <article className="h3-pillar" key={pillar.title} onPointerMove={onPillarMove} onPointerLeave={onPillarLeave}>
              <div className="h3-pillar-inner">
                <div className="h3-pillar-visual"><PillarVisual index={idx} /></div>
                <div className="pillar-card-header">
                  <span className="pillar-icon-wrapper">{pillar.icon}</span>
                  <span className="pillar-tag">{pillar.tag}</span>
                </div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="h3-section h3-projects">
        <header className="h3-section-head">
          <h2 className="h3-heading">Selected projects</h2>
        </header>
        <div className="h3-projects-body">{projectsSlot}</div>
      </section>

      {/* 4 · OUTRO */}
      <section className="h3-section h3-outro" data-stage="4">
        <div className="h3-outro-copy">
          <h2 className="h3-outro-title">Let's build something <span className="h3-accent-text">intelligent.</span></h2>
          <p className="h3-outro-sub h3-reveal">
            Research collaborations, AI products, or a full-stack build, my inbox is always open.
          </p>
          <div className="about-socials h3-reveal">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ayushspna4040@gmail.com" target="_blank" rel="noreferrer" className="footer-social-link h3-btn-primary">
              Start a conversation <ArrowRight size={16} />
            </a>
            <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" className="footer-social-link">
              <Github size={16} /> GitHub
            </a>
          </div>
          <p className="h3-outro-hint h3-reveal">Click the landscape below to drop a ball. It runs real Adam updates until it converges.</p>
        </div>
      </section>
    </div>
  );
}
