import { RADAR_AXES } from '../data/portfolio';

const pt = (i, v, r, n) => {
  const a = (Math.PI * 2 * i) / n - Math.PI / 2;
  return [Math.cos(a) * r * (v / 100), Math.sin(a) * r * (v / 100)];
};
const poly = (vals, r) => RADAR_AXES.map((k, i) => pt(i, vals[k] ?? 0, r, RADAR_AXES.length).join(',')).join(' ');

/**
 * Hexagonal "stat chart" in the style of an anime character sheet.
 * `base` is drawn as the ink outline, `overlay` (optional) as the red fill on top.
 */
export default function Radar({ base, overlay, size = 360, showValues = true, className = '' }) {
  const r = size * 0.36;
  const n = RADAR_AXES.length;
  const front = overlay || base;
  return (
    <svg className={`radar ${className}`} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} role="img" aria-label="Skill focus chart">
      {[25, 50, 75, 100].map((lv) => (
        <polygon key={lv} className={`radar-ring ${lv === 100 ? 'is-outer' : ''}`} points={poly(Object.fromEntries(RADAR_AXES.map((k) => [k, lv])), r)} />
      ))}
      {RADAR_AXES.map((k, i) => {
        const [x, y] = pt(i, 100, r, n);
        return <line key={k} className="radar-spoke" x1="0" y1="0" x2={x} y2={y} />;
      })}
      {overlay && <polygon className="radar-base" points={poly(base, r)} />}
      <polygon className="radar-fill" points={poly(front, r)} style={{ transition: 'all .6s cubic-bezier(.2,.9,.2,1)' }} />
      {RADAR_AXES.map((k, i) => {
        const [x, y] = pt(i, front[k], r, n);
        return <circle key={k} className="radar-dot" cx={x} cy={y} r={size * 0.012} style={{ transition: 'all .6s cubic-bezier(.2,.9,.2,1)' }} />;
      })}
      {RADAR_AXES.map((k, i) => {
        const [x, y] = pt(i, 128, r, n);
        return (
          <g key={k} transform={`translate(${x} ${y})`}>
            <text className="radar-label" textAnchor="middle" y={showValues ? -4 : 4}>{k}</text>
            {showValues && <text className="radar-val" textAnchor="middle" y={size * 0.045}>{front[k]}</text>}
          </g>
        );
      })}
    </svg>
  );
}
