import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ArrowUpRight, Github, X } from 'lucide-react';
import { BOSSES, CORE_FOCUS, FEATURED, PROJECTS, PROJECT_CATEGORIES, TECH_LOGOS, primaryAxis } from '../data/portfolio';
import { useReveal } from '../core/reveal';
import { reducedMotion } from '../core/store';
import { setScrollLocked } from '../core/smooth';
import PageHero from '../components/PageHero';
import { FilesArt } from '../components/HeroArt';
import ProjectLogo from '../components/ProjectLogo';
import Radar from '../components/Radar';
import '../styles/pages.css';

gsap.registerPlugin(Flip);

const JP = { All: '全部', AI: '知能', Web: '網', Systems: '構造', Mobile: '携帯' };

function Detail({ project, onClose }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!project) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      if (reducedMotion()) return;
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.pd-backdrop', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
        .fromTo('.pd-sheet', { xPercent: 105, skewX: -6 }, { xPercent: 0, skewX: 0, duration: 0.8 }, 0)
        .from('.pd-anim', { y: 40, autoAlpha: 0, stagger: 0.05, duration: 0.8 }, 0.25);
    }, el);
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    el.querySelector('.pd-close')?.focus();
    return () => { window.removeEventListener('keydown', onKey); ctx.revert(); };
  }, [project, onClose]);

  if (!project) return null;
  return (
    <div className="pd" ref={ref} role="dialog" aria-modal="true" aria-label={project.title} data-lenis-prevent>
      <div className="pd-backdrop tone" onClick={onClose} />
      <aside className="pd-sheet">
        <button className="pd-close btn btn--icon" onClick={onClose} aria-label="Close"><X size={20} /></button>
        <div className="pd-art pd-anim"><ProjectLogo project={project} /></div>
        <div className="pd-content">
          <span className="pd-anim pd-tags"><span className="tag tag--red">{project.category}</span><span className="tag">Leans {primaryAxis(project)}</span></span>
          <h2 className="pd-title pd-anim">{project.title}</h2>
          <p className="pd-desc pd-anim">{project.desc}</p>
          <h3 className="pd-h pd-anim">Key features</h3>
          <ol className="pd-features">
            {project.features.map((f) => <li className="pd-anim" key={f}>{f}</li>)}
          </ol>
          <h3 className="pd-h pd-anim">Built with</h3>
          <ul className="pc-stack pd-anim">
            {project.stack.map((s) => <li key={s}>{TECH_LOGOS[s] && <img src={TECH_LOGOS[s]} alt="" />}{s}</li>)}
          </ul>
          <h3 className="pd-h pd-anim">Focus profile <small>(dashed = my overall profile)</small></h3>
          <div className="pd-radar pd-anim"><Radar base={CORE_FOCUS} overlay={project.radar} size={360} /></div>
          <div className="pd-links pd-anim">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn btn--red">Open live <ArrowUpRight size={16} /></a>}
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn btn--line"><Github size={16} /> Source</a>}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function Projects2() {
  const root = useRef(null);
  const grid = useRef(null);
  const flipState = useRef(null);
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);

  const counts = useMemo(() => Object.fromEntries(PROJECT_CATEGORIES.map((c) => [c, c === 'All' ? PROJECTS.length : PROJECTS.filter((p) => p.category === c).length])), []);

  useReveal(root, () => {
    gsap.fromTo('.pgrid .pcard', { y: 120, rotateX: 25, rotate: (i) => (i % 2 ? 3 : -3), autoAlpha: 0 }, {
      y: 0, rotateX: 0, rotate: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: 0.07, clearProps: 'transform',
      scrollTrigger: { trigger: '.pgrid', start: 'top 85%' },
    });
  });

  const choose = (c) => {
    if (c === cat) return;
    flipState.current = Flip.getState(grid.current.querySelectorAll('.pcard'));
    setCat(c);
  };

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.7, ease: 'expo.inOut', absolute: true, stagger: 0.03, scale: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.6, rotate: -8 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(1.6)' }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.6, rotate: 8, duration: 0.4 }),
    });
    flipState.current = null;
  }, [cat]);

  const close = useCallback(() => setOpen(null), [setOpen]);
  useEffect(() => {
    setScrollLocked(!!open);
    return () => setScrollLocked(false);
  }, [open]);

  return (
    <div className="page projects2" ref={root}>
      <PageHero ep="VOL.02 · FILES" jp="作品集 — Case files" kanji="作" title="Every project," accent="on file." pose="guard" glow orb="sun"
        art={<FilesArt />} vert="作品集 ── 戦いの記録 ── 第二巻"
        tape={['CASE FILES', '作品集', 'AI TOOLING', 'CLOUD', 'WEB PLATFORMS', 'MOBILE', '撃破', 'OPEN A FILE']}
        stats={[[PROJECTS.length, 'Projects'], [FEATURED.length, 'Bosses defeated'], [PROJECT_CATEGORIES.length - 1, 'Disciplines']]}>
        <p className="lead">{PROJECTS.length} builds across AI tooling, cloud infrastructure, web platforms and mobile. Open a file for the full breakdown.</p>
      </PageHero>

      <section className="paper pfilter-wrap">
        <div className="wrap">
          <div className="pfilter" role="tablist" aria-label="Filter projects">
            {PROJECT_CATEGORIES.map((c) => (
              <button key={c} role="tab" aria-selected={cat === c} className={`pfilter-btn ${cat === c ? 'is-on' : ''}`} onClick={() => choose(c)}>
                <em>{JP[c]}</em>{c}<i>{counts[c]}</i>
              </button>
            ))}
          </div>

          <div className="pgrid" ref={grid}>
            {PROJECTS.map((p, i) => {
              const hidden = cat !== 'All' && p.category !== cat;
              return (
                <article key={p.slug} className={`pcard ${hidden ? 'is-hidden' : ''}`} data-flip-id={p.slug} style={{ display: hidden ? 'none' : undefined }}>
                  <button className="pcard-hit" onClick={() => setOpen(p)} aria-label={`Open ${p.title}`} data-cursor="OPEN" />
                  <div className="pcard-art">
                    <ProjectLogo project={p} />
                    <span className="pcard-no">{String(i + 1).padStart(2, '0')}</span>
                    <span className="pcard-cat">{p.category}</span>
                    {BOSSES[p.slug] && <span className="pcard-stamp" aria-hidden="true">撃破</span>}
                  </div>
                  <div className="pcard-body">
                    {BOSSES[p.slug] && <span className="pcard-boss mono">VS <b>{BOSSES[p.slug][0]}</b> {BOSSES[p.slug][1]}</span>}
                    <h2 className="pcard-title">{p.title}</h2>
                    <p className="pcard-desc">{p.desc}</p>
                    <div className="pcard-foot">
                      <span className="mono">Type · {primaryAxis(p)}</span>
                      <span className="pcard-open">Open file →</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Detail project={open} onClose={close} />
    </div>
  );
}
