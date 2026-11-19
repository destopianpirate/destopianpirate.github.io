import { useEffect, useId, useRef } from 'react';
import { store } from '../core/store';
import { rand } from './world';
import portrait from '../../assets/profile-story.webp';

/** Ambient particles: petals drift, embers rise, motes float. Pure CSS motion, seeded layout. */
export function Particles({ kind = 'petals', count = 26, seed = 1 }) {
  const r = rand(seed);
  return (
    <div className={`fx fx--${kind}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={{
            '--x': `${r() * 100}%`,
            '--s': (0.5 + r() * 1.1).toFixed(2),
            '--d': `${(5 + r() * 9).toFixed(1)}s`,
            '--delay': `${(-r() * 14).toFixed(1)}s`,
            '--drift': `${((r() - 0.5) * 180).toFixed(0)}px`,
          }}
        />
      ))}
    </div>
  );
}

/** Vertical katana on the right edge: the blade draws out of its sheath as you scroll. */
export function KatanaMeter({ chapters, active }) {
  const blade = useRef(null);
  useEffect(() => {
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (blade.current) blade.current.style.transform = `scaleY(${Math.max(0.02, store.progress)})`;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="kmeter" aria-hidden="true">
      <span className="kmeter-hilt" />
      <span className="kmeter-tsuba" />
      <span className="kmeter-sheath">
        <span className="kmeter-blade" ref={blade} />
        {chapters.map((c, i) => (
          <i key={c[0]} className={i <= active ? 'is-on' : ''} style={{ top: `${(i / (chapters.length - 1)) * 100}%` }} />
        ))}
      </span>
    </div>
  );
}

/** HUD button + chapter list that jumps straight to any chapter. */
export function ChapterMenu({ chapters, active, open, onToggle, onJump }) {
  return (
    <>
      <button className={`hud ${open ? 'is-open' : ''}`} onClick={onToggle} aria-expanded={open} aria-label="Chapter select" data-cursor="JUMP">
        <span className="hud-kanji">{chapters[active][0]}</span>
        <span className="hud-txt"><b>{String(active).padStart(2, '0')} / {String(chapters.length - 1).padStart(2, '0')}</b>{chapters[active][1]}</span>
      </button>
      <nav className={`chmenu ${open ? 'is-open' : ''}`} aria-label="Chapters" aria-hidden={!open}>
        <span className="chmenu-head mono">目次 · Chapter select</span>
        <ol>
          {chapters.map(([jp, name], i) => (
            <li key={name} style={{ '--i': i }}>
              <button className={i === active ? 'is-on' : ''} onClick={() => onJump(i)} tabIndex={open ? 0 : -1}>
                <em>{jp}</em>
                <span>{String(i).padStart(2, '0')}</span>
                {name}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** Your photo as a manga "wanted" poster, pinned with a kunai. */
export function WantedPoster({ name }) {
  return (
    <figure className="wanted">
      <svg className="wanted-kunai" viewBox="-20 -80 40 160" aria-hidden="true">
        <path d="M0 -76 L14 -20 L0 -8 L-14 -20 Z" fill="#fbf8f1" stroke="#0d0d0f" strokeWidth="4" strokeLinejoin="round" />
        <rect x="-5" y="-8" width="10" height="56" fill="#0d0d0f" />
        <circle cx="0" cy="58" r="11" fill="none" stroke="#0d0d0f" strokeWidth="5" />
      </svg>
      <span className="wanted-head">手配書 · WANTED</span>
      <div className="wanted-photo">
        <img src={portrait} alt={`Portrait of ${name}`} loading="lazy" />
        <span className="wanted-tone" />
      </div>
      <figcaption>
        <b>{name}</b>
        <span>For building intelligent things</span>
        <em>Reward: one great collaboration</em>
      </figcaption>
    </figure>
  );
}

/**
 * Your portrait painted onto the moon: brush strokes ink it in on load (manga black & white with
 * halftone + red fade), and a lens that follows the pointer reveals the real colour photo underneath.
 */
export function MoonPortrait({ name }) {
  const uid = useId().replace(/:/g, '');
  const id = (n) => `${n}-${uid}`;
  const svg = useRef(null);
  const lens = useRef(null);

  useEffect(() => {
    const target = { x: -40, y: -40 };
    const cur = { x: -40, y: -40 };
    let raf;
    const onMove = (e) => {
      const r = svg.current?.getBoundingClientRect();
      if (!r) return;
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      const inside = Math.hypot(x - 50, y - 50) < 58;
      target.x = inside ? x : -40;
      target.y = inside ? y : -40;
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      cur.x += (target.x - cur.x) * 0.16;
      cur.y += (target.y - cur.y) * 0.16;
      lens.current?.setAttribute('cx', cur.x.toFixed(2));
      lens.current?.setAttribute('cy', cur.y.toFixed(2));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    loop();
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);

  // overlapping diagonal brush strokes that together paint the whole disc
  const strokes = [
    'M-12 12 Q40 4 112 -2', 'M-12 30 Q50 20 112 16', 'M-12 48 Q46 40 112 34',
    'M-12 66 Q54 58 112 52', 'M-12 84 Q48 76 112 70', 'M-12 104 Q52 96 112 88',
  ];

  return (
    <svg ref={svg} className="moonp" viewBox="0 0 100 100" role="img" aria-label={`Ink portrait of ${name} painted on the moon`}>
      <defs>
        <clipPath id={id('disc')}><circle cx="50" cy="50" r="49" /></clipPath>
        <mask id={id('paint')} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="#000" />
          {strokes.map((d) => <path key={d} className="moonp-stroke" d={d} pathLength="1" stroke="#fff" strokeWidth="21" strokeLinecap="round" fill="none" />)}
        </mask>
        <radialGradient id={id('soft')}>
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={id('lens')} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="#000" />
          <circle ref={lens} cx="-40" cy="-40" r="17" fill={`url(#${id('soft')})`} />
        </mask>
        <pattern id={id('dots')} width="1.6" height="1.6" patternUnits="userSpaceOnUse">
          <circle cx="0.8" cy="0.8" r="0.42" fill="#0d0d0f" />
        </pattern>
        <linearGradient id={id('fade')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#e3122c" stopOpacity="0" />
          <stop offset="1" stopColor="#e3122c" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${id('disc')})`}>
        <g className="moonp-ink" mask={`url(#${id('paint')})`}>
          <image href={portrait} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" className="moonp-photo" />
          <rect width="100" height="100" fill={`url(#${id('dots')})`} opacity="0.35" />
          <rect width="100" height="100" fill={`url(#${id('fade')})`} />
        </g>
        <image href={portrait} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" mask={`url(#${id('lens')})`} />
      </g>
      {/* red brush ensō around the portrait */}
      <path className="moonp-enso" pathLength="1" d="M78 14 C62 2 30 2 14 22 C-2 42 4 76 30 92 C56 106 90 94 98 64 C102 46 96 30 86 20"
        fill="none" stroke="#e3122c" strokeWidth="3.4" strokeLinecap="round" />
      <g className="moonp-seal" transform="translate(84 84) rotate(-10)">
        <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#e3122c" stroke="#0d0d0f" strokeWidth="0.8" />
        <text x="0" y="3.2" textAnchor="middle" fontSize="9" fill="#fbf8f1" className="svg-brush">本</text>
      </g>
    </svg>
  );
}

/** A polaroid of the real person behind the ink. */
export function Polaroid({ name }) {
  return (
    <figure className="polaroid">
      <img src={portrait} alt={`Photo of ${name}`} loading="lazy" />
      <figcaption>the real one ✎</figcaption>
    </figure>
  );
}
