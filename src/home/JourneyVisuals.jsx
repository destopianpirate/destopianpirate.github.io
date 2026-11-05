import { useEffect, useRef, useState } from 'react';
import './JourneyVisuals.css';

// Coded illustrations for the Academic Journey milestones (no images).
// Each one animates only while it is on screen.

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

/* ---------- B.Tech in AI: a transformer forward pass, animated ---------- */
const TOKENS = ['deep', 'learning', 'at', 'IIT', 'GN'];
const TOK_X = [38, 100, 156, 200, 244];
const ARCS = [
  [0, 1, 0.9], [1, 3, 0.55], [0, 4, 0.35], [2, 3, 0.7], [3, 4, 1], [1, 4, 0.5], [0, 3, 0.3],
];
const LAYERS = [
  { y: 112, label: 'Embedding' },
  { y: 78, label: 'Self-Attention' },
  { y: 44, label: 'Feed-Forward' },
];
const PRED = [['systems', 0.46], ['models', 0.24], ['research', 0.16], ['code', 0.09]];

export function TransformerViz() {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className={`jv jv-tf ${inView ? 'is-live' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 350 232" className="jv-tf-svg">
        {/* signal lanes from every token up through the stack */}
        {TOK_X.map((x, i) => (
          <g key={`lane-${i}`}>
            <line x1={x} y1="160" x2={x} y2="30" className="jv-lane" />
            <line x1={x} y1="160" x2={x} y2="30" className={`jv-pulse ${i === 4 ? 'is-hot' : ''}`} style={{ animationDelay: `${i * 0.28}s` }} />
          </g>
        ))}

        {/* layer stack */}
        {LAYERS.map((L, i) => (
          <g key={L.label} className="jv-layer" style={{ animationDelay: `${0.4 + i * 0.5}s` }}>
            <rect x="22" y={L.y} width="306" height="24" rx="7" />
            <text x="318" y={L.y + 15.5} textAnchor="end" className="jv-layer-label">{L.label}</text>
            {TOK_X.map((x, k) => (
              <circle key={k} cx={x} cy={L.y + 12} r="3.4" className={`jv-node ${k === 4 && i === 2 ? 'is-hot' : ''}`} style={{ animationDelay: `${0.4 + i * 0.5 + k * 0.08}s` }} />
            ))}
          </g>
        ))}

        {/* prediction head */}
        <g className="jv-pred">
          <text x="22" y="16" className="jv-pred-label">next token →</text>
          {PRED.map(([w, p], i) => (
            <g key={w} transform={`translate(${108 + i * 58} 4)`}>
              <rect width="52" height="16" rx="5" className={`jv-pred-chip ${i === 0 ? 'is-hot' : ''}`} style={{ '--p': p, animationDelay: `${2 + i * 0.12}s` }} />
              <text x="26" y="11.5" className="jv-pred-text">{w}</text>
            </g>
          ))}
        </g>

        {/* tokens */}
        {TOKENS.map((t, i) => (
          <g key={t} transform={`translate(${TOK_X[i]} 172)`} className="jv-token" style={{ animationDelay: `${i * 0.1}s` }}>
            <rect x={-Math.max(18, t.length * 3.2 + 7)} y="-11" width={Math.max(36, t.length * 6.4 + 14)} height="22" rx="11" />
            <text y="4">{t}</text>
          </g>
        ))}

        {/* self-attention arcs between tokens */}
        {ARCS.map(([a, b, wgt], i) => {
          const x1 = TOK_X[a], x2 = TOK_X[b];
          const depth = 186 + (x2 - x1) * 0.22;
          return (
            <path
              key={`${a}-${b}`}
              d={`M${x1} 184 Q ${(x1 + x2) / 2} ${depth + 16} ${x2} 184`}
              className={`jv-attn-arc ${b === 4 && wgt === 1 ? 'is-hot' : ''}`}
              style={{ strokeWidth: 0.6 + wgt * 1.8, animationDelay: `${i * 0.32}s` }}
              pathLength="100"
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Class XII (PCM): physics, chemistry & maths in motion ---------- */
export function PhysicsViz() {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className={`jv jv-pcm ${inView ? 'is-live' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 320 206" className="jv-pcm-svg">
        <defs>
          <pattern id="jv-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" className="jv-gridpat" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill="url(#jv-grid)" />

        {/* Physics: projectile motion */}
        <g className="jv-proj">
          <line x1="14" y1="172" x2="200" y2="172" className="jv-axis" />
          <line x1="14" y1="172" x2="14" y2="40" className="jv-axis" />
          <path id="jv-arc" d="M14 172 Q 104 -10 194 172" className="jv-arc" />
          <path d="M14 172 Q 104 -10 194 172" className="jv-arc-live" pathLength="100" />
          <circle r="5" className="jv-ball"><animateMotion dur="2.6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#jv-arc" /></animateMotion></circle>
          <line x1="14" y1="172" x2="44" y2="128" className="jv-vec" />
          <text x="48" y="126" className="jv-tex">v₀</text>
          <text x="96" y="70" className="jv-tex jv-dim">y = x·tanθ − gx²/2v²cos²θ</text>
        </g>

        {/* Physics: pendulum */}
        <g transform="translate(262 22)">
          <line x1="-26" y1="0" x2="26" y2="0" className="jv-axis" />
          <g className="jv-pendulum">
            <line x1="0" y1="0" x2="0" y2="62" className="jv-string" />
            <circle cx="0" cy="66" r="7" className="jv-bob" />
          </g>
          <text x="-30" y="96" className="jv-tex jv-dim">T = 2π√(l/g)</text>
        </g>

        {/* Chemistry: benzene ring */}
        <g transform="translate(262 150)"><g className="jv-benzene">
          <polygon points="0,-24 20.8,-12 20.8,12 0,24 -20.8,12 -20.8,-12" className="jv-ring" />
          <circle r="12" className="jv-ring-in" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx={Math.sin((a * Math.PI) / 180) * 24} cy={-Math.cos((a * Math.PI) / 180) * 24} r="2.6" className="jv-atom" />
          ))}
        </g></g>

        {/* Maths: sine wave + integral area */}
        <g transform="translate(14 186)">
          <path d="M0 0 Q 12 -10 24 0 T 48 0 T 72 0 T 96 0 T 120 0 T 144 0 T 168 0 T 192 0" className="jv-wave" />
        </g>
        <text x="214" y="196" className="jv-tex jv-dim">∫ f(x) dx</text>
      </svg>
      <div className="jv-chips">
        <span>Physics</span><span>Chemistry</span><span className="is-hot">Mathematics</span>
      </div>
    </div>
  );
}

