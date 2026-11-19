// Hand-built ink-wash scenery for the scroll story. Everything is SVG in a 1600 x 900 world,
// drawn procedurally from seeds so each layer can be animated independently.

import { H, W, rand, ridgePath } from './world';

export function Ridge({ fill = 'var(--ink)', className = '', ...opts }) {
  return <path className={className} d={ridgePath(opts)} fill={fill} />;
}

/** Full-bleed SVG layer. */
export function Layer({ children, className = '', align = 'xMidYMax', style }) {
  return (
    <svg className={`layer ${className}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={`${align} slice`} style={style} aria-hidden="true">
      {children}
    </svg>
  );
}

export function Clouds({ seed = 3, y = 200, count = 5, fill = 'var(--paper)', opacity = 1 }) {
  const r = rand(seed);
  return (
    <g opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const cx = r() * W, cy = y + (r() - 0.5) * 120, w = 160 + r() * 260;
        return (
          <g key={i} className="cloud" style={{ animationDelay: `${-r() * 30}s`, animationDuration: `${40 + r() * 40}s` }}>
            <rect x={cx - w / 2} y={cy} width={w} height="26" rx="13" fill={fill} />
            <rect x={cx - w / 3} y={cy - 18} width={w * 0.5} height="26" rx="13" fill={fill} />
            <rect x={cx - w / 2 + 30} y={cy + 20} width={w * 0.7} height="18" rx="9" fill={fill} />
          </g>
        );
      })}
    </g>
  );
}

/** Traditional rooftops with swept eaves. */
export function Village({ seed = 9, y = 760, count = 9, fill = 'var(--ink)', pagoda = true }) {
  const r = rand(seed);
  const houses = [];
  let x = -40;
  for (let i = 0; i < count; i++) {
    const w = 110 + r() * 120, h = 50 + r() * 60, roof = 34 + r() * 26;
    houses.push({ x, w, h, roof });
    x += w + 10 + r() * 60;
  }
  return (
    <g fill={fill}>
      {houses.map((hs, i) => (
        <g key={i}>
          <rect x={hs.x} y={y - hs.h} width={hs.w} height={hs.h + 200} fill="#2a2a30" />
          <rect x={hs.x + hs.w * 0.12} y={y - hs.h * 0.72} width={hs.w * 0.3} height={hs.h * 0.34} fill="#f6f3ec" opacity="0.85" />
          <rect x={hs.x + hs.w * 0.12 + hs.w * 0.145} y={y - hs.h * 0.72} width="3" height={hs.h * 0.34} fill="#2a2a30" />
          <rect x={hs.x + hs.w * 0.6} y={y - hs.h * 0.55} width={hs.w * 0.22} height={hs.h * 0.55 + 200} fill="#0d0d0f" />
          <path d={`M ${hs.x - 26} ${y - hs.h + 6} Q ${hs.x + hs.w / 2} ${y - hs.h - hs.roof * 1.5} ${hs.x + hs.w + 26} ${y - hs.h + 6} Q ${hs.x + hs.w / 2} ${y - hs.h - hs.roof * 0.55} ${hs.x - 26} ${y - hs.h + 6} Z`} />
          <circle cx={hs.x + hs.w * 0.5} cy={y - hs.h - 4} r="6" fill="var(--red)" opacity={i % 3 === 0 ? 1 : 0} />
        </g>
      ))}
      {pagoda && <Pagoda x={W * 0.72} y={y - 40} s={1.15} />}
    </g>
  );
}

export function Pagoda({ x, y, s = 1, fill = 'currentColor' }) {
  const tiers = [0, 1, 2, 3, 4];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <rect x="-5" y={-tiers.length * 70 - 60} width="10" height="70" />
      {tiers.map((t) => {
        const w = 140 - t * 20, yy = -t * 70;
        return (
          <g key={t}>
            <rect x={-w / 2 + 18} y={yy - 50} width={w - 36} height="52" />
            <path d={`M ${-w / 2 - 22} ${yy - 44} Q 0 ${yy - 92} ${w / 2 + 22} ${yy - 44} Q 0 ${yy - 66} ${-w / 2 - 22} ${yy - 44} Z`} />
          </g>
        );
      })}
    </g>
  );
}

export function Bamboo({ seed = 4, count = 14, fill = 'var(--ink)', minW = 10, maxW = 26 }) {
  const r = rand(seed);
  return (
    <g fill={fill}>
      {Array.from({ length: count }, (_, i) => {
        const x = (i / count) * W + r() * 60, w = minW + r() * (maxW - minW), lean = (r() - 0.5) * 8;
        return (
          <g key={i} transform={`rotate(${lean} ${x} ${H})`}>
            <rect x={x} y={-20} width={w} height={H + 40} />
            {Array.from({ length: 7 }, (_, k) => <rect key={k} x={x - 2} y={60 + k * 130 + r() * 30} width={w + 4} height="5" />)}
            {Array.from({ length: 3 }, (_, k) => {
              const ly = 80 + r() * 600, side = r() > 0.5 ? 1 : -1;
              return <path key={`l${k}`} d={`M ${x + w / 2} ${ly} q ${side * 40} -8 ${side * 70} 14 q ${-side * 40} -2 ${-side * 70} -14 Z`} />;
            })}
          </g>
        );
      })}
    </g>
  );
}

export function River({ y = 700 }) {
  return (
    <g>
      <path d={`M -40 ${y} Q 400 ${y - 40} 800 ${y + 10} T 1640 ${y - 10} L 1640 ${H + 40} L -40 ${H + 40} Z`} fill="var(--paper-3)" />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} className="ripple" x1={60 + (i * 97) % 1500} x2={140 + (i * 97) % 1500} y1={y + 40 + (i % 5) * 30} y2={y + 40 + (i % 5) * 30}
          stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" opacity="0.35" style={{ animationDelay: `${-i * 0.4}s` }} />
      ))}
    </g>
  );
}

export function Birds({ count = 6, seed = 2, y = 260 }) {
  const r = rand(seed);
  return (
    <g className="birds" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round">
      {Array.from({ length: count }, (_, i) => {
        const x = 200 + r() * 1100, yy = y + r() * 160, s = 0.6 + r() * 0.8;
        return (
          <path key={i} className="bird" style={{ animationDelay: `${-r()}s` }} transform={`translate(${x} ${yy}) scale(${s})`} d="M-14 0 Q-7 -9 0 0 Q7 -9 14 0" />
        );
      })}
    </g>
  );
}

/** Dojo interior: back wall of glowing shoji, a round window, beams and a perspective floor. */
export function Dojo() {
  const cols = 12;
  return (
    <>
      <rect width={W} height={H} fill="#16120f" />
      <g transform="translate(0 90)">
        {Array.from({ length: cols }, (_, i) => (
          <g key={i} transform={`translate(${i * (W / cols)} 0)`}>
            <rect x="6" y="0" width={W / cols - 12} height="470" fill="#efe6d2" opacity="0.9" />
            {[1, 2, 3, 4, 5].map((k) => <rect key={k} x="6" y={k * 78} width={W / cols - 12} height="4" fill="#3a2a1e" />)}
            <rect x={(W / cols) / 2 - 2} y="0" width="4" height="470" fill="#3a2a1e" />
          </g>
        ))}
      </g>
      <circle cx={W / 2} cy="330" r="150" fill="var(--red)" />
      <circle cx={W / 2} cy="330" r="150" fill="none" stroke="#3a2a1e" strokeWidth="18" />
      <rect x="0" y="60" width={W} height="34" fill="#2b1f17" />
      <rect x="0" y="555" width={W} height="40" fill="#2b1f17" />
      <path d={`M 0 595 L ${W} 595 L ${W} ${H} L 0 ${H} Z`} fill="#241a13" />
      {Array.from({ length: 17 }, (_, i) => (
        <line key={i} x1={W / 2 + (i - 8) * 30} y1="595" x2={W / 2 + (i - 8) * 260} y2={H} stroke="#0e0a07" strokeWidth="3" />
      ))}
      {[640, 700, 790].map((y) => <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="#0e0a07" strokeWidth="2" />)}
      <g transform="translate(1390 120)">
        <rect x="-60" y="0" width="120" height="330" fill="#f2ead9" stroke="#2b1f17" strokeWidth="8" />
        <text x="0" y="150" textAnchor="middle" className="svg-brush" fontSize="110" fill="var(--ink)">修</text>
        <text x="0" y="270" textAnchor="middle" className="svg-brush" fontSize="110" fill="var(--red)">行</text>
      </g>
    </>
  );
}

/** Straw training post (makiwara). */
export function Makiwara({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-14" y="-280" width="28" height="300" fill="#3a2a1e" />
      <rect x="-32" y="-250" width="64" height="150" rx="20" fill="#c9a86a" />
      {[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1="-32" x2="32" y1={-236 + k * 24} y2={-232 + k * 24} stroke="#7a5b2c" strokeWidth="4" />)}
      <rect x="-40" y="14" width="80" height="14" fill="#241a13" />
    </g>
  );
}

/* ---------- weapons for the Arsenal ---------- */
const WEAPONS = {
  katana: (
    <g>
      <path d="M-170 6 Q20 -6 170 -16 L176 -10 Q20 4 -170 12 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="-176" y="-6" width="16" height="30" rx="4" fill="var(--red)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="-240" y="2" width="66" height="14" rx="5" fill="var(--ink)" />
      {[-230, -215, -200, -185].map((x) => <path key={x} d={`M${x} 2 l6 7 l-6 7`} stroke="var(--red)" strokeWidth="2" fill="none" />)}
    </g>
  ),
  kunai: (
    <g>
      <path d="M0 -150 L26 -40 L0 -20 L-26 -40 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="-7" y="-20" width="14" height="110" fill="var(--ink)" />
      {[0, 22, 44, 66].map((y) => <line key={y} x1="-7" x2="7" y1={-10 + y} y2={2 + y} stroke="var(--red)" strokeWidth="3" />)}
      <circle cx="0" cy="110" r="20" fill="none" stroke="var(--ink)" strokeWidth="8" />
    </g>
  ),
  shuriken: (
    <g className="spin">
      <path d="M0 -120 L22 -22 L120 0 L22 22 L0 120 L-22 22 L-120 0 L-22 -22 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
      <circle r="20" fill="var(--red)" stroke="var(--ink)" strokeWidth="4" />
      <circle r="7" fill="var(--ink)" />
    </g>
  ),
  kama: (
    <g>
      <rect x="-8" y="-40" width="16" height="190" rx="5" fill="var(--ink)" />
      <path d="M-4 -40 Q-10 -120 -110 -110 Q-40 -96 8 -26 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
      <path d="M0 150 q 40 30 80 0 q 40 -30 80 0" stroke="var(--red)" strokeWidth="6" fill="none" strokeDasharray="10 8" />
    </g>
  ),
  bow: (
    <g>
      <path d="M-20 -170 Q90 0 -20 170" fill="none" stroke="var(--ink)" strokeWidth="12" strokeLinecap="round" />
      <line x1="-20" y1="-170" x2="-20" y2="170" stroke="var(--red)" strokeWidth="3" />
      <line x1="-120" y1="0" x2="140" y2="0" stroke="var(--ink)" strokeWidth="6" />
      <path d="M140 0 l-26 -12 l0 24 Z" fill="var(--ink)" />
      <path d="M-120 0 l-18 -14 l10 14 l-10 14 Z" fill="var(--red)" />
    </g>
  ),
  naginata: (
    <g>
      <rect x="-220" y="-6" width="320" height="12" rx="5" fill="var(--ink)" />
      <path d="M100 -8 Q170 -20 230 -60 Q200 0 100 10 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="92" y="-14" width="14" height="28" fill="var(--red)" />
    </g>
  ),
};

/** One of the arsenal weapons, drawn around (0,0). */
export function Weapon({ kind }) {
  return WEAPONS[kind] || null;
}

/** Snowy mountain shrine: ground drift, a red torii and two stone lanterns, inked outlines. */
export function Shrine() {
  return (
    <>
      <path d={`M -40 ${H + 40} L -40 770 Q ${W * 0.5} 730 ${W + 40} 770 L ${W + 40} ${H + 40} Z`} fill="#fbf8f1" stroke="#0d0d0f" strokeWidth="4" />
      <g transform={`translate(${W * 0.66} 770) scale(0.78)`} stroke="#0d0d0f" strokeWidth="5" strokeLinejoin="round">
        <rect x="-170" y="-330" width="26" height="330" fill="#e3122c" />
        <rect x="144" y="-330" width="26" height="330" fill="#e3122c" />
        <rect x="-200" y="-270" width="400" height="22" fill="#e3122c" />
        <path d="M -240 -360 Q 0 -330 240 -360 L 232 -330 Q 0 -306 -232 -330 Z" fill="#0d0d0f" />
        <path d="M -236 -362 Q 0 -334 236 -362 L 236 -370 Q 0 -344 -236 -370 Z" fill="#fbf8f1" />
        <rect x="-214" y="-312" width="428" height="22" fill="#e3122c" />
        <rect x="-14" y="-300" width="28" height="34" fill="#fbf8f1" />
      </g>
      {[0.3, 0.92].map((fx) => (
        <g key={fx} transform={`translate(${W * fx} 770)`} stroke="#0d0d0f" strokeWidth="4" strokeLinejoin="round" fill="#cfcac0">
          <rect x="-30" y="-24" width="60" height="24" />
          <rect x="-12" y="-90" width="24" height="66" />
          <rect x="-34" y="-128" width="68" height="40" fill="#fbf8f1" />
          <rect x="-14" y="-118" width="28" height="20" fill="#e3122c" />
          <path d="M -50 -128 Q 0 -168 50 -128 Z" />
          <path d="M -46 -134 Q 0 -170 46 -134" fill="none" stroke="#fbf8f1" strokeWidth="6" />
        </g>
      ))}
    </>
  );
}
