import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ArrowRight, ArrowUpRight, Briefcase, Github, Home, Linkedin, Mail } from 'lucide-react';
import { BOSSES, FEATURED, ME, PILLARS, PROJECTS, SKILLS, SKILL_COUNT, TECH_LOGOS } from '../data/portfolio';
import { onIntroDone } from '../core/intro';
import { store } from '../core/store';
import { TLink } from '../components/Shell';
import Cover from '../components/Cover';
import ProjectLogo from '../components/ProjectLogo';
import { useGithubSummary } from '../core/useGithubSummary';
import { POSTS, fmtDate, postUrl } from '../blog/posts';
import Rig from '../story/Rig';
import Wanderer from '../story/Wanderer';
import { ChapterMenu, KatanaMeter, Particles, Polaroid, WantedPoster } from '../story/Extras';
import CoverHero, { Barcode } from '../story/CoverHero';
import { FLIPS, GATES, GATE_LEAD, GATE_SP, LEG1, ROUTE, STOPS } from '../story/journey-data';
import ThousandGates from '../story/ThousandGates';
import { scrollToY } from '../core/smooth';
import { BASE, POSES, applyPose } from '../story/pose';
import { Birds, Bamboo, Clouds, Dojo, Layer, Makiwara, Ridge, River, Shrine, Village, Weapon } from '../story/Scenery';
import { H, W } from '../story/world';
import '../styles/story.css';
import '../styles/story-extras.css';
import '../styles/story-cover.css';
import '../styles/story-gates.css';
import '../styles/story-battle.css';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

const ROLES = ['AI engineer in training', 'Full-stack developer', 'B.Tech AI · IIT Gandhinagar', 'JEE Advanced qualifier', 'Builder of useful things'];
const TAPE = ['AI ENGINEER', '人工知能', 'FULL-STACK', 'IIT GANDHINAGAR', 'JEE ADVANCED', 'OPEN TO COLLAB', '開発者'];

function Tape({ className, reverse }) {
  const row = TAPE.map((t, i) => <span key={i} className={/[぀-鿿]/.test(t) ? 'tape-jp' : undefined}>{t}<b>✦</b></span>);
  return (
    <div className={`tape ${className}`}>
      <div className={`tape-run ${reverse ? 'tape-run--rev' : ''}`}>{row}{row}</div>
    </div>
  );
}

const Scene3D = lazy(() => import('../three/Scene3D'));

// "the problem" each featured project fought, written from its description
const PROBLEMS = {
  octrops: 'AI coding assistants that ship your private code to someone else’s server.',
  manthan: 'Grassroots problems that never reach the labs and sponsors who could solve them.',
  cloudforge: 'Backends that keep burning money even while nobody is using them.',
  acadx: 'Timetables, attendance and GPA scattered across a dozen places.',
  'qs-iitgn': 'A campus quiz society with no home on the web.',
  assignmentai: 'Handwritten maths that nobody can explain step by step at 2 a.m.',
  famshield: 'Families with no real-time view of each other’s safety.',
};

const SFX = ['ズバッ', 'ザンッ', 'スパッ', 'ドンッ', 'バキッ', 'ズドン', 'シュバッ'];
const DUEL = 2.0;
const topStats = (p) => Object.entries(p.radar || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);

const WEAPON_FOR = ['katana', 'kunai', 'shuriken', 'kama', 'bow', 'naginata'];

const CHAPTERS = [
  ['序', 'Prologue'], ['人', 'The Wanderer'], ['起', 'Origin'], ['修', 'Training'], ['旅', 'The Journey'], ['門', 'Thousand Gates'],
  ['技', 'Techniques'], ['戦', 'Battles'], ['武', 'Arsenal'], ['書', 'Scrolls'], ['頂', 'The Summit'], ['終', 'Epilogue'],
];

const PROFILE = [
  ['名前', 'Name', ME.name],
  ['称号', 'Title', 'The Wandering Engineer'],
  ['流派', 'School', `${ME.degree} · ${ME.school}`],
  ['出身', 'Origin', ME.home],
  ['武器', 'Weapons', 'Python · PyTorch · React · TypeScript · Docker'],
  ['奥義', 'Special', 'Turning neural networks into products people use'],
];

function ChapterCard({ no, jp, title, className = '' }) {
  return (
    <div className={`chcard ${className}`}>
      <span className="chcard-kanji">{jp}</span>
      <div>
        <span className="chcard-no">{no}</span>
        <span className="chcard-title">{title}</span>
      </div>
    </div>
  );
}

function Actor({ variant = 'ninja', className = '', pose = 'stand', glow }) {
  const line = variant !== 'oni';
  return (
    <div className={`actor ${line ? 'actor--line' : ''} ${glow ? 'actor--glow' : ''} ${className}`}>
      <Rig variant={variant} pose={POSES[pose]} />
    </div>
  );
}