/* ---------- Class X: geometry construction + score gauge ---------- */
export function ScoreViz() {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className={`jv jv-score ${inView ? 'is-live' : ''}`} aria-hidden="true">
      <svg viewBox="8 14 190 190" className="jv-geo">
        {/* triangle, its circumcircle, medians: a classic Class X construction */}
        <circle cx="96" cy="104" r="70" className="jv-draw jv-d3" pathLength="100" />
        <polygon points="96,34 35,139 157,139" className="jv-draw jv-d1" pathLength="100" />
        <line x1="96" y1="34" x2="96" y2="139" className="jv-draw jv-d2 jv-thin" pathLength="100" />
        <line x1="35" y1="139" x2="126.5" y2="86.5" className="jv-draw jv-d2 jv-thin" pathLength="100" />
        <line x1="157" y1="139" x2="65.5" y2="86.5" className="jv-draw jv-d2 jv-thin" pathLength="100" />
        <circle cx="96" cy="104" r="3.5" className="jv-centroid" />
        <path d="M 44 139 A 9 9 0 0 0 39.5 131.2" className="jv-draw jv-d2 jv-thin" pathLength="100" />
        <text x="90" y="28" className="jv-tex">A</text>
        <text x="22" y="150" className="jv-tex">B</text>
        <text x="162" y="150" className="jv-tex">C</text>
        <text x="40" y="190" className="jv-tex jv-dim">AB² + AC² = 2(AD² + BD²)</text>
      </svg>
    </div>
  );
}

export default function JourneyVisual({ index }) {
  if (index === 0) return <TransformerViz />;
  if (index === 1) return <PhysicsViz />;
  return <ScoreViz />;
}
