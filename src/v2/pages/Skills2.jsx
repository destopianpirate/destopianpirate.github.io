import { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Code, Cpu, Database, Globe, Server, Terminal } from 'lucide-react';
import { CORE_FOCUS, PROJECTS, RADAR_AXES, SKILLS, SKILL_COUNT, TECH_LOGOS } from '../data/portfolio';
import { useReveal } from '../core/reveal';
import PageHero from '../components/PageHero';
import Radar from '../components/Radar';
import { TLink } from '../components/Shell';
import '../styles/pages.css';

const ICONS = { terminal: Terminal, code: Code, server: Server, database: Database, cpu: Cpu, globe: Globe };

export default function Skills2() {
  const root = useRef(null);
  const [sel, setSel] = useState(null);
  const project = PROJECTS.find((p) => p.slug === sel);

  // which tools show up in the most projects
  const usage = useMemo(() => {
    const m = {};
    PROJECTS.forEach((p) => p.stack.forEach((s) => { (m[s] ||= []).push(p.title.replace(/\s*\(.*\)$/, '').replace(/ - .*$/, '')); }));
    return Object.entries(m).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  }, []);
  const maxUse = usage[0]?.[1].length || 1;

  useReveal(root, () => {
    gsap.utils.toArray('.sk-fill').forEach((b) => {
      gsap.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 94%', toggleActions: 'play none none reverse' } });
    });
    gsap.utils.toArray('.use-bar i').forEach((b) => {
      gsap.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 95%' } });
    });
  });

  return (
    <div className="page skills2" ref={root}>
      <PageHero ep="VOL.02 · ARSENAL" jp="武器庫 — Skill tree" kanji="技" title="The full" accent="arsenal.">
        <p className="lead">{SKILL_COUNT} tools across {SKILLS.length} disciplines. Compare any project's focus against my overall profile below.</p>
      </PageHero>

      {/* radar compare */}
      <section className="paper sk-compare">
        <div className="wrap sk-compare-grid">
          <div className="panel-frame sk-radar" data-anim="tilt">
            <span className="mono sk-radar-cap">{project ? `${project.title} vs. overall` : 'Overall focus'}</span>
            <Radar base={CORE_FOCUS} overlay={project?.radar} size={440} />
          </div>
          <div className="sk-pick">
            <span className="kicker">Status screen</span>
            <h2 className="h-xl" data-anim="chars">Pick a project.</h2>
            <p className="lead" data-anim="up">The red shape is the project's focus; the dashed outline is my overall profile.</p>
            <div className="sk-chips" data-anim="stagger" data-each="0.03">
              <button className={`sk-chip ${!sel ? 'is-on' : ''}`} onClick={() => setSel(null)}>Overall</button>
              {PROJECTS.map((p) => (
                <button key={p.slug} className={`sk-chip ${sel === p.slug ? 'is-on' : ''}`} onClick={() => setSel(p.slug)}>
                  {p.title.replace(/\s*\(.*\)$/, '').replace(/ - .*$/, '')}
                </button>
              ))}
            </div>
            <div className="sk-axes">
              {RADAR_AXES.map((a) => {
                const v = (project?.radar || CORE_FOCUS)[a];
                return (
                  <div className="sk-axis" key={a}>
                    <span>{a}</span><b><i style={{ transform: `scaleX(${v / 100})` }} /></b><em>{v}</em>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* categories */}
      <section className="ink sk-cats-sec">
        <div className="wrap">
          <span className="kicker kicker--light">技能一覧</span>
          <h2 className="h-xl h-light" data-anim="chars">Every skill, rated.</h2>
          <div className="sk-cats">
            {SKILLS.map((c, ci) => {
              const Icon = ICONS[c.icon] || Code;
              return (
                <article className="sk-cat" key={c.category} data-anim="up" data-delay={(ci % 2) * 0.1}>
                  <header>
                    <span className="sk-cat-icon"><Icon size={20} /></span>
                    <h3>{c.category}</h3>
                    <span className="sk-cat-jp">{c.jp}</span>
                  </header>
                  {c.items.map((s) => (
                    <div className="sk-row" key={s.name}>
                      <span className="sk-logo">{s.logo ? <img src={s.logo} alt="" loading="lazy" /> : <i />}</span>
                      <span className="sk-name">{s.name}</span>
                      <span className="sk-bar"><i className="sk-fill" style={{ width: `${s.level}%` }} /></span>
                      <span className="sk-val">{s.level}</span>
                    </div>
                  ))}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* usage matrix */}
      <section className="paper-2 sk-usage">
        <div className="wrap">
          <span className="kicker">実戦記録</span>
          <h2 className="h-xl" data-anim="chars">Most used in battle.</h2>
          <p className="lead" data-anim="up">How often each technology appears across my {PROJECTS.length} projects.</p>
          <div className="use-list">
            {usage.map(([tech, list]) => (
              <div className="use-row" key={tech}>
                <span className="use-tech">{TECH_LOGOS[tech] && <img src={TECH_LOGOS[tech]} alt="" loading="lazy" />}{tech}</span>
                <span className="use-bar"><i style={{ width: `${(list.length / maxUse) * 100}%` }} /></span>
                <span className="use-n">{list.length}</span>
                <span className="use-proj">{list.join(' · ')}</span>
              </div>
            ))}
          </div>
          <div className="sk-cta" data-anim="up">
            <TLink href="/projects2/" className="btn btn--red">See the projects</TLink>
          </div>
        </div>
      </section>
    </div>
  );
}
