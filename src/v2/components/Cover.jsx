// Generative manga-style cover art for blog posts. Each motif is a small SVG composition
// in ink, paper and red, so posts get distinctive art without image downloads.

const rng = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

function Burst({ r = 140, n = 48 }) {
  return (
    <g className="cv-burst">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const a2 = a + 0.035;
        return <polygon key={i} points={`0,0 ${Math.cos(a) * r * 3},${Math.sin(a) * r * 3} ${Math.cos(a2) * r * 3},${Math.sin(a2) * r * 3}`} />;
      })}
    </g>
  );
}

const MOTIFS = {
  // neural cellular automata: a grid of cells growing from the centre
  cells: (rand) => (
    <g transform="translate(200 150)">
      {Array.from({ length: 13 }, (_, y) =>
        Array.from({ length: 19 }, (_, x) => {
          const dx = x - 9, dy = y - 6;
          const d = Math.hypot(dx, dy * 1.2);
          const alive = d < 5.2 + rand() * 1.6;
          const hot = d < 2.2 || (alive && rand() > 0.86);
          return (
            <rect key={`${x}-${y}`} x={dx * 20 - 8} y={dy * 20 - 8} width="16" height="16" rx="2"
              className={hot ? 'cv-red' : alive ? 'cv-ink' : 'cv-ghost'} />
          );
        }),
      )}
    </g>
  ),
  // multi-provider gateway: many lines converge through one gate
  gateway: (rand) => (
    <g>
      {Array.from({ length: 17 }, (_, i) => {
        const y = 20 + i * 16;
        return <path key={i} d={`M0 ${y} C 120 ${y}, 150 150, 200 150`} className={i === 8 ? 'cv-stroke-red' : 'cv-stroke'} />;
      })}
      <path d="M200 150 L400 150" className="cv-stroke-red cv-thick" />
      <rect x="182" y="96" width="36" height="108" className="cv-ink" />
      <rect x="170" y="88" width="60" height="12" className="cv-red" />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={260 + i * 24} cy="150" r={4 + rand() * 3} className="cv-paper-dot" />)}
    </g>
  ),
  // sleeping database: stacked cylinders, one asleep with "z z z"
  db: () => (
    <g transform="translate(200 160)">
      {[-1, 0, 1].map((k) => (
        <g key={k} transform={`translate(${k * 110} ${k === 0 ? -20 : 10})`}>
          <path d="M-40 -40 v80 a40 12 0 0 0 80 0 v-80" className={k === 0 ? 'cv-red' : 'cv-ink'} />
          <ellipse cx="0" cy="-40" rx="40" ry="12" className="cv-paper" />
          <path d="M-40 0 a40 12 0 0 0 80 0" className="cv-stroke-paper" />
        </g>
      ))}
      <text x="40" y="-80" className="cv-sfx">Z z z</text>
    </g>
  ),
  // edge vision: a bounding box locks onto a pothole
  vision: (rand) => (
    <g>
      <path d="M0 300 L170 120 L230 120 L400 300 Z" className="cv-ink" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={196} y={130 + i * 28} width={8} height={14 + i * 3} className="cv-paper" />)}
      <ellipse cx="250" cy="236" rx="38" ry="12" className="cv-red" />
      <rect x="200" y="206" width="104" height="58" className="cv-box" />
      <rect x="200" y="190" width="92" height="16" className="cv-red" />
      <text x="205" y="202" className="cv-label">pothole 0.{Math.floor(80 + rand() * 19)}</text>
    </g>
  ),
  // motion: easing curves and keyframe diamonds
  motion: () => (
    <g>
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M30 ${250 - k * 10} C ${160 + k * 20} ${250 - k * 10}, ${200 - k * 30} ${60 + k * 16}, 370 ${60 + k * 16}`} className={k === 1 ? 'cv-stroke-red cv-thick' : 'cv-stroke'} />
      ))}
      {[30, 130, 230, 330].map((x, i) => <rect key={x} x={x - 9} y={276} width="18" height="18" transform={`rotate(45 ${x} 285)`} className={i === 2 ? 'cv-red' : 'cv-ink'} />)}
      <line x1="0" y1="285" x2="400" y2="285" className="cv-stroke" />
    </g>
  ),
  // attention: tokens with arcs between them
  attention: () => {
    const xs = [50, 125, 200, 275, 350];
    const arcs = [[0, 2], [1, 4], [0, 4], [2, 3], [3, 4], [1, 2]];
    return (
      <g>
        {arcs.map(([a, b], i) => (
          <path key={i} d={`M${xs[a]} 200 Q ${(xs[a] + xs[b]) / 2} ${200 - (xs[b] - xs[a]) * 0.7} ${xs[b]} 200`} className={b === 4 && a === 0 ? 'cv-stroke-red cv-thick' : 'cv-stroke'} />
        ))}
        {xs.map((x, i) => <rect key={x} x={x - 30} y={200} width="60" height="34" rx="17" className={i === 4 ? 'cv-red' : 'cv-ink'} />)}
      </g>
    );
  },
};

export default function Cover({ motif = 'cells', seed = 7, kanji, className = '' }) {
  const rand = rng(seed);
  const draw = MOTIFS[motif] || MOTIFS.cells;
  return (
    <svg className={`cover ${className}`} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" className="cv-bg" />
      <g transform="translate(200 150)" opacity="0.5"><Burst /></g>
      <pattern id={`tone-${seed}`} width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="3.5" cy="3.5" r="1.3" className="cv-tone" />
      </pattern>
      <rect width="400" height="300" fill={`url(#tone-${seed})`} opacity="0.35" />
      {draw(rand)}
      {kanji && <text x="384" y="58" textAnchor="end" className="cv-kanji">{kanji}</text>}
      <rect width="400" height="300" className="cv-frame" />
    </svg>
  );
}
