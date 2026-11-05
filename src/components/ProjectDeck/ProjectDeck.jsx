import { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Github, ArrowUpRight } from 'lucide-react';
import './ProjectDeck.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Projects page: a 3D card deck driven by native `position: sticky` + scrubbed GSAP transforms.
 * As each new card slides over, the one beneath tilts back, shrinks and dims (transform/opacity
 * only — no React state on scroll). A sticky rail tracks progress, and a velocity-reactive tech
 * marquee runs between the header and the deck.
 */
export default function ProjectDeck({ projects, theme, techLogos = {}, isDarkLogo = () => false }) {
  const root = useRef(null);
  const total = projects.length;
  const pad = (n) => String(n).padStart(2, '0');

  const techs = useMemo(() => {
    const seen = new Set();
    projects.forEach((p) => p.stack.forEach((t) => seen.add(t)));
    return [...seen];
  }, [projects]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.innerWidth <= 768;
    let marqueeTick = null;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.pd-card', el);
      const counter = el.querySelector('.pd-rail-num');
      const railItems = gsap.utils.toArray('.pd-rail-list li', el);

      const setActive = (i) => {
        const idx = Math.max(0, Math.min(total - 1, i));
        if (counter) counter.textContent = pad(idx + 1);
        railItems.forEach((li, k) => li.classList.toggle('is-active', k === idx));
      };
      setActive(0);


      cards.forEach((card, i) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 55%',
          onEnter: () => setActive(i),
          onLeaveBack: () => setActive(i - 1),
        });
        if (reduced) return;

        // content reveal when the card arrives
        gsap.from(card.querySelectorAll('.pd-reveal'), {
          y: 26, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06,
          scrollTrigger: { trigger: card, start: 'top 75%' },
        });

        // the card beneath tilts back as the next one covers it
        const next = cards[i + 1];
        if (!next) return;
        const stickyTop = parseFloat(getComputedStyle(next).top) || 100;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: next, start: 'top bottom', end: `top ${stickyTop}px`, scrub: true },
        });
        tl.to(card.querySelector('.pd-card-inner'), {
          scale: mobile ? 0.92 : 0.88,
          rotateX: mobile ? 0 : 9,
          yPercent: mobile ? -2 : -5,
          ease: 'none',
        }, 0).to(card.querySelector('.pd-shade'), { opacity: 1, ease: 'none' }, 0);
      });

      if (reduced) return;

      // header title
      const split = new SplitText(el.querySelector('.pd-title'), { type: 'words,chars', mask: 'chars' });
      gsap.from(split.chars, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.025, delay: 0.15 });
      gsap.from(el.querySelectorAll('.pd-head .pd-fade'), { y: 20, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.35 });

      // velocity-reactive marquee: speeds up with scroll and follows scroll direction
      const track = el.querySelector('.pd-marquee-track');
      if (track) {
        const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
        let dir = 1;
        let boost = 0;
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            dir = self.direction;
            boost = Math.max(boost, Math.min(Math.abs(self.getVelocity()) / 250, 7));
          },
        });
        marqueeTick = () => {
          boost *= 0.93;
          loop.timeScale(dir * (1 + boost));
        };
        gsap.ticker.add(marqueeTick);
      }
    }, el);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    return () => {
      if (marqueeTick) gsap.ticker.remove(marqueeTick);
      ctx.revert();
    };
  }, [total]);

  // pointer spotlight + subtle logo parallax (CSS variables only)
  const onMove = (e) => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`);
    c.style.setProperty('--my', `${e.clientY - r.top}px`);
    c.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    c.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  return (
    <section className="pd" ref={root}>
      <header className="pd-head">
        <h2 className="pd-title">Featured Repositories</h2>
        <p className="pd-sub pd-fade">
          Web platforms, deep learning applications and edge telemetry systems, each built end to end.
        </p>
      </header>

      <div className="pd-marquee" aria-hidden="true">
        <div className="pd-marquee-track">
          {[0, 1].map((k) => (
            <div className="pd-marquee-group" key={k}>
              {techs.map((t) => (
                <span className="pd-marquee-item" key={`${k}-${t}`}>
                  {techLogos[t] && (
                    <img src={techLogos[t]} alt="" style={{ filter: theme === 'dark' && isDarkLogo(techLogos[t]) ? 'invert(1)' : 'none' }} />
                  )}
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="pd-layout">
        <aside className="pd-rail" aria-hidden="true">
          <div className="pd-rail-inner">
            <div className="pd-rail-count">
              <span className="pd-rail-num">01</span>
              <span className="pd-rail-total">/ {pad(total)}</span>
            </div>
            <ol className="pd-rail-list">
              {projects.map((p) => <li key={p.title}>{p.title.replace(/\s*\(.*\)$/, '')}</li>)}
            </ol>
          </div>
        </aside>

        <div className="pd-stack">
          {projects.map((p, i) => {
            return (
              <article className="pd-card" key={p.title} style={{ '--i': i, zIndex: i + 1 }}>
                <div className="pd-card-inner" onPointerMove={onMove}>
                  <div className="pd-spot" aria-hidden="true" />
                  <div className={`pd-watermark ${p.hasImageLogo ? 'is-img' : ''}`} aria-hidden="true">{p.logo}</div>

                  <div className="pd-card-main">
                    <div className="pd-card-top pd-reveal">
                      <div className={`project-logo-container ${p.hasImageLogo ? 'white-bg' : ''}`}>{p.logo}</div>
                      <div className="pd-card-titles">
                        <span className="pd-card-num">{pad(i + 1)} / {pad(total)}</span>
                        <h3 className="pd-card-title">{p.title}</h3>
                      </div>
                    </div>
                    <p className="pd-desc pd-reveal">{p.desc}</p>
                    <div className="pd-stack-pills pd-reveal">
                      {p.stack.map((t) => (
                        <span className="pd-pill" key={t} title={t}>
                          {techLogos[t] && (
                            <img src={techLogos[t]} alt="" style={{ filter: theme === 'dark' && isDarkLogo(techLogos[t]) ? 'invert(1)' : 'none' }} />
                          )}
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="pd-actions pd-reveal">
                      {p.liveUrl && (
                        <a className="pd-btn is-primary" href={p.liveUrl} target="_blank" rel="noreferrer">
                          Visit site <ArrowUpRight size={16} />
                        </a>
                      )}
                      <a className="pd-btn" href={p.repoUrl || 'https://github.com/destopianpirate'} target="_blank" rel="noreferrer">
                        <Github size={16} /> Source
                      </a>
                    </div>
                  </div>

                  {p.features?.length > 0 && (
                    <div className="pd-features pd-reveal">
                      <div className="pd-features-head">Key features</div>
                      <ul>
                        {p.features.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="pd-shade" aria-hidden="true" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
