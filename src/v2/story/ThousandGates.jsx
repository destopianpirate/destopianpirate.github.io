import { CAP_Y, GATES, GATE_LEAD, GATE_SP, STRIP_H as H, STRIP_W } from './journey-data';

// Side view of a Fushimi-style tunnel of torii: red pillars with black kasagi caps, each carved
// with a vertical 奉納 dedication. The runner sprints along the caps; gates light as he passes.

function Gate({ g, i }) {
  const cx = GATE_LEAD + i * GATE_SP;
  const chars = ['奉', '納', ...g.jp];
  return (
    <g className={`gt-gate${g.exam ? ' gt-gate--exam' : ''}`} data-i={i}>
      {/* the far pillar of the same gate, giving the tunnel depth */}
      <rect x={cx - 8} y={CAP_Y + 30} width="44" height={H - CAP_Y - 70} className="gt-back" />
      <path d={`M${cx - 66} ${CAP_Y - 6} Q${cx} ${CAP_Y + 8} ${cx + 66} ${CAP_Y - 6} L${cx + 58} ${CAP_Y + 26} L${cx - 58} ${CAP_Y + 26} Z`} className="gt-cap" />
      <rect x={cx - 48} y={CAP_Y + 26} width="96" height="16" className="gt-band" />
      <rect x={cx - 22} y={CAP_Y + 42} width="44" height={H - CAP_Y - 82} className="gt-pillar" />
      <rect x={cx - 40} y={CAP_Y + 92} width="80" height="16" className="gt-nuki" />
      <rect x={cx - 27} y={H - 66} width="54" height="26" className="gt-foot" />
      {chars.map((c, k) => (
        <text key={k} x={cx} y={CAP_Y + 204 + k * 30} className="gt-ink" textAnchor="middle">{c}</text>
      ))}
      <text x={cx} y={H - 84} className="gt-no" textAnchor="middle">{g.no}</text>
      {/* hanging paper lantern between this gate and the next */}
      <line x1={cx + GATE_SP / 2} x2={cx + GATE_SP / 2} y1={CAP_Y + 108} y2={CAP_Y + 132} className="gt-cord" />
      <g className="gt-lantern" transform={`translate(${cx + GATE_SP / 2} ${CAP_Y + 158})`}>
        <circle r="44" className="gt-halo" />
        <ellipse rx="17" ry="24" className="gt-paper" />
        <path d="M-17 -8 H17 M-17 8 H17" className="gt-rib" />
        <rect x="-9" y="-29" width="18" height="6" className="gt-capb" /><rect x="-9" y="23" width="18" height="6" className="gt-capb" />
      </g>
      {/* ema tag that flips down when the gate is passed */}
      <g className="gt-ema" transform={`translate(${cx} ${CAP_Y + 108})`}>
        <path d="M-2 0 L-2 22 M2 0 L2 22" className="gt-cord" />
        <g className="gt-ema-board">
          <path d="M-56 22 H56 V58 L48 70 H-48 L-56 58 Z" />
          <text y="44" textAnchor="middle" className="gt-ema-en" {...(g.en.length > 12 ? { textLength: 98, lengthAdjust: 'spacingAndGlyphs' } : {})}>{g.en}</text>
          <text y="62" textAnchor="middle" className="gt-ema-sub">{g.sub}</text>
          {g.exam && <g className="gt-pass" transform="translate(-48 28) rotate(-14)"><circle r="19" /><text y="6" textAnchor="middle">合格</text></g>}
        </g>
      </g>
    </g>
  );
}

export default function ThousandGates() {
  return (
    <svg className="gt-strip" viewBox={`0 0 ${STRIP_W} ${H}`} preserveAspectRatio="xMinYMax meet" aria-hidden="true">
      <rect x="0" y={H - 40} width={STRIP_W} height="40" className="gt-path" />
      {Array.from({ length: Math.ceil(STRIP_W / 60) }, (_, i) => <rect key={i} x={i * 60 + 6} y={H - 34} width="48" height="10" className="gt-step" />)}
      {GATES.map((g, i) => <Gate key={i} g={g} i={i} />)}
    </svg>
  );
}
