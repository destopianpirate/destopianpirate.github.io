import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Github, Linkedin, Mail, Menu, X } from 'lucide-react';
import { ME, NAV } from '../data/portfolio';
import { store, isTouch, reducedMotion } from '../core/store';
import { setScrollLocked, useSmoothScroll } from '../core/smooth';
import { markIntroDone, navigate, setNavigator } from '../core/intro';
import Hanko from './Hanko';

const SEEN_KEY = 'v2-seen';
const NAV_KEY = 'v2-nav';

const ssGet = (k) => {
  try {
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
};
const ssSet = (k, v) => {
  try {
    if (v === null) sessionStorage.removeItem(k);
    else sessionStorage.setItem(k, v);
  } catch {
    /* storage blocked: transitions still work, the loader just replays */
  }
};

/** Internal link that plays the page-transition curtain before leaving. */
export function TLink({ href, children, onClick, ...rest }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

const pageLabel = (href) => {
  const key = href.split('/').filter(Boolean)[0]?.replace(/\?.*$/, '');
  return NAV.find((n) => n.key === key) || NAV[0];
};

/* ------------------------------------------------------------------ */
/* Opening loader: brush ensō + counter, then a diagonal slash splits it */
function Loader({ onDone }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const count = { v: 0 };
    const num = el.querySelector('.ld-num');
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: onDone });
      tl.set(el, { autoAlpha: 1 })
        .fromTo('.ld-enso path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
        .to(count, { v: 100, duration: 1.6, ease: 'power3.inOut', onUpdate: () => { num.textContent = String(Math.round(count.v)).padStart(3, '0'); } }, 0)
        .from('.ld-kanji span', { yPercent: 110, duration: 0.9, stagger: 0.12, ease: 'expo.out' }, 0.15)
        .from('.ld-meta > *', { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, 0.3)
        // impact frame
        .to('.ld-flash', { opacity: 1, duration: 0.05 }, 1.7)
        .to('.ld-flash', { opacity: 0, duration: 0.25 }, 1.78)
        .to('.ld-content', { autoAlpha: 0, scale: 1.08, duration: 0.3 }, 1.75)
        .fromTo('.ld-slash', { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'expo.in' }, 1.85)
        .to('.ld-half--a', { xPercent: -30, yPercent: -110, duration: 0.9, ease: 'expo.inOut' }, 2.2)
        .to('.ld-half--b', { xPercent: 30, yPercent: 110, duration: 0.9, ease: 'expo.inOut' }, 2.2)
        .to('.ld-slash', { autoAlpha: 0, duration: 0.3 }, 2.3);
    }, el);
    return () => ctx.revert();
  }, [onDone]);

  return (
    <div className="ld" ref={ref} aria-hidden="true">
      <div className="ld-half ld-half--a" />
      <div className="ld-half ld-half--b" />
      <div className="ld-slash" />
      <div className="ld-content">
        <svg className="ld-enso" viewBox="0 0 200 200">
          <path pathLength="1" d="M150 40c-30-26-86-22-112 14-26 36-14 92 30 110 44 18 98-4 108-52 6-30-6-52-20-66" />
        </svg>
        <div className="ld-num">000</div>
        <div className="ld-kanji"><span>起</span><span>動</span></div>
        <div className="ld-meta">
          <span>EPISODE 02</span>
          <span>読み込み中 · LOADING</span>
          <span>{ME.name.toUpperCase()}</span>
        </div>
      </div>
      <div className="ld-flash" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page curtain: 6 skewed strips sweep in, then out on the next page */
function Curtain({ arriving, label, onRevealed }) {
  const ref = useRef(null);
  const [text, setText] = useState(label);

  useLayoutEffect(() => {
    const el = ref.current;
    const strips = el.querySelectorAll('.ct-strip');
    // transforms live only in GSAP (a CSS scaleY(0) start state can't be decomposed back)
    gsap.set(strips, { skewX: -6, scaleX: 1.08 });
    const reset = () => {
      gsap.set(el, { autoAlpha: 0 });
      gsap.set(strips, { scaleY: 0 });
    };

    if (arriving) {
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(strips, { scaleY: 1, transformOrigin: '50% 0%' });
      gsap.set('.ct-label', { autoAlpha: 1 });
      gsap.timeline({ delay: 0.15, onComplete: () => { reset(); onRevealed(); } })
        .to(el.querySelector('.ct-label'), { autoAlpha: 0, y: -30, duration: 0.35, ease: 'power2.in' })
        .to(strips, { scaleY: 0, duration: 0.7, ease: 'expo.inOut', stagger: 0.05 }, 0.1);
    } else {
      reset();
    }

    setNavigator((href) => {
      const target = pageLabel(href);
      setText(target);
      if (reducedMotion()) {
        window.location.href = href;
        return;
      }
      ssSet(NAV_KEY, '1');
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(strips, { transformOrigin: '50% 100%' });
      gsap.timeline({ onComplete: () => { window.location.href = href; } })
        .to(strips, { scaleY: 1, duration: 0.6, ease: 'expo.inOut', stagger: 0.05 })
        .fromTo(el.querySelector('.ct-label'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'expo.out' }, 0.45);
    });

    // coming back via the browser's back/forward cache: lift the curtain we left down
    const onShow = (e) => {
      if (e.persisted) {
        reset();
        ssSet(NAV_KEY, null);
      }
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [arriving, onRevealed]);

  return (
    <div className="ct" ref={ref} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => <div className={`ct-strip ${i % 2 ? 'is-ink' : ''}`} key={i} />)}
      <div className="ct-label">
        <span className="ct-jp">{text.jp}</span>
        <span className="ct-en">{text.label}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (isTouch()) return;
    document.documentElement.classList.add('has-cursor');
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.08 });
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.08 });
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' });
    const yr = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' });
    const move = (e) => { document.documentElement.classList.add('cursor-live'); xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); };
    const over = (e) => {
      const t = e.target.closest?.('a, button, [data-cursor], input, select, textarea');
      ring.current.classList.toggle('is-hover', !!t);
      setLabel(t?.dataset?.cursor || '');
    };
    const down = () => ring.current.classList.add('is-down');
    const up = () => ring.current.classList.remove('is-down');
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, []);
  if (typeof window !== 'undefined' && isTouch()) return null;
  return (
    <>
      <div className="cur-ring" ref={ring}><span>{label}</span></div>
      <div className="cur-dot" ref={dot} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Anime speed lines that flare with scroll velocity */
function SpeedLines() {
  const ref = useRef(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, dpr = 1, raf = 0, shown = 0;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
    };
    size();
    window.addEventListener('resize', size);
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const target = Math.min(1, Math.max(0, (Math.abs(store.velocity) - 8) / 45));
      shown += (target - shown) * 0.2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (shown < 0.02) return;
      const cx = w / 2, cy = h / 2;
      const R = Math.hypot(w, h) / 2;
      const inner = R * (0.62 - shown * 0.18);
      ctx.fillStyle = `rgba(255,255,255,${0.55 * shown})`;
      const n = 120;
      for (let i = 0; i < n; i++) {
        if (Math.random() > 0.72) continue;
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.04;
        const spread = 0.004 + Math.random() * 0.012;
        const r0 = inner + Math.random() * R * 0.25;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a - spread) * R * 1.1, cy + Math.sin(a - spread) * R * 1.1);
        ctx.lineTo(cx + Math.cos(a + spread) * R * 1.1, cy + Math.sin(a + spread) * R * 1.1);
        ctx.closePath();
        ctx.fill();
      }
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, []);
  return <canvas className="speedlines" ref={ref} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
function TopProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (ref.current) ref.current.style.transform = `scaleX(${store.progress})`;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <div className="topbar" aria-hidden="true"><span ref={ref} /></div>;
}

/* ------------------------------------------------------------------ */
function Nav({ page }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  // hide on scroll down, return on scroll up
  useEffect(() => {
    let last = 0, hidden = false, raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const y = window.scrollY;
      const goingDown = y > last + 4;
      const goingUp = y < last - 4;
      if (goingDown && y > 160 && !hidden) { hidden = true; ref.current?.classList.add('is-hidden'); }
      if ((goingUp || y < 160) && hidden) { hidden = false; ref.current?.classList.remove('is-hidden'); }
      ref.current?.classList.toggle('is-scrolled', y > 40);
      last = y;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    setScrollLocked(open);
    if (!open) return;
    gsap.fromTo('.mmenu-link', { yPercent: 120, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out', delay: 0.2 });
  }, [open]);

  return (
    <>
      <header className="nav" ref={ref}>
        <TLink href="/home2/" className="nav-brand" data-cursor="HOME">
          <span className="nav-seal">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <defs><path id="nav-ring" d="M50 50 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" /></defs>
              <text><textPath href="#nav-ring" textLength="245">AYUSH SINGH · 道 · AYUSH SINGH · 道 · </textPath></text>
            </svg>
            <span className="nav-mark">AS</span>
          </span>
          <span className="nav-name">
            <b>{ME.name}</b>
            <small>{ME.kana}</small>
          </span>
        </TLink>
        <div className="nav-mid">
          <nav className="nav-links" aria-label="Main">
            {NAV.map((n, i) => (
              <TLink key={n.key} href={n.href} className={`nav-link ${page === n.key ? 'is-active' : ''}`} aria-current={page === n.key ? 'page' : undefined}>
                <b className="nav-jp">{n.jp}</b>
                <span>{n.label}</span>
                <i>0{i + 1}</i>
              </TLink>
            ))}
          </nav>
        </div>
        <div className="nav-right">
          <a href="/" className="nav-v1" title="The original portfolio"><span>v1</span><ArrowUpRight size={12} /></a>
          <a href={ME.mailto} target="_blank" rel="noreferrer" className="nav-cta" data-cursor="HI!"><span>Let's talk</span><b>話</b></a>
          <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div className={`mmenu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="mmenu-bg tone" />
        <nav className="mmenu-list">
          {NAV.map((n, i) => (
            <div className="mmenu-row" key={n.key}>
              <TLink href={n.href} className={`mmenu-link ${page === n.key ? 'is-active' : ''}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                <i>0{i + 1}</i>{n.label}<em>{n.jp}</em>
              </TLink>
            </div>
          ))}
          <div className="mmenu-row">
            <a href="/" className="mmenu-link mmenu-link--sm" tabIndex={open ? 0 : -1}>Original site (v1) ↗</a>
          </div>
        </nav>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="foot">
      <div className="foot-marquee" aria-hidden="true">
        <div className="foot-track">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>TO BE CONTINUED <b>→</b> つづく <b>✦</b> </span>
          ))}
        </div>
      </div>
      <div className="foot-grid wrap">
        <div className="foot-col foot-col--big">
          <p className="kicker kicker--light">次回予告 · Next time</p>
          <h2 className="foot-title">Got an idea worth building?</h2>
          <a href={ME.mailto} target="_blank" rel="noreferrer" className="btn btn--red">
            <Mail size={16} /> {ME.email}
          </a>
        </div>
        <div className="foot-col">
          <p className="foot-h">Navigate</p>
          {NAV.map((n) => <TLink key={n.key} href={n.href}>{n.label} <small>{n.jp}</small></TLink>)}
          <a href="/">Original site (v1)</a>
        </div>
        <div className="foot-col">
          <p className="foot-h">Connect</p>
          <a href={ME.github} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>
          <a href={ME.linkedin} target="_blank" rel="noreferrer"><Linkedin size={14} /> LinkedIn</a>
          <a href={ME.mailto} target="_blank" rel="noreferrer"><Mail size={14} /> Email</a>
          <span className="foot-loc">{ME.campus}<br />Home · {ME.home}</span>
        </div>
        <div className="foot-col foot-col--stamp">
          <Hanko text="AYUSH SINGH · IIT GANDHINAGAR · " center="印" />
        </div>
      </div>
      <div className="foot-base wrap">
        <span>© {new Date().getFullYear()} {ME.name}. Drawn in ink, code & red.</span>
        <span>Vol. 02 · 第二巻</span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
export default function Shell({ page, children }) {
  useSmoothScroll();
  const arriving = ssGet(NAV_KEY) === '1';
  const firstVisit = !arriving && ssGet(SEEN_KEY) !== '1' && !reducedMotion();
  const [loading, setLoading] = useState(firstVisit);
  const finishLoading = useCallback(() => { setLoading(false); markIntroDone(); }, []);

  useEffect(() => {
    ssSet(NAV_KEY, null);
    ssSet(SEEN_KEY, '1');
    if (!firstVisit && !arriving) markIntroDone();
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [firstVisit, arriving]);

  return (
    <div className={`v2-app page-${page}`}>
      <div className="paper-grain" aria-hidden="true" />
      <TopProgress />
      <Nav page={page} />
      <main id="main">{children}</main>
      <Footer />
      <SpeedLines />
      <Cursor />
      <Curtain arriving={arriving} label={pageLabel(`/${page}/`)} onRevealed={markIntroDone} />
      {loading && <Loader onDone={finishLoading} />}
    </div>
  );
}