function Shutters({ className, n = 6 }) {
  return (
    <div className={`shutters ${className}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <i key={i} />)}
    </div>
  );
}

export default function Home2() {
  const root = useRef(null);
  const gh = useGithubSummary();
  const [chapter, setChapter] = useState(0);
  const [journeyOn, setJourneyOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const jump = (i) => {
    const sec = root.current?.querySelectorAll('.scene')[i];
    if (!sec) return;
    scrollToY(sec.offsetTop + (sec.offsetHeight - window.innerHeight) * 0.14, { duration: 1.8 });
    setMenuOpen(false);
  };
  const latest = POSTS.slice(0, 3);

  useLayoutEffect(() => {
    const el = root.current;
    let unsub = () => {};
    const ctx = gsap.context(() => {
      const mobile = window.innerWidth < 760;
      const vw = (n) => () => (window.innerWidth * n) / 100 * (mobile ? 0.82 : 1);
      const vh = (n) => () => (window.innerHeight * n) / 100;
      const $ = (s) => el.querySelector(s);
      const $$ = (s) => gsap.utils.toArray(s, el);

      const mk = (sel) => gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: $(sel), start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true },
      });
      const actor = (sel, pose = 'stand', extra = {}) => {
        const wrap = $(sel);
        const a = { wrap, svg: wrap.querySelector('svg'), P: { ...BASE, ...POSES[pose], ...extra } };
        applyPose(a.svg, a.P);
        gsap.set(wrap, { xPercent: -50 });
        return a;
      };
      const drawAll = (tl, ...as) => tl.eventCallback('onUpdate', () => as.forEach((a) => applyPose(a.svg, a.P)));
      const pose = (tl, a, name, at, dur = 0.4, extra = {}, ease = 'power2.inOut') => tl.to(a.P, { ...POSES[name], ...extra, duration: dur, ease }, at);
      const show = (tl, t, at, dur = 0.35, from = { y: 40 }) => tl.fromTo(t, { autoAlpha: 0, ...from }, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: dur, ease: 'power2.out' }, at);
      const hide = (tl, t, at, dur = 0.3) => tl.to(t, { autoAlpha: 0, y: -30, duration: dur, ease: 'power2.in' }, at);
      const runFor = (tl, a, at, dur, cycles, kind = 0) => {
        const ramp = Math.min(0.15, dur / 3);
        tl.set(a.P, { run: kind }, at);
        tl.to(a.P, { runW: 1, duration: ramp }, at);
        tl.to(a.P, { phase: `+=${cycles * Math.PI * 2}`, duration: dur }, at);
        tl.to(a.P, { runW: 0, duration: ramp }, at + dur - ramp);
      };
      const flash = (tl, f, at) => tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.02 }, at).to(f, { opacity: 0, duration: 0.18 }, at + 0.03);
      const slash = (tl, s, at) => tl.fromTo(s, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.05, ease: 'power4.in' }, at).to(s, { autoAlpha: 0, duration: 0.25 }, at + 0.12);
      const shutClose = (tl, sel, at, dur = 0.5) => tl.fromTo(`${sel} i`, { scaleY: 0 }, { scaleY: 1, duration: dur, stagger: 0.04, ease: 'power3.in' }, at);

      // chapter HUD
      $$('.scene').forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => st.isActive && setChapter(i) }));

      /* ============ PROLOGUE ============ */
      {
        const tl = mk('.sc-prologue');
        const n = actor('.sc-prologue .actor', 'lookUp', { dir: -1 });
        drawAll(tl, n);
        const title = new SplitText('.pro-title .ln', { type: 'chars', charsClass: 'hc' });
        const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
          .from('.pro-moon', { scale: 0.4, autoAlpha: 0, duration: 2 }, 0)
          .from(title.chars, { yPercent: 120, rotate: 12, opacity: 0, stagger: 0.04, duration: 1.2 }, 0.2)
          .from('.pro-kicker, .pro-sub, .pro-hint, .pro-tip', { y: 20, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 0.6)
          .from('.pro-ninja svg', { y: 60, autoAlpha: 0, duration: 1.2 }, 0.5)
          .from('.pro-brush', { scale: 1.4, autoAlpha: 0, duration: 1.6 }, 0.1)
          .fromTo('.cover-page', { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.5, ease: 'power3.out' }, 0.2)
          .from('.cpanel', { scale: 1.5, rotate: (i) => [-14, 10, 12, -9][i], autoAlpha: 0, duration: 0.42, stagger: 0.2, ease: 'power4.in' }, 0.5)
          .to('.cover-art', { keyframes: { x: [0, -12, 10, -6, 3, 0] }, duration: 0.3 }, 1.35)
          .fromTo('.cover-flash', { opacity: 1 }, { opacity: 0, duration: 0.35 }, 1.32)
          .from('.cover-sfx', { scale: 3, autoAlpha: 0, duration: 0.3, ease: 'power4.in' }, 1.35)
          .from('.cover-badge', { scale: 0, rotate: -90, duration: 0.5, ease: 'back.out(2.2)' }, 1.55)
          .from('.cover-bubble', { scale: 0, rotate: -12, duration: 0.45, ease: 'back.out(2.4)' }, 1.75)
          .from('.cover-strip', { xPercent: -100, autoAlpha: 0, duration: 0.6 }, 1.6)
          .from('.pro-teasers li', { x: -30, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 1.3)
          .from('.cv-barcode rect', { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.004, duration: 0.3 }, 1.6)
          .from('.cover-lines', { autoAlpha: 0, scale: 0.5, duration: 1.2 }, 1.32)
          .fromTo('.cover-enso path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 1.1)
          .from('.cover-splat > *', { scale: 0, transformOrigin: '50% 50%', stagger: 0.025, duration: 0.45, ease: 'back.out(3)' }, 1.34)
          .from('.tape', { xPercent: (i) => (i ? 110 : -110), duration: 1.1, ease: 'power3.out' }, 1.5)
          .from('.pro-vert', { autoAlpha: 0, y: -40, duration: 1 }, 1.0)
          .from('.cover-note', { autoAlpha: 0, x: -20, duration: 0.5 }, 2.0)
          .fromTo('.cover-note path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, 2.1)
          .from('.pro-caret', { autoAlpha: 0, duration: 0.2 }, 1.2);
        unsub = onIntroDone(() => intro.play());

        tl.to('.pro-copy', { y: vh(-30), autoAlpha: 0, duration: 1 }, 0)
          .to('.pro-brush', { yPercent: -40, autoAlpha: 0, duration: 1 }, 0)
          .to('.pro-moon', { scale: 1.3, y: vh(-4), duration: 2.4 }, 0)
          .to('.pro-far', { y: vh(8), duration: 2.4 }, 0)
          .to('.pro-mid', { y: vh(14), duration: 2.4 }, 0)
          .to('.pro-cliff', { y: vh(26), duration: 2.4 }, 1.6);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy], i) => {
          tl.to(`.cpanel--${['ink', 'duo', 'raw', 'line'][i]}`, { x: vw(dx * 34), y: vh(dy * 40), rotate: dx * dy * 24, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 0.05 + i * 0.05);
        });
        tl.to(['.cover-page', '.cover-badge', '.cover-sfx', '.cover-bubble', '.cover-strip', '.cover-note'], { autoAlpha: 0, scale: 0.8, duration: 0.5 }, 0.1)
          .to(['.cover-lines', '.cover-enso', '.cover-splat'], { autoAlpha: 0, scale: 1.4, duration: 0.6 }, 0.05)
          .to('.tape--ink', { yPercent: 200, autoAlpha: 0, duration: 0.6 }, 0)
          .to('.tape--red', { yPercent: 260, autoAlpha: 0, duration: 0.6 }, 0.05)
          .to('.pro-vert', { autoAlpha: 0, y: vh(-10), duration: 0.5 }, 0);
        show(tl, '.pro-cap', 0.8);
        pose(tl, n, 'crouch', 1.1, 0.35);
        pose(tl, n, 'leap', 1.5, 0.25, {}, 'power3.out');
        tl.to(n.wrap, { y: vh(-95), x: vw(-30), scale: 0.4, duration: 0.8, ease: 'power2.out' }, 1.5);
        hide(tl, '.pro-cap', 2.0);
        // the moon swallows the screen: white-out into the next chapter
        tl.to('.pro-moon', { scale: 9, duration: 0.9, ease: 'power2.in' }, 2.2)
          .to('.sc-prologue .cv-end', { autoAlpha: 1, duration: 0.25 }, 2.85);
      }

      /* ============ THE WANDERER (character intro) ============ */
      {
        const tl = mk('.sc-intro');
        tl.fromTo('.wd-key', { clipPath: 'polygon(100% 0%, 100% 0%, 112% 100%, 112% 100%)' }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, -12% 100%)', duration: 0.6, ease: 'power3.inOut' }, 0)
          .fromTo('.wd-key .wanderer', { scale: 1.25 }, { scale: 1, duration: 2.6 }, 0)
          .fromTo('.wd-rain', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.2);
        show(tl, '.wd-card-head', 0.4, 0.3, { x: -40 });
        tl.fromTo('.wd-row', { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.12, ease: 'power2.out' }, 0.6);
        tl.fromTo('.wanted', { y: vh(-90), rotate: -30, autoAlpha: 1 }, { y: 0, rotate: -7, duration: 0.3, ease: 'power4.in' }, 1.25)
          .fromTo('.wanted-kunai', { y: -260, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.12, ease: 'power4.in' }, 1.5)
          .fromTo('.wanted', { x: 0 }, { keyframes: { x: [0, -8, 6, -3, 0] }, duration: 0.15 }, 1.62);
        tl.to('.wd-card', { autoAlpha: 0, x: vw(-10), duration: 0.3 }, 1.7)
          .to('.wanted', { autoAlpha: 0, duration: 0.25 }, 1.85);
        $$('.wd-close').forEach((p, i) => {
          tl.fromTo(p, { autoAlpha: 1, clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 0.25, ease: 'power3.out' }, 1.9 + i * 0.3)
            .fromTo(p.querySelector('.wanderer'), { scale: 1.4 }, { scale: 1, duration: 0.8 }, 1.9 + i * 0.3);
        });
        show(tl, '.wd-sfx', 2.0, 0.2, { scale: 2.2 });
        flash(tl, '.sc-intro .flash', 2.95);
        show(tl, '.wd-cap', 3.0);
        tl.to(['.wd-close', '.wd-sfx', '.wd-cap'], { autoAlpha: 0, duration: 0.3 }, 3.7)
          .to('.sc-intro .cv-end', { autoAlpha: 1, duration: 0.3 }, 3.9);
      }

      /* ============ 1 · ORIGIN ============ */
      {
        const tl = mk('.sc-origin');
        const n = actor('.sc-origin .actor', 'stand', { dir: 1 });
        drawAll(tl, n);
        gsap.set(n.wrap, { x: vw(-62) });
        tl.from('.org-sun', { y: vh(40), duration: 1.6 }, 0)
          .from('.org-far', { y: vh(40), duration: 0.9, ease: 'power3.out' }, 0.1)
          .from('.org-mid', { y: vh(50), duration: 0.9, ease: 'power3.out' }, 0.25)
          .from('.org-river', { y: vh(50), duration: 0.9, ease: 'power3.out' }, 0.35)
          .from('.org-village', { y: vh(60), duration: 0.9, ease: 'power3.out' }, 0.45);
        show(tl, '.sc-origin .chcard', 0.3, 0.4, { x: -60 });
        hide(tl, '.sc-origin .chcard', 1.0);
        show(tl, '.org-cap1', 1.2);
        hide(tl, '.org-cap1', 2.3);
        tl.to(n.wrap, { x: vw(-14), duration: 1.6 }, 1.0);
        runFor(tl, n, 1.0, 1.6, 4, 1);
        pose(tl, n, 'lookUp', 2.7, 0.35);
        show(tl, '.org-cap2', 2.4);
        show(tl, '.org-bubble', 2.9, 0.3, { scale: 0.3, rotate: -10 });
        hide(tl, '.org-cap2', 3.7);
        hide(tl, '.org-bubble', 3.9);
        pose(tl, n, 'stand', 3.9, 0.2);
        tl.to(n.wrap, { x: vw(80), duration: 1.0, ease: 'power1.in' }, 4.05);
        runFor(tl, n, 4.05, 1.0, 4, 0);
        tl.to('.org-sun', { x: vw(-6), duration: 1 }, 4)
          .to('.org-far', { x: vw(-4), duration: 1 }, 4)
          .to('.org-mid', { x: vw(-9), duration: 1 }, 4)
          .to('.org-village', { x: vw(-22), duration: 1 }, 4);
        shutClose(tl, '.sc-origin .shutters', 4.6, 0.4);
      }

      /* ============ 2 · TRAINING ============ */
      {
        const tl = mk('.sc-training');
        const n = actor('.sc-training .actor', 'stand', { dir: 1 });
        drawAll(tl, n);
        gsap.set(n.wrap, { x: vw(-70) });
        tl.fromTo('.door-l', { xPercent: 0 }, { xPercent: -100, duration: 0.7, ease: 'power2.inOut' }, 0)
          .fromTo('.door-r', { xPercent: 0 }, { xPercent: 100, duration: 0.7, ease: 'power2.inOut' }, 0)
          .fromTo('.dojo', { scale: 1.15 }, { scale: 1, duration: 1.4 }, 0);
        show(tl, '.sc-training .chcard', 0.4, 0.4, { x: -60 });
        hide(tl, '.sc-training .chcard', 1.1);
        show(tl, '.trn-cap', 1.25);
        tl.to(n.wrap, { x: vw(-26), duration: 0.8 }, 0.8);
        runFor(tl, n, 0.8, 0.8, 3, 0);
        pose(tl, n, 'guard', 1.65, 0.3);
        tl.fromTo('.banner', { yPercent: -130 }, { yPercent: 0, duration: 0.4, stagger: 0.15, ease: 'back.out(1.4)' }, 1.5)
          .to('.banner', { yPercent: -130, duration: 0.3, stagger: 0.08, ease: 'power2.in' }, 2.6);
        hide(tl, '.trn-cap', 2.5);

        const trial = (k, at, toX, dir, score) => {
          const sel = `.trial-${k}`;
          const numEl = $(`${sel} .trial-num`);
          const obj = { v: 0 };
          tl.set(n.P, { dir }, at);
          show(tl, `${sel} .trial-label`, at, 0.3, { x: dir * -40 });
          tl.fromTo(`${sel} .makiwara`, { y: vh(40), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.6)' }, at);
          show(tl, `${sel} .trial-num`, at + 0.2, 0.3, { scale: 0.6 });
          tl.to(obj, { v: score, duration: 0.7, ease: 'power2.out', onUpdate: () => { numEl.textContent = `${obj.v.toFixed(1)}%`; } }, at + 0.2);
          pose(tl, n, 'raise', at + 0.5, 0.25);
          pose(tl, n, 'slash', at + 0.85, 0.1, { dir }, 'power4.in');
          tl.to(n.wrap, { x: vw(toX), duration: 0.1, ease: 'power4.in' }, at + 0.85);
          flash(tl, '.sc-training .flash', at + 0.95);
          slash(tl, `${sel} .slashfx`, at + 0.93);
          tl.to(`${sel} .mk-top`, { x: dir * 120, y: -60, rotate: dir * 30, autoAlpha: 0, duration: 0.4, ease: 'power2.out', svgOrigin: '0 -150' }, at + 1.0)
            .to(`${sel} .trial-num`, { color: '#e3122c', duration: 0.05 }, at + 0.97);
          show(tl, `${sel} .stamp`, at + 1.0, 0.15, { scale: 2.6, rotate: -30 });
          pose(tl, n, 'followThrough', at + 1.0, 0.2, { dir });
          tl.to([`${sel} .trial-label`, `${sel} .trial-num`, `${sel} .stamp`, `${sel} .makiwara`], { autoAlpha: 0, duration: 0.3 }, at + 1.5);
          tl.set(n.P, { dir: -dir }, at + 1.5);
          pose(tl, n, 'guard', at + 1.55, 0.25, { dir: -dir });
        };
        trial(1, 2.8, 30, 1, 97.4);
        trial(2, 4.7, -28, -1, 95.2);
        pose(tl, n, 'bow', 6.4, 0.4, { dir: 1 });
        show(tl, '.trn-done', 6.4);
        tl.fromTo('.sc-training .cv-end', { clipPath: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)' }, { clipPath: 'polygon(0% 0%, 140% 0%, 0% 140%, 0% 0%)', duration: 0.25, ease: 'power3.in' }, 6.9)
          .to('.sc-training .cv-end', { clipPath: 'polygon(0% 0%, 200% 0%, 200% 200%, 0% 200%)', duration: 0.2 }, 7.15);
      }

      /* ============ 3 · JOURNEY (3D torii corridor) ============ */
      {
        const tl = mk('.sc-journey');
        const n = actor('.sc-journey .actor', 'stand', { dir: 1 });
        drawAll(tl, n);
        ScrollTrigger.create({ trigger: '.sc-journey', start: 'top bottom', end: 'bottom top', onToggle: (s) => setJourneyOn(s.isActive) });
        tl.fromTo('.jr-split-a', { xPercent: 0 }, { xPercent: -110, yPercent: -20, duration: 0.6, ease: 'power3.in' }, 0)
          .fromTo('.jr-split-b', { xPercent: 0 }, { xPercent: 110, yPercent: 20, duration: 0.6, ease: 'power3.in' }, 0)
          .fromTo(store, { journey: 0 }, { journey: 1, duration: 5.2 }, 0.3);
        runFor(tl, n, 0.2, 5.1, 36, 0);
        show(tl, '.sc-journey .chcard', 0.4, 0.4, { x: -60 });
        hide(tl, '.sc-journey .chcard', 1.1);
        show(tl, '.jr-cap1', 1.3); hide(tl, '.jr-cap1', 2.4);
        show(tl, '.jr-cap2', 2.5); hide(tl, '.jr-cap2', 3.6);
        show(tl, '.jr-cap3', 3.7); hide(tl, '.jr-cap3', 4.4);
        // day turns to night on the road
        tl.fromTo('.jr-sky', { backgroundColor: '#ffd6c8' }, { backgroundColor: '#f6f3ec', duration: 1.2 }, 0.3)
          .to('.jr-sky', { backgroundColor: '#ffb27a', duration: 1.3 }, 2.0)
          .to('.jr-sky', { backgroundColor: '#2a1f3a', duration: 1.3 }, 3.6)
          .fromTo('.jr-stars', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 4.2);
        // the route draws itself across the map, a dot travels it and the odometer counts
        const route = $('.jr-route');
        const len = route.getTotalLength();
        const leg = $('.jr-leg1').getTotalLength() / len;
        const dot = $('.jr-dot');
        const km = $('.jr-km');
        const trip = { f: 0 };
        const stops = $$('.jr-stop');
        const paint = () => {
          route.style.strokeDashoffset = String(len * (1 - trip.f));
          const pt = route.getPointAtLength(len * trip.f);
          dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
          const k = trip.f < leg ? (trip.f / leg) * STOPS[1].km : STOPS[1].km + ((trip.f - leg) / (1 - leg)) * (STOPS[2].km - STOPS[1].km);
          km.textContent = Math.round(k).toLocaleString();
          stops.forEach((s, i) => s.classList.toggle('is-on', i === 0 || (i === 1 ? trip.f >= leg : trip.f >= 0.995)));
        };
        route.style.strokeDasharray = String(len);
        paint();
        show(tl, '.jr-map', 0.9, 0.4, { x: 60, rotate: 6 });
        tl.to(trip, { f: 1, duration: 3.3, ease: 'power1.inOut', onUpdate: paint }, 1.2);
        // station signposts rush past; the last one stops
        tl.fromTo('.jr-post-0', { x: vw(10) }, { x: vw(-90), duration: 0.9 }, 1.0)
          .fromTo('.jr-post-1', { x: vw(90) }, { x: vw(-90), duration: 1.0 }, 2.2)
          .fromTo('.jr-post-2', { x: vw(90) }, { x: vw(26), duration: 0.6, ease: 'power3.out' }, 4.0)
          .to('.jr-post-2', { x: vw(-90), duration: 0.5, ease: 'power2.in' }, 5.2);
        // one-way ticket, punched and stamped
        show(tl, '.jr-ticket', 4.5, 0.3, { y: -80, rotate: -8 });
        tl.fromTo('.jr-punch', { scale: 0 }, { scale: 1, duration: 0.08, ease: 'power4.in' }, 4.8)
          .fromTo('.jr-stamp', { scale: 2.6, autoAlpha: 0, rotate: -30 }, { scale: 1, autoAlpha: 1, rotate: -12, duration: 0.12, ease: 'power4.in' }, 4.9)
          .to(['.jr-ticket', '.jr-map'], { autoAlpha: 0, y: -40, duration: 0.3 }, 5.25);
        tl.fromTo('.jr-speed', { opacity: 0 }, { opacity: 0.85, duration: 1.5 }, 1).to('.jr-speed', { opacity: 0, duration: 0.5 }, 4.8);
        pose(tl, n, 'leap', 5.3, 0.2);
        tl.to(n.wrap, { y: vh(-70), scale: 0.3, duration: 0.5, ease: 'power2.in' }, 5.3);
        tl.to('.sc-journey .cv-end', { autoAlpha: 1, duration: 0.25 }, 5.7);
      }

      /* ============ 3½ · THE THOUSAND GATES (side-view run along the torii caps) ============ */
      {
        const tl = mk('.sc-gates');
        const stage = $('.gt-stage');
        const track = $('.gt-track');
        const fore = $('.gt-fore');
        const gates = $$('.gt-gate');
        const count = $('.gt-count');
        const nowJp = $('.gt-now-jp');
        const nowEn = $('.gt-now-en');
        const N = GATES.length;
        const mkRig = (w) => { gsap.set(w, { xPercent: -50 }); return { wrap: w, svg: w.querySelector('svg'), P: { ...BASE, ...POSES.leap, dir: 1 } }; };
        const run = mkRig($('.gt-runner'));
        const ghosts = $$('.gt-ghost').map(mkRig);
        const G = { u: 0, drop: 0, runW: 0, ghost: 0, fin: 0 };
        const M = { w: 0, h: 0, sp: 0, lead: 0, x: 0 };
        const TUCK = POSES.crouch;
        const KEYS = ['torso', 'head', 'aBU', 'aBL', 'aFU', 'aFL', 'lBU', 'lBL', 'lFU', 'lFL'];
        let lit = -2;
        const measure = () => {
          M.w = window.innerWidth; M.h = window.innerHeight;
          const k = track.offsetHeight / 600;
          M.sp = GATE_SP * k; M.lead = GATE_LEAD * k; M.x = M.w * (mobile ? 0.3 : 0.36);
        };
        // hop height + flip for any position u (in gates) along the caps
        const hop = (u) => {
          const uc = Math.max(0, Math.min(N - 1, u));
          const i0 = Math.floor(uc), fr = uc - i0;
          const flip = FLIPS.includes(i0) && i0 < N - 1;
          const arc = Math.sin(Math.PI * fr);
          return { y: -arc * M.sp * (flip ? 1.05 : 0.14), rot: flip ? fr * 360 : 0, tuck: flip ? arc : 0 };
        };
        const drawRig = (a, u, extra) => {
          const h = hop(u);
          const Q = { ...a.P, phase: u * Math.PI, runW: a.P.runW * G.runW * (1 - h.tuck), rot: h.rot };
          if (h.tuck > 0) KEYS.forEach((k) => { Q[k] = a.P[k] + (TUCK[k] - a.P[k]) * h.tuck; });
          applyPose(a.svg, Q);
          gsap.set(a.wrap, { x: extra.x, y: h.y + extra.y, scale: extra.s ?? 1 });
        };
        const upd = () => {
          if (M.w !== window.innerWidth || M.h !== window.innerHeight) measure();
          const u = G.u;
          const tx = M.x - (M.lead + u * M.sp);
          track.style.transform = `translate3d(${tx.toFixed(1)}px,0,0)`;
          fore.style.transform = `translate3d(${(tx * 1.9).toFixed(1)}px,0,0)`;
          const f = G.fin;
          drawRig(run, u, { x: f * M.w * 0.22, y: -(1 - G.drop) * M.h * 0.8 - Math.sin(f * Math.PI) * M.h * 0.26 + f * M.h * 0.2, s: 1 - f * 0.62 });
          run.wrap.classList.toggle('is-shadow', f > 0.55);
          ghosts.forEach((g, k) => {
            const lag = 0.3 * (k + 1);
            g.wrap.style.opacity = (G.ghost * (k ? 0.22 : 0.45)).toFixed(3);
            drawRig(g, u - lag, { x: -lag * M.sp, y: 0 });
          });
          const now = Math.max(0, Math.min(N - 1, Math.floor(u + 0.2)));
          const on = G.drop >= 1 ? now : -1;
          if (on !== lit) {
            lit = on;
            gates.forEach((g, i) => g.classList.toggle('is-lit', i <= on));
            const g = GATES[Math.max(0, on)];
            count.textContent = String(Math.max(0, on) + 1).padStart(2, '0');
            nowJp.textContent = g.jp;
            nowEn.textContent = g.en;
          }
        };
        measure();
        tl.eventCallback('onUpdate', upd);
        upd();

        tl.fromTo('.gt-cv-start', { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }, { clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 120% 100%)', duration: 0.5, ease: 'power2.inOut' }, 0);
        // the runner drops out of the sky onto the first cap
        tl.to(G, { drop: 1, duration: 0.5, ease: 'power2.in' }, 0.1);
        pose(tl, run, 'land', 0.55, 0.08);
        pose(tl, run, 'stand', 0.68, 0.2);
        tl.to([run.P, ...ghosts.map((g) => g.P)], { runW: 1, duration: 0.01 }, 0.6);
        tl.fromTo(G, { runW: 0 }, { runW: 1, duration: 0.2 }, 0.75);
        tl.fromTo(G, { ghost: 0 }, { ghost: 1, duration: 0.3 }, 0.9);
        show(tl, '.sc-gates .chcard', 0.25, 0.35, { x: -60 });
        hide(tl, '.sc-gates .chcard', 1.0);
        show(tl, '.gt-hud', 1.05, 0.3, { x: -40 });
        // the long sprint: one step per cap, front flips over a few gates
        tl.fromTo(G, { u: 0 }, { u: N - 1, duration: 4.8 }, 0.8);
        tl.to('.gt-far', { x: vw(-10), duration: 4.8 }, 0.8)
          .to('.gt-mid', { x: vw(-24), duration: 4.8 }, 0.8)
          .to('.gt-sun', { y: vh(4), duration: 4.8 }, 0.8)
          .fromTo(stage, { '--gt-top': '#ff8a5c', '--gt-bot': '#ffd9a8' }, { '--gt-top': '#3b1236', '--gt-bot': '#ff6a3d', duration: 4.8 }, 0.8)
          .fromTo('.gt-speed', { opacity: 0 }, { opacity: 0.6, duration: 0.8 }, 1.2)
          .to('.gt-speed', { opacity: 0, duration: 0.4 }, 5.3);
        show(tl, '.gt-cap1', 1.6); hide(tl, '.gt-cap1', 2.8);
        show(tl, '.gt-cap2', 3.2); hide(tl, '.gt-cap2', 4.4);
        // finale: off the last gate, into the sun
        hide(tl, '.gt-hud', 5.5);
        tl.to(G, { ghost: 0, duration: 0.3 }, 5.5).to(G, { runW: 0, duration: 0.12 }, 5.55);
        pose(tl, run, 'crouch', 5.55, 0.1);
        pose(tl, run, 'leap', 5.68, 0.15);
        tl.to(G, { fin: 1, duration: 0.75, ease: 'power1.out' }, 5.65);
        tl.to('.gt-sun', { scale: 2.8, duration: 0.6, ease: 'power2.in' }, 6.0);
        flash(tl, '.gt-flash', 6.3);
        show(tl, '.gt-ai', 6.32, 0.35, { scale: 0.4 });
        tl.to('.sc-gates .cv-end', { autoAlpha: 1, duration: 0.25 }, 7.0);
      }

      /* ============ 4 · TECHNIQUES ============ */
      {
        const tl = mk('.sc-tech');
        const masters = [0, 1, 2].map((i) => actor(`.master-${i} .actor`, 'stand', { dir: i === 2 ? -1 : 1 }));
        drawAll(tl, ...masters);
        tl.from('.tech-far', { y: vh(30), duration: 1 }, 0).from('.tech-mist', { autoAlpha: 0, duration: 1 }, 0);
        show(tl, '.sc-tech .chcard', 0.3, 0.4, { x: -60 });
        hide(tl, '.sc-tech .chcard', 1.2);
        masters.forEach((m, i) => {
          const at = 1.0 + i * 1.3;
          const sel = `.master-${i}`;
          tl.fromTo(`${sel} .tech-kanji`, { scale: 1.8, autoAlpha: 0, filter: 'blur(12px)' }, { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, at);
          tl.fromTo(m.wrap, { y: vh(30), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' }, at + 0.1);
          pose(tl, m, 'raise', at + 0.35, 0.3);
          pose(tl, m, i === 1 ? 'slash' : 'guard', at + 0.7, 0.2, {}, 'power3.out');
          show(tl, `${sel} .tech-card`, at + 0.5);
        });
        show(tl, '.tech-cap', 4.9);
        tl.fromTo('.sc-tech .iris', { '--iris': '160vmax' }, { '--iris': '0vmax', duration: 0.6, ease: 'power2.in' }, 5.4);
      }

      /* ============ 5 · BATTLES ============ */
      {
        const tl = mk('.sc-battle');
        const n = actor('.sc-battle .hero-ninja', 'guard', { dir: 1 });
        FEATURED.forEach((_, i) => {
          actor(`.duel-${i} .oni-top`, 'guard', { dir: -1, blade: 1 });
          actor(`.duel-${i} .oni-bot`, 'guard', { dir: -1, blade: 1 });
        });
        drawAll(tl, n);
        gsap.set(n.wrap, { x: vw(-30) });
        tl.from('.bt-sun', { y: vh(40), duration: 1 }, 0).from('.bt-ground', { y: vh(30), duration: 0.8 }, 0.1);
        show(tl, '.sc-battle .chcard', 0.2, 0.35, { x: -60 });
        hide(tl, '.sc-battle .chcard', 0.8);
        show(tl, '.bt-cap', 0.9); hide(tl, '.bt-cap', 1.35);
        // 解放 · RELEASE: the ninja powers up into his battle form
        const R = 1.4;
        pose(tl, n, 'raise', R, 0.3);
        tl.to('.release-dark', { autoAlpha: 1, duration: 0.25 }, R + 0.1)
          .fromTo('.release-aura', { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, R + 0.2)
          .fromTo('.release-kanji', { scale: 3.2, autoAlpha: 0, rotate: -8 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.2, ease: 'power4.in' }, R + 0.45)
          .fromTo('.release-ring', { scale: 0, autoAlpha: 1 }, { scale: 4, autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, R + 0.66);
        flash(tl, '.sc-battle .flash', R + 0.64);
        tl.to(n.P, { cloak: 1, aura: 1, duration: 0.06 }, R + 0.66);
        tl.to(n.wrap, { keyframes: { x: ['+=0', '+=-10', '+=12', '+=-6', '+=4', '+=0'] }, duration: 0.25 }, R + 0.66);
        tl.to(['.release-kanji', '.release-dark', '.release-aura'], { autoAlpha: 0, duration: 0.3 }, R + 1.15);
        pose(tl, n, 'guard', R + 1.1, 0.25);
        const D0 = R + 1.5;
        show(tl, '.bt-count', D0 - 0.2);
        show(tl, '.bt-tally', D0 - 0.2, 0.3, { y: 40 });
        const countEl = $('.bt-count b');
        const ANG = [0, 14, -12, 20, -18, 8, -6];
        FEATURED.forEach((p, i) => {
          const b = D0 + i * DUEL;
          const d = `.duel-${i}`;
          const pair = [$(`${d} .oni-top`), $(`${d} .oni-bot`)];
          tl.call(() => { countEl.textContent = String(i + 1).padStart(2, '0'); }, null, b + 0.01);
          // fighting-game VS splash: two ink bars slam in, the boss is named
          tl.fromTo(`${d} .vs-bar--a`, { xPercent: -110 }, { xPercent: 0, duration: 0.14, ease: 'power4.out' }, b)
            .fromTo(`${d} .vs-bar--b`, { xPercent: 110 }, { xPercent: 0, duration: 0.14, ease: 'power4.out' }, b + 0.04)
            .fromTo(`${d} .vs-mark`, { scale: 3.4, autoAlpha: 0, rotate: -20 }, { scale: 1, autoAlpha: 1, rotate: -8, duration: 0.12, ease: 'power4.in' }, b + 0.14)
            .to(`${d} .vs`, { keyframes: { x: [0, -10, 8, -4, 0] }, duration: 0.12 }, b + 0.26)
            .to(`${d} .vs-bar--a`, { xPercent: -110, duration: 0.14, ease: 'power3.in' }, b + 0.48)
            .to(`${d} .vs-bar--b`, { xPercent: 110, duration: 0.14, ease: 'power3.in' }, b + 0.48)
            .to(`${d} .vs-mark`, { scale: 0.4, autoAlpha: 0, duration: 0.12 }, b + 0.48);
          tl.fromTo(pair, { x: vw(70), y: 0, rotate: 0, autoAlpha: 1 }, { x: vw(28), duration: 0.35, ease: 'power2.out' }, b + 0.3);
          // the problem, pinned up as a paper card
          tl.fromTo(`${d} .problem`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, b + 0.55)
            .fromTo(`${d} .ph`, { scale: 0.5, rotate: 6, x: 0, y: 0, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.25, ease: 'back.out(1.8)' }, b + 0.55);
          pose(tl, n, 'raise', b + 0.85, 0.2);
          pose(tl, n, 'slash', b + 1.1, 0.08, {}, 'power4.in');
          tl.to(n.wrap, { x: vw(40), duration: 0.08, ease: 'power4.in' }, b + 1.1);
          tl.set('.sc-battle .slashfx', { rotation: ANG[i % ANG.length] }, b + 1.1);
          flash(tl, '.sc-battle .flash', b + 1.18);
          slash(tl, '.sc-battle .slashfx', b + 1.17);
          // ...and the problem is cut clean in two
          tl.to(`${d} .ph--a`, { x: -70, y: -90, rotate: -12, autoAlpha: 0, duration: 0.4, ease: 'power2.out' }, b + 1.19)
            .to(`${d} .ph--b`, { x: 80, y: 70, rotate: 9, autoAlpha: 0, duration: 0.4, ease: 'power2.out' }, b + 1.19)
            .fromTo(`${d} .duel-sfx`, { scale: 2.6, autoAlpha: 0, rotate: -16 }, { scale: 1, autoAlpha: 1, rotate: -6, duration: 0.1, ease: 'power4.in' }, b + 1.18)
            .to(`${d} .duel-sfx`, { autoAlpha: 0, scale: 1.3, duration: 0.25 }, b + 1.45);
          tl.to(pair[0], { y: vh(-14), x: vw(36), rotate: -18, autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, b + 1.23)
            .to(pair[1], { y: vh(8), x: vw(22), rotate: 10, autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, b + 1.23);
          pose(tl, n, 'followThrough', b + 1.2, 0.15);
          // the win card, its power stats and a 撃破 stamp
          show(tl, `${d} .win`, b + 1.3, 0.25, { scale: 0.6, rotate: -4 });
          tl.fromTo(`${d} .ws-bar i`, { scaleX: 0 }, { scaleX: 1, duration: 0.3, stagger: 0.06, ease: 'power2.out' }, b + 1.45)
            .fromTo(`${d} .win-stamp`, { scale: 2.8, autoAlpha: 0, rotate: -30 }, { scale: 1, autoAlpha: 1, rotate: -12, duration: 0.1, ease: 'power4.in' }, b + 1.55)
            .fromTo(`.tally-${i} b`, { scale: 2.6, autoAlpha: 0, rotate: -40 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.12, ease: 'power4.in' }, b + 1.6)
            .fromTo(`.tally-${i} i`, { scaleX: 0 }, { scaleX: 1, duration: 0.08 }, b + 1.72);
          tl.set(n.P, { dir: -1 }, b + 1.4);
          tl.to(n.wrap, { x: vw(-30), duration: 0.3 }, b + 1.4);
          runFor(tl, n, b + 1.4, 0.3, 2, 0);
          tl.set(n.P, { dir: 1 }, b + 1.71);
          pose(tl, n, 'guard', b + 1.71, 0.1);
          tl.to(`${d} .win`, { autoAlpha: 0, scale: 0.9, y: -30, duration: 0.15 }, b + DUEL - 0.15);
        });
        const end = D0 + FEATURED.length * DUEL;
        hide(tl, '.bt-count', end);
        show(tl, '.bt-all', end, 0.35, { scale: 0.7 });
        tl.to('.bt-tally', { y: vh(-8), scale: 1.15, duration: 0.35 }, end);
        pose(tl, n, 'point', end, 0.3);
        tl.to('.sc-battle .cv-end', { autoAlpha: 1, duration: 0.3 }, end + 0.7);
      }

      /* ============ 6 · ARSENAL ============ */
      {
        const tl = mk('.sc-arsenal');
        tl.from('.ars-wall', { autoAlpha: 0, duration: 0.4 }, 0);
        show(tl, '.sc-arsenal .chcard', 0.2, 0.4, { x: -60 });
        hide(tl, '.sc-arsenal .chcard', 1.0);
        $$('.wslot').forEach((s, i) => {
          const at = 0.8 + i * 0.5;
          const side = i % 2 ? 1 : -1;
          tl.fromTo(s.querySelector('.weapon'), { x: side * window.innerWidth, y: -200, rotate: side * 540, autoAlpha: 1 }, { x: 0, y: 0, rotate: +s.dataset.rot, duration: 0.35, ease: 'power3.in' }, at)
            .fromTo(s, { x: 0 }, { keyframes: { x: [0, -10, 8, -5, 3, 0] }, duration: 0.2 }, at + 0.35);
          show(tl, s.querySelector('.thunk'), at + 0.35, 0.08, { scale: 2.4 });
          tl.to(s.querySelector('.thunk'), { autoAlpha: 0, duration: 0.25 }, at + 0.6);
          show(tl, s.querySelector('.wtag'), at + 0.4, 0.3);
        });
        show(tl, '.ars-cap', 4.0);
        tl.fromTo('.sc-arsenal .cv-end', { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: 'power3.in' }, 4.6);
      }

      /* ============ 7 · SCROLLS ============ */
      {
        const tl = mk('.sc-scrolls');
        show(tl, '.sc-scrolls .chcard', 0.2, 0.4, { x: -60 });
        hide(tl, '.sc-scrolls .chcard', 1.1);
        tl.fromTo('.mk-paper', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.6)
          .fromTo('.mk-rod--l', { x: () => $('.makimono').offsetWidth / 2 - 20 }, { x: 0, duration: 1.1, ease: 'power2.inOut' }, 0.6)
          .fromTo('.mk-rod--r', { x: () => -$('.makimono').offsetWidth / 2 + 20 }, { x: 0, duration: 1.1, ease: 'power2.inOut' }, 0.6)
          .fromTo('.mk-head > *', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.1 }, 1.4)
          .fromTo('.mk-item', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.2 }, 1.5)
          .fromTo('.mk-foot', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 2.2);
        tl.fromTo('.sc-scrolls .cv-end', { clipPath: 'circle(0% at 50% 60%)' }, { clipPath: 'circle(150% at 50% 60%)', duration: 0.6, ease: 'power3.in' }, 3.4);
      }

      /* ============ THE SUMMIT (GitHub records) ============ */
      {
        const tl = mk('.sc-summit');
        const n = actor('.sc-summit .actor', 'stand', { dir: 1 });
        drawAll(tl, n);
        gsap.set(n.wrap, { x: vw(-60) });
        tl.from('.sm-far', { y: vh(30), duration: 1 }, 0)
          .from('.sm-shrine', { y: vh(40), duration: 0.9, ease: 'power3.out' }, 0.2);
        show(tl, '.sc-summit .chcard', 0.2, 0.35, { x: -60 });
        hide(tl, '.sc-summit .chcard', 1.0);
        tl.to(n.wrap, { x: vw(-30), duration: 1.0 }, 0.6);
        runFor(tl, n, 0.6, 1.0, 3, 1);
        pose(tl, n, 'lookUp', 1.6, 0.3);
        tl.fromTo('.ema', { y: vh(-60), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.15, ease: 'back.out(1.6)' }, 1.4);
        show(tl, '.sm-cap', 2.6);
        pose(tl, n, 'bow', 3.0, 0.4);
        tl.fromTo('.sc-summit .cv-end', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', duration: 0.6, ease: 'power3.in' }, 3.9);
      }

      /* ============ 8 · EPILOGUE ============ */
      {
        const tl = mk('.sc-epilogue');
        const n = actor('.sc-epilogue .actor', 'stand', { dir: 1 });
        drawAll(tl, n);
        tl.from('.ep-ridge', { y: vh(40), duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0)
          .to('.ep-sun', { y: vh(46), duration: 3.2 }, 0.2)
          .to('.ep-night', { opacity: 0.88, duration: 2.6 }, 0.8)
          .fromTo('.ep-stars', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 2.2);
        show(tl, '.sc-epilogue .chcard', 0.2, 0.4, { x: -60 });
        hide(tl, '.sc-epilogue .chcard', 1.1);
        show(tl, '.ep-b1', 1.0, 0.3, { scale: 0.4 }); hide(tl, '.ep-b1', 1.9);
        pose(tl, n, 'lookUp', 1.0, 0.4);
        tl.to(n.P, { dir: -1, duration: 0.3 }, 1.9);
        pose(tl, n, 'wave', 2.0, 0.3, { dir: -1 });
        show(tl, '.ep-b2', 2.1, 0.3, { scale: 0.4 }); hide(tl, '.ep-b2', 3.0);
        pose(tl, n, 'stand', 3.0, 0.3, { dir: -1 });
        show(tl, '.ep-final', 3.1, 0.4);
        tl.fromTo('.polaroid', { y: vh(-50), rotate: 30, autoAlpha: 0 }, { y: 0, rotate: 8, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.4)' }, 3.2);
        tl.fromTo('.ep-contact > *', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08 }, 3.3);
        tl.to({}, { duration: 0.8 }, 4.2);
      }

      ScrollTrigger.refresh();
    }, el);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    return () => { unsub(); ctx.revert(); };
  }, []);

  useEffect(() => () => { store.journey = 0; }, []);

  useEffect(() => {
    const el = root.current?.querySelector('.pro-role');
    if (!el) return undefined;
    let i = 0;
    const id = setInterval(() => {
      if (window.scrollY > window.innerHeight * 1.5 || document.hidden) return;
      i = (i + 1) % ROLES.length;
      gsap.to(el, { duration: 0.9, scrambleText: { text: ROLES[i], chars: 'アイウエオカキクケコ01', speed: 0.6 }, ease: 'none' });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  // mouse parallax: layers and characters drift by depth (CSS `translate`, so GSAP transforms stay free)
  useEffect(() => {
    const el = root.current;
    const near = new Set();
    let raf, mx = 0, my = 0, wx = 9, wy = 9;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const st = e.target.querySelector('.stage');
      e.target.classList.toggle('is-near', e.isIntersecting);
      if (e.isIntersecting) near.add(st); else near.delete(st);
      wx = 9;
    }), { rootMargin: '60% 0px' });
    el.querySelectorAll('.scene').forEach((s) => io.observe(s));
    const loop = () => {
      raf = requestAnimationFrame(loop);
      mx += (store.mouse.x - mx) * 0.06;
      my += (store.mouse.y - my) * 0.06;
      if (Math.abs(mx - wx) < 0.002 && Math.abs(my - wy) < 0.002) return;
      wx = mx; wy = my;
      const a = mx.toFixed(3), b = (-my).toFixed(3);
      near.forEach((st) => { st.style.setProperty('--mx', a); st.style.setProperty('--my', b); });
    };
    loop();
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  // click anywhere on a scene to strike: slash line, ink drops and a 斬 stamp
  useEffect(() => {
    const el = root.current;
    const onDown = (e) => {
      if (e.button !== 0 || e.target.closest('a, button, input, .win, .ccard, .mk-item, .chmenu, .wanted')) return;
      const stage = e.target.closest('.stage');
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const fx = document.createElement('div');
      fx.className = 'cut';
      fx.style.left = `${e.clientX - r.left}px`;
      fx.style.top = `${e.clientY - r.top}px`;
      fx.style.setProperty('--a', `${-40 + Math.random() * 80}deg`);
      fx.innerHTML = '<i class="cut-line"></i><b class="cut-kanji">斬</b>' + '<span class="cut-drop"></span>'.repeat(7);
      stage.appendChild(fx);
      const drops = fx.querySelectorAll('.cut-drop');
      gsap.timeline({ onComplete: () => fx.remove() })
        .fromTo(fx.querySelector('.cut-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.1, ease: 'power4.out' }, 0)
        .to(fx.querySelector('.cut-line'), { opacity: 0, scaleY: 0.2, duration: 0.35 }, 0.16)
        .fromTo(fx.querySelector('.cut-kanji'), { scale: 2.6, autoAlpha: 0, rotate: -24 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.18, ease: 'back.out(3)' }, 0.04)
        .to(fx.querySelector('.cut-kanji'), { autoAlpha: 0, y: -40, duration: 0.45 }, 0.55)
        .fromTo(drops, { x: 0, y: 0, scale: 1 }, {
          x: () => (Math.random() - 0.5) * 220, y: () => (Math.random() - 0.2) * 160, scale: 0, duration: 0.7, ease: 'power2.out',
        }, 0.04);
      store.impact = 1;
    };
    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <div className="story" ref={root}>
      {/* HUD */}
      <ChapterMenu chapters={CHAPTERS} active={chapter} open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} onJump={jump} />
      <KatanaMeter chapters={CHAPTERS} active={chapter} />

      {/* ====== PROLOGUE ====== */}
      <section className="scene sc-prologue" style={{ '--len': 3.2 }} aria-label="Prologue">
        <div className="stage ink-stage">
          <Layer className="pro-stars"><g fill="#f6f3ec">{Array.from({ length: 90 }, (_, i) => <circle key={i} cx={(i * 397) % W} cy={(i * 211) % 520} r={(i % 3) * 0.7 + 0.6} opacity={0.3 + (i % 5) * 0.12} />)}</g></Layer>
          <div className="pro-moon" />
          <Layer className="pro-far"><Ridge seed={11} base={700} peaks={6} height={300} spread={180} fill="#1d1d24" /></Layer>
          <Layer className="pro-mid"><Ridge seed={23} base={790} peaks={5} height={220} spread={150} fill="#131318" /><Clouds seed={5} y={640} count={4} fill="#2a2a33" opacity={0.6} /></Layer>
          <Layer className="pro-cliff"><path d={`M ${W * 0.56} ${H + 40} L ${W * 0.6} 740 Q ${W * 0.66} 700 ${W * 0.78} 712 L ${W + 40} 700 L ${W + 40} ${H + 40} Z`} fill="#050506" /></Layer>
          <Actor className="pro-ninja" pose="lookUp" glow />
          <span className="pro-brush" aria-hidden="true">道</span>
          <span className="pro-vert" aria-hidden="true">人工知能の道を行く者 ── 第二巻</span>
          <div className="pro-tapes" aria-hidden="true">
            <Tape className="tape--ink" reverse />
            <Tape className="tape--red" />
          </div>
          <Particles kind="motes" count={30} seed={3} />
          <CoverHero name={ME.name} />
          <div className="cover-flash" />
          <div className="pro-copy">
            <span className="pro-kicker mono"><b className="pro-weekly">週刊</b> The Weekly Ink · Vol. 02</span>
            <h1 className="pro-title" aria-label="The Way of the Code"><span className="ln">THE WAY</span><span className="ln"><span className="pro-out">OF THE</span> <em className="pro-glitch">CODE</em><i className="pro-caret" aria-hidden="true" /></span></h1>
            <p className="pro-sub">The story of {ME.name}, so far. <span className="pro-role-wrap"><span className="pro-role-tag mono">現在</span><span className="pro-role">{ROLES[0]}</span></span></p>
            <ul className="pro-teasers">
              <li><b>★</b> {PROJECTS.length} projects inside, battle-tested</li>
              <li><b>★</b> Exclusive: life at IIT Gandhinagar</li>
              <li><b>★</b> {POSTS.length} scrolls of hard-won knowledge</li>
            </ul>
            <div className="pro-buy"><Barcode /><span className="mono">Price · ¥0<br />Free for collaborators</span></div>
            <span className="pro-hint mono">Scroll to begin <i /></span>
            <span className="pro-tip mono">Tip · click anywhere to strike · 目次 bottom-left to jump chapters</span>
          </div>
          <div className="cap pro-cap"><span>Narrator</span>Every legend begins with a single leap.</div>
          <div className="cv cv-end cv-paper" />
        </div>
      </section>

      {/* ====== THE WANDERER ====== */}
      <section className="scene sc-intro" style={{ '--len': 4.6 }} aria-label="Character introduction">
        <div className="stage paper-stage">
          <div className="wd-sky" />
          <div className="wd-rain" />
          <figure className="wd-key"><Wanderer /></figure>
          <WantedPoster name={ME.name} />
          <div className="wd-card">
            <div className="wd-card-head">
              <span className="mono">Character file · 人物</span>
              <h2>The Wandering<br />Engineer</h2>
            </div>
            {PROFILE.map(([jp, k, v]) => (
              <div className="wd-row" key={k}><span className="wd-jp">{jp}</span><span className="wd-k">{k}</span><b>{v}</b></div>
            ))}
          </div>
          <div className="wd-strip">
            <figure className="wd-close wd-close--eyes"><Wanderer view="eyes" rain={false} /></figure>
            <figure className="wd-close wd-close--hand"><Wanderer view="hand" rain={false} /></figure>
            <figure className="wd-close wd-close--hat"><Wanderer view="face" /></figure>
          </div>
          <span className="wd-sfx sfx" aria-hidden="true">ザァァァ</span>
          <div className="cap cap--b wd-cap"><span>Narrator</span>No master. No clan. Just a keyboard and a long road.</div>
          <div className="flash" />
          <div className="cv cv-end cv-paper" />
        </div>
      </section>

      {/* ====== 1 · ORIGIN ====== */}
      <section className="scene sc-origin" style={{ '--len': 5.2 }} aria-label="Chapter one, origin">
        <div className="stage paper-stage">
          <div className="sky sky--dawn" />
          <div className="org-sun sun" />
          <Layer className="org-far"><Ridge seed={41} base={620} peaks={5} height={220} spread={200} fill="#d8d0c2" /><Clouds seed={8} y={330} count={5} fill="#fff" opacity={0.8} /></Layer>
          <Layer className="org-mid"><Ridge seed={52} base={690} peaks={6} height={150} spread={140} fill="#aaa298" /><Birds seed={4} /></Layer>
          <Layer className="org-river"><River y={730} /></Layer>
          <Layer className="org-village" style={{ color: '#0d0d0f' }}><Village seed={77} y={760} count={7} /></Layer>
          <Particles kind="petals" count={28} seed={11} />
          <Actor className="org-ninja" />
          <ChapterCard no="第一章 · Chapter 1" jp="起" title="Origin" />
          <div className="cap cap--tl org-cap1"><span>{ME.home}</span>Prayagraj, Uttar Pradesh. Where two rivers meet.</div>
          <div className="cap cap--tl org-cap2"><span>Narrator</span>Every story starts somewhere. This one starts here.</div>
          <div className="bubble org-bubble">One day, I'll build machines that <b>think.</b></div>
          <Shutters className="sh-ink" />
        </div>
      </section>

      {/* ====== 2 · TRAINING ====== */}
      <section className="scene sc-training" style={{ '--len': 7.4 }} aria-label="Chapter two, training">
        <div className="stage ink-stage">
          <Layer className="dojo"><Dojo /></Layer>
          {['Mathematics', 'Physics', 'Chemistry'].map((t, i) => (
            <div className="banner" key={t} style={{ left: `${30 + i * 18}%` }}><span>{['数', '物', '化'][i]}</span><em>{t}</em></div>
          ))}
          {[1, 2].map((k) => (
            <div className={`trial trial-${k}`} key={k}>
              <div className="trial-label">
                <span className="mono">Trial {k === 1 ? 'I' : 'II'} · {k === 1 ? 'Class X' : 'Class XII'} · CBSE</span>
                <b>{k === 1 ? 'Gurukul Academy · 2021–22' : 'Maths · Physics · Chemistry · 2023–24'}</b>
              </div>
              <div className="trial-num">0.0%</div>
              <svg className="makiwara" viewBox="-80 -300 160 340" aria-hidden="true">
                <g className="mk-bot"><Makiwara /></g>
                <g className="mk-top" style={{ clipPath: 'inset(0 0 62% 0)' }}><Makiwara /></g>
              </svg>
              <div className="slashfx" />
              <div className="stamp">合格<small>PASSED</small></div>
            </div>
          ))}
          <Particles kind="motes" count={36} seed={21} />
          <Actor className="trn-ninja" glow />
          <ChapterCard no="第二章 · Chapter 2" jp="修" title="Training" />
          <div className="cap cap--tl trn-cap"><span>2021 – 2024</span>Gurukul Academy, Lucknow. Years of discipline.</div>
          <div className="cap cap--b trn-done"><span>Result</span>Two trials. Two clean cuts. On to the next road.</div>
          <div className="door door-l" /><div className="door door-r" />
          <div className="flash" />
          <div className="cv cv-end cv-red" />
        </div>
      </section>

      {/* ====== 3 · JOURNEY ====== */}
      <section className="scene sc-journey" style={{ '--len': 6.2 }} aria-label="Chapter three, the journey">
        <div className="stage paper-stage">
          <div className="jr-sky" />
          <Layer className="jr-stars"><g fill="#fbf8f1">{Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i * 263) % W} cy={(i * 149) % 420} r={(i % 3) * 0.6 + 0.6} />)}</g></Layer>
          <Suspense fallback={null}>
            <Scene3D progressKey="journey" className="jr-3d" active={journeyOn} />
          </Suspense>
          <div className="jr-speed speed-burst" />
          <Actor className="jr-ninja" />
          <ChapterCard no="第三章 · Chapter 3" jp="旅" title="The Journey" />
          <div className="cap cap--tl jr-cap1"><span>July 2025</span>A new road opens.</div>
          <div className="cap cap--tl jr-cap2"><span>JEE Main → JEE Advanced</span>Two exams stood before the gates of IIT Gandhinagar. He cleared both.</div>
          <div className="cap cap--tl jr-cap3"><span>The path</span>{ME.degree}.</div>
          <figure className="jr-map" aria-label="Route map from Prayagraj via Lucknow to Gandhinagar">
            <figcaption className="mono">旅の地図 · The route</figcaption>
            <svg viewBox="0 0 300 220">
              {Array.from({ length: 11 }, (_, i) => <line key={`v${i}`} x1={20 + i * 26} x2={20 + i * 26} y1="10" y2="210" className="jr-grid" />)}
              {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} y1={20 + i * 26} y2={20 + i * 26} x1="10" x2="290" className="jr-grid" />)}
              <g transform="translate(262 186)" className="jr-compass"><circle r="14" /><path d="M0 -12 L4 0 L0 12 L-4 0 Z" /><text y="-17" textAnchor="middle">N</text></g>
              <path d={ROUTE} className="jr-route-ghost" />
              <path d={LEG1} className="jr-leg1" fill="none" stroke="none" />
              <path d={ROUTE} className="jr-route" />
              {STOPS.map((s, i) => (
                <g key={s.name} className="jr-stop" transform={`translate(${s.at[0]} ${s.at[1]})`}>
                  <circle r="6" />
                  <text x={i === 2 ? 10 : -10} y={i === 1 ? -10 : 18} textAnchor={i === 2 ? 'start' : 'end'}>{s.name}</text>
                </g>
              ))}
              <circle className="jr-dot" r="5" />
            </svg>
            <div className="jr-odo"><b className="jr-km">0</b><span>km travelled<br />as the crow flies</span></div>
          </figure>
          {STOPS.map((s, i) => (
            <div className={`jr-post jr-post-${i}`} key={s.name} aria-hidden="true">
              <div className="jr-post-board"><b>{s.kana}</b><span>{s.name}</span><em>{s.km.toLocaleString()} km · {s.what}</em></div>
              <i />
            </div>
          ))}
          <div className="jr-ticket">
            <div className="jr-ticket-main">
              <span className="mono">乗車券 · One-way ticket · July 2025</span>
              <div className="jr-ticket-route"><b>PRAYAGRAJ</b><i>→</i><b>IIT GANDHINAGAR</b></div>
              <div className="jr-ticket-meta mono"><span>Via · JEE Main + Advanced</span><span>Class · B.Tech AI</span><span>Seat · 2025</span><span>Return · not planned</span></div>
            </div>
            <div className="jr-ticket-stub"><span className="jr-punch" /><span className="mono">No. 0001</span></div>
            <span className="jr-stamp">入学<small>ADMITTED</small></span>
          </div>
          <div className="jr-split jr-split-a" /><div className="jr-split jr-split-b" />
          <div className="cv cv-end cv-paper" />
        </div>
      </section>

      {/* ====== 3½ · THE THOUSAND GATES ====== */}
      <section className="scene sc-gates" style={{ '--len': 8 }} aria-label="Interlude, running along the thousand gates">
        <div className="stage gt-stage">
          <div className="gt-sky" />
          <div className="gt-sun">{[[58, 3], [68, 5], [78, 7], [88, 10]].map(([t, h]) => <i key={t} style={{ '--t': `${t}%`, '--h': `${h}%` }} />)}</div>
          <Layer className="gt-far"><Ridge seed={141} base={700} peaks={6} height={260} spread={200} fill="#c2552f" /></Layer>
          <Layer className="gt-mid"><Ridge seed={143} base={780} peaks={5} height={200} spread={170} fill="#7a1f1f" /><Clouds seed={9} y={560} count={4} fill="#ffe3c4" opacity={0.5} /></Layer>
          <Particles kind="petals" count={20} seed={41} />
          <div className="gt-track"><ThousandGates /></div>
          <Actor className="gt-ghost" />
          <Actor className="gt-ghost" />
          <Actor className="gt-runner" glow />
          <div className="gt-fore" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--x': `${60 + i * 74}vw` }} />)}</div>
          <div className="gt-speed speed-burst" />
          <ChapterCard no="幕間 · Interlude" jp="門" title="The Thousand Gates" />
          <div className="gt-hud">
            <b className="gt-hud-k">門</b>
            <div className="gt-hud-box">
              <span className="mono">千本鳥居 · Gate</span>
              <strong className="gt-count">01</strong><em>/ {String(GATES.length).padStart(2, '0')}</em>
              <p className="gt-now"><b className="gt-now-jp">{GATES[0].jp}</b><span className="gt-now-en">{GATES[0].en}</span></p>
            </div>
          </div>
          <div className="cap gt-cap gt-cap1"><span>Narrator</span>Every skill is a gate. He runs them all.</div>
          <div className="cap gt-cap gt-cap2"><span>Inscription</span>奉納: each gate, dedicated to one thing learned.</div>
          <div className="flash gt-flash" />
          <div className="jr-ai gt-ai"><span>人工知能</span><em>Artificial Intelligence</em></div>
          <div className="cv gt-cv-start cv-paper" />
          <div className="cv cv-end cv-paper" />
        </div>
      </section>

      {/* ====== 4 · TECHNIQUES ====== */}
      <section className="scene sc-tech" style={{ '--len': 6 }} aria-label="Chapter four, three techniques">
        <div className="stage paper-stage">
          <Layer className="tech-far"><Ridge seed={91} base={560} peaks={4} height={260} spread={220} fill="#ddd6ca" /><Ridge seed={93} base={640} peaks={5} height={140} spread={160} fill="#c7bfb2" /></Layer>
          <div className="tech-mist" />
          <Particles kind="petals" count={22} seed={31} />
          <div className="tech-row">
            {PILLARS.map((p, i) => (
              <div className={`master master-${i}`} key={p.title}>
                <span className="tech-kanji">{p.kanji}</span>
                <Actor variant="samurai" />
                <div className="tech-plinth" />
                <div className="tech-card">
                  <span className="mono">Technique {i + 1} · {p.reading}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <ChapterCard no="第四章 · Chapter 4" jp="技" title="Three Techniques" />
          <div className="cap cap--b tech-cap"><span>The lesson</span>Three disciplines. One system.</div>
          <div className="iris" />
        </div>
      </section>

      {/* ====== 5 · BATTLES ====== */}
      <section className="scene sc-battle" style={{ '--len': 2.6 + FEATURED.length * DUEL + 0.9 }} aria-label="Chapter five, battles: projects">
        <div className="stage ink-stage">
          <div className="bt-sun" />
          <Layer className="bt-ground"><Bamboo seed={6} count={7} fill="#121216" /><Ridge seed={131} base={800} peaks={3} height={60} spread={300} fill="#050506" /></Layer>
          <div className="wind" />
          <Particles kind="embers" count={40} seed={41} />
          {FEATURED.map((p, i) => (
            <div className={`duel duel-${i}`} key={p.slug}>
              <Actor variant="oni" className="oni oni-top" glow />
              <Actor variant="oni" className="oni oni-bot" glow />
              <div className="vs" aria-hidden="true">
                <div className="vs-bar vs-bar--a"><span className="mono">Player 1</span><b>{ME.name.split(' ')[0].toUpperCase()}</b><em>解放 · battle form</em></div>
                <div className="vs-bar vs-bar--b"><span className="mono">Boss {String(i + 1).padStart(2, '0')}</span><b className="vs-jp">{BOSSES[p.slug]?.[0]}</b><em>{BOSSES[p.slug]?.[1]}</em></div>
                <span className="vs-mark">VS</span>
              </div>
              <div className="problem">
                <div className="ph ph--a"><span>The problem · {BOSSES[p.slug]?.[1]}</span>{PROBLEMS[p.slug]}</div>
                <div className="ph ph--b" aria-hidden="true"><span>The problem · {BOSSES[p.slug]?.[1]}</span>{PROBLEMS[p.slug]}</div>
              </div>
              <span className="duel-sfx sfx" aria-hidden="true">{SFX[i % SFX.length]}</span>
              <article className="win">
                <div className="win-art"><ProjectLogo project={p} /><span className="win-ko">斬</span><span className="win-stamp"><b>撃破</b><small>{BOSSES[p.slug]?.[1]} · defeated</small></span></div>
                <div className="win-body">
                  <span className="mono">Battle {String(i + 1).padStart(2, '0')} · Won with</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <ul className="win-stats" aria-label="Focus profile">
                    {topStats(p).map(([k, v]) => <li key={k}><span className="mono">{k}</span><span className="ws-bar"><i style={{ width: `${v}%` }} /></span><b>{v}</b></li>)}
                  </ul>
                  <ul className="pc-stack">{p.stack.map((s) => <li key={s}>{TECH_LOGOS[s] && <img src={TECH_LOGOS[s]} alt="" loading="lazy" />}{s}</li>)}</ul>
                  <div className="win-links">
                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn btn--red btn--sm">Live <ArrowUpRight size={14} /></a>}
                    {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn btn--line btn--sm"><Github size={14} /> Code</a>}
                  </div>
                </div>
              </article>
            </div>
          ))}
          <div className="release-dark" />
          <div className="release-aura" />
          <div className="release-ring" />
          <div className="release-kanji"><span>解放</span><em>RELEASE · battle form</em></div>
          <Actor className="hero-ninja" pose="guard" glow />
          <div className="slashfx slashfx--wide" />
          <ChapterCard no="第五章 · Chapter 5" jp="戦" title="Battles" />
          <div className="cap cap--tl bt-cap"><span>Projects</span>Every project started as a problem worth fighting.</div>
          <ol className="bt-tally" aria-label="Problems defeated">
            {FEATURED.map((p, i) => <li key={p.slug} className={`tally-${i}`} title={`${BOSSES[p.slug]?.[1]} · ${p.title}`}><b>{BOSSES[p.slug]?.[0][0]}</b><i /></li>)}
          </ol>
          <div className="bt-count mono">Battle <b>01</b> / {String(FEATURED.length).padStart(2, '0')}</div>
          <div className="bt-all">
            <span className="mono">{FEATURED.length} battles shown · {PROJECTS.length} fought in total</span>
            <TLink href="/projects2/" className="btn btn--red" data-cursor="ALL">See every project <ArrowRight size={16} /></TLink>
          </div>
          <div className="flash" />
          <div className="cv cv-end cv-ink" />
        </div>
      </section>

      {/* ====== 6 · ARSENAL ====== */}
      <section className="scene sc-arsenal" style={{ '--len': 5 }} aria-label="Chapter six, the arsenal: skills">
        <div className="stage ink-stage">
          <div className="ars-wall" />
          <Particles kind="embers" count={18} seed={51} />
          <div className="wgrid">
            {SKILLS.map((c, i) => (
              <div className="wslot" key={c.category} data-rot={[-8, 6, 0, -4, 8, -6][i]}>
                <svg className="weapon" viewBox="-215 -165 430 330" aria-hidden="true"><Weapon kind={WEAPON_FOR[i]} /></svg>
                <span className="thunk sfx sfx--sm">ザクッ</span>
                <div className="wtag">
                  <span className="wtag-jp">{c.jp}</span>
                  <b>{c.category}</b>
                  <span className="wtag-logos">
                    {c.items.map((s) => (s.logo ? <img key={s.name} src={s.logo} alt={s.name} title={`${s.name} · ${s.level}`} loading="lazy" /> : <i key={s.name} title={s.name}>{s.name.split(' ')[0]}</i>))}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <ChapterCard no="第六章 · Chapter 6" jp="武" title="The Arsenal" />
          <div className="cap cap--b ars-cap"><span>Skills</span>{SKILL_COUNT} tools. Every one sharpened. <TLink href="/skills2/" className="ulink">Full skill tree →</TLink></div>
          <div className="cv cv-end cv-paper cv-rise" />
        </div>
      </section>

      {/* ====== 7 · SCROLLS ====== */}
      <section className="scene sc-scrolls" style={{ '--len': 4 }} aria-label="Chapter seven, scrolls: blog">
        <div className="stage paper-stage">
          <Layer className="scr-bg"><Ridge seed={151} base={760} peaks={4} height={200} spread={240} fill="#e3ddd1" /></Layer>
          <div className="makimono">
            <div className="mk-rod mk-rod--l" />
            <div className="mk-paper">
              <div className="mk-head">
                <span className="mk-title">書 · The Ink Log</span>
                <span className="mono">
                  {gh.profile ? `${gh.profile.public_repos} repos · ` : ''}
                  {gh.contrib?.source === 'calendar' ? `${gh.contrib.total.toLocaleString()} contributions this year · ` : ''}
                  {POSTS.length} posts
                </span>
              </div>
              <div className="mk-items">
                {latest.map((p) => (
                  <TLink href={postUrl(p.slug)} className="mk-item" key={p.slug} data-cursor="READ">
                    <div className="mk-art"><Cover motif={p.motif} seed={p.seed} kanji={p.kanji} /></div>
                    <span className="mono">{fmtDate(p.date)} · {p.minutes} min</span>
                    <h3>{p.title}</h3>
                  </TLink>
                ))}
              </div>
              <div className="mk-foot">
                <TLink href="/blog2/" className="btn btn--ink btn--sm">Read the whole log <ArrowRight size={14} /></TLink>
                <TLink href="/github2/" className="btn btn--line btn--sm"><Github size={14} /> Commit log</TLink>
              </div>
            </div>
            <div className="mk-rod mk-rod--r" />
          </div>
          <ChapterCard no="第七章 · Chapter 7" jp="書" title="Scrolls of Knowledge" />
          <div className="cv cv-end cv-paper" />
        </div>
      </section>

      {/* ====== THE SUMMIT ====== */}
      <section className="scene sc-summit" style={{ '--len': 4.6 }} aria-label="The summit: GitHub records">
        <div className="stage paper-stage">
          <div className="sm-sky" />
          <Layer className="sm-far"><Ridge seed={201} base={600} peaks={5} height={300} spread={170} fill="#e9e6e0" /><Ridge seed={207} base={700} peaks={4} height={180} spread={200} fill="#d2cdc4" /></Layer>
          <div className="snow snow--far" /><div className="snow snow--near" />
          <Layer className="sm-shrine"><Shrine /></Layer>
          <div className="ema-rack">
            <div className="ema-beam" />
            {[
              ['Public repos', gh.profile?.public_repos],
              ['Contributions · 1y', gh.contrib?.source === 'calendar' ? gh.contrib.total : null],
              ['Current streak', gh.streaks ? `${gh.streaks.current.len}d` : null],
              ['Longest streak', gh.streaks ? `${gh.streaks.longest.len}d` : null],
              ['Stars', gh.repos?.length ? gh.stars : null],
              ['Followers', gh.profile?.followers],
            ].map(([k, v], i) => (
              <div className="ema" key={k} style={{ '--sw': `${(i % 3) * 0.4}s` }}>
                <i className="ema-string" />
                <div className="ema-board">
                  <b>{v == null ? (gh.loading ? '…' : '—') : typeof v === 'number' ? v.toLocaleString() : v}</b>
                  <span>{k}</span>
                </div>
              </div>
            ))}
          </div>
          <Actor className="sm-ninja" />
          <ChapterCard no="第八章 · Chapter 8" jp="頂" title="The Summit" />
          <div className="cap cap--tl sm-cap"><span>Live from GitHub</span>Every commit, an offering. <TLink href="/github2/" className="ulink">Read the full record →</TLink></div>
          <div className="cv cv-end cv-red" />
        </div>
      </section>

      {/* ====== 8 · EPILOGUE ====== */}
      <section className="scene sc-epilogue" style={{ '--len': 5 }} aria-label="Epilogue, contact" id="contact">
        <div className="stage red-stage">
          <div className="ep-sun" />
          <div className="ep-night" />
          <Layer className="ep-stars"><g fill="#f6f3ec">{Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i * 331) % W} cy={(i * 157) % 480} r={(i % 3) * 0.7 + 0.6} />)}</g></Layer>
          <Layer className="ep-ridge"><Ridge seed={171} base={680} peaks={5} height={240} spread={190} fill="#7e0a1a" /></Layer>
          <Layer className="ep-ridge"><Ridge seed={177} base={760} peaks={4} height={150} spread={160} fill="#3d0710" /></Layer>
          <Layer className="ep-ridge"><path d={`M -40 ${H + 40} L -40 760 Q ${W * 0.2} 720 ${W * 0.42} 770 L ${W * 0.46} ${H + 40} Z`} fill="#050506" /></Layer>
          <Particles kind="fireflies" count={26} seed={61} />
          <Actor className="ep-ninja" glow />
          <div className="bubble ep-b1">This story isn't finished.</div>
          <div className="bubble ep-b2">The next chapter needs a <b>co-author.</b></div>
          <ChapterCard no="終章 · Epilogue" jp="次" title="To be continued" />
          <div className="ep-final">
            <Polaroid name={ME.name} />
            <h2>To be continued<em>→</em></h2>
            <p>Research, AI products or a full-stack build: let's write the next chapter together.</p>
            <div className="ep-contact">
              <a href={ME.mailto} target="_blank" rel="noreferrer" className="ccard ccard--red"><Mail size={20} /><span>Email</span><b>{ME.email}</b></a>
              <a href={ME.github} target="_blank" rel="noreferrer" className="ccard"><Github size={20} /><span>GitHub</span><b>@{ME.githubHandle}</b></a>
              <a href={ME.linkedin} target="_blank" rel="noreferrer" className="ccard"><Linkedin size={20} /><span>LinkedIn</span><b>/in/{ME.linkedinHandle}</b></a>
              <a href={ME.campusMap} target="_blank" rel="noreferrer" className="ccard"><Briefcase size={20} /><span>University</span><b>{ME.campus}</b></a>
              <a href={ME.homeMap} target="_blank" rel="noreferrer" className="ccard"><Home size={20} /><span>Home town</span><b>{ME.home}</b></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
