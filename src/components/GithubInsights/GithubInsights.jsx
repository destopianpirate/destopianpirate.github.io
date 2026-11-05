import { useEffect, useMemo, useRef, useState } from 'react';
import { GH_USER, computeStreaks, useGithubData } from './githubData';
import './GithubInsights.css';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmtDate = (iso, opts = { month: 'short', day: 'numeric' }) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
const fmtRange = (a, b) => (a && b ? (a === b ? fmtDate(a) : `${fmtDate(a)} - ${fmtDate(b)}`) : 'No active streak');

function useCountUp(target, ms = 1100) {
  const [v, setV] = useState(0);
  const reduced = reducedMotion();
  useEffect(() => {
    if (reduced) return undefined;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);
  return reduced ? target : v;
}

function Num({ value }) {
  return <>{useCountUp(value).toLocaleString('en-US')}</>;
}

function Skeleton({ h = 150 }) {
  return <div className="gh-skel" style={{ height: h }} aria-label="Loading GitHub data" />;
}

function Unavailable({ rateLimited }) {
  return (
    <div className="gh-unavailable">
      <strong>Live data unavailable</strong>
      <span>{rateLimited ? 'GitHub\'s hourly request limit was reached for this connection. It resets within the hour.' : 'Could not reach GitHub right now.'}</span>
      <a href={`https://github.com/${GH_USER}`} target="_blank" rel="noreferrer">View the profile on GitHub</a>
    </div>
  );
}

/* ---------------- Repository statistics ---------------- */
export function RepoStats() {
  const { loading, profile, repos, contrib, rateLimited } = useGithubData();
  if (loading) return <Skeleton />;
  if (!profile && !repos) return <Unavailable rateLimited={rateLimited} />;
  const own = (repos || []).filter((r) => !r.fork);
  const tiles = [
    ['Public repos', profile?.public_repos ?? own.length],
    ['Stars earned', own.reduce((a, r) => a + r.stargazers_count, 0)],
    ['Forks', own.reduce((a, r) => a + r.forks_count, 0)],
    ['Followers', profile?.followers ?? 0],
    [contrib?.source === 'events' ? 'Activity (90d)' : 'Contributions (1y)', contrib?.total ?? 0],
    ['On GitHub since', profile ? new Date(profile.created_at).getUTCFullYear() : 0, true],
  ];
  return (
    <div className="gh-tiles">
      {tiles.map(([label, value, plain]) => (
        <div className="gh-tile" key={label}>
          <b>{plain ? value : <Num value={value} />}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Language distribution ---------------- */
export function LanguageBreakdown() {
  const { loading, repos, rateLimited } = useGithubData();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const rows = useMemo(() => {
    if (!repos) return [];
    // Counted per repository by its primary language. Git "size" is not used: it includes history and
    // binary files, so a single large notebook repo would swamp everything else.
    const counts = new Map();
    for (const r of repos) {
      if (r.fork || !r.language) continue;
      counts.set(r.language, (counts.get(r.language) || 0) + 1);
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n, pct: (n / total) * 100 }));
    const top = sorted.slice(0, 6);
    const rest = sorted.slice(6).reduce((a, r) => a + r.pct, 0);
    return rest > 0.5 ? [...top, { name: 'Other', pct: rest }] : top;
  }, [repos]);

  if (loading) return <Skeleton />;
  if (!repos || rows.length === 0) return <Unavailable rateLimited={rateLimited} />;
  return (
    <div className="gh-langs">
      <div className="gh-langbar" role="img" aria-label="Language distribution by number of repositories">
        {rows.map((r, i) => (
          <span key={r.name} className={`gh-lang-seg c${i}`} style={{ width: shown ? `${r.pct}%` : '0%', transitionDelay: `${i * 70}ms` }} title={`${r.name} ${r.pct.toFixed(1)}%`} />
        ))}
      </div>
      <ul className="gh-langlist">
        {rows.map((r, i) => (
          <li key={r.name}>
            <i className={`c${i}`} />
            <span className="gh-lang-name">{r.name}</span>
            <span className="gh-lang-pct">{r.n ? `${r.n} repo${r.n === 1 ? '' : 's'}` : `${r.pct.toFixed(0)}%`}</span>
          </li>
        ))}
      </ul>
      <p className="gh-caption">Share of public repositories by primary language.</p>
    </div>
  );
}

/* ---------------- Contribution streaks ---------------- */
export function StreakStats() {
  const { loading, contrib, rateLimited } = useGithubData();
  const s = useMemo(() => (contrib ? computeStreaks(contrib.days) : null), [contrib]);
  if (loading) return <Skeleton />;
  if (!contrib || !s) return <Unavailable rateLimited={rateLimited} />;
  const C = 2 * Math.PI * 38;
  const progress = s.longest.len ? Math.min(1, s.current.len / s.longest.len) : 0;
  return (
    <div className="gh-streaks">
      <div className="gh-streak-col">
        <b><Num value={contrib.total} /></b>
        <span className="gh-streak-label">{contrib.source === 'events' ? 'Recent activity' : 'Contributions'}</span>
        <small>{contrib.source === 'events' ? 'last 90 days' : 'last 12 months'}</small>
      </div>
      <div className="gh-streak-col gh-streak-ring">
        <div className="gh-ring">
          <svg viewBox="0 0 96 96" aria-hidden="true">
            <circle cx="48" cy="48" r="38" className="gh-ring-track" />
            <circle cx="48" cy="48" r="38" className="gh-ring-val" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - progress) }} />
          </svg>
          <b><Num value={s.current.len} /></b>
        </div>
        <span className="gh-streak-label">Current streak</span>
        <small>{fmtRange(s.current.start, s.current.end)}</small>
      </div>
      <div className="gh-streak-col">
        <b><Num value={s.longest.len} /></b>
        <span className="gh-streak-label">Longest streak</span>
        <small>{fmtRange(s.longest.start, s.longest.end)}</small>
      </div>
    </div>
  );
}

/* ---------------- Activity graph ---------------- */
const W = 440, H = 250, PL = 30, PR = 8, PT = 16, PB = 28;

function smoothPath(pts, yMin, yMax) {
  if (pts.length < 2) return '';
  const clamp = (y) => Math.min(yMax, Math.max(yMin, y));
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function ActivityGraph() {
  const { loading, contrib, rateLimited } = useGithubData();
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  const g = useMemo(() => {
    if (!contrib) return null;
    const days = contrib.days.slice(-60);
    const peak = Math.max(...days.map((d) => d.count), 1);
    const step = Math.max(1, Math.ceil(peak / 4));
    const max = step * 4;
    const innerW = W - PL - PR, innerH = H - PT - PB;
    const x = (i) => PL + (i * innerW) / (days.length - 1);
    const y = (v) => PT + innerH * (1 - v / max);
    const pts = days.map((d, i) => [x(i), y(d.count)]);
    const line = smoothPath(pts, PT, PT + innerH);
    return {
      days, max, step, pts, line, x, y, base: PT + innerH, total: days.reduce((a, d) => a + d.count, 0),
      area: `${line} L${pts[pts.length - 1][0]} ${PT + innerH} L${pts[0][0]} ${PT + innerH} Z`,
      ticks: [0, 1, 2, 3, 4].map((k) => k * step),
      // every 14 days, but never right next to the final label (they would overlap)
      xLabels: days.map((d, i) => [i, d]).filter(([i]) => i === days.length - 1 || (i % 14 === 0 && days.length - 1 - i > 8)),
    };
  }, [contrib]);

  if (loading) return <Skeleton h={220} />;
  if (!contrib || !g) return <Unavailable rateLimited={rateLimited} />;

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((sx - PL) / (W - PL - PR)) * (g.days.length - 1));
    setHover(Math.min(g.days.length - 1, Math.max(0, i)));
  };
  const hd = hover != null ? g.days[hover] : null;
  const hx = hover != null ? g.pts[hover][0] : 0;
  const hy = hover != null ? g.pts[hover][1] : 0;
  const tipW = 132;
  const tipX = Math.min(W - PR - tipW, Math.max(PL, hx - tipW / 2));

  return (
    <div className="gh-activity">
      <div className="gh-activity-sum">
        <b><Num value={g.total} /></b> contributions in the last {g.days.length} days
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="gh-chart" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label="Daily contribution activity, last 60 days">
        <defs>
          <linearGradient id="gh-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--accent-hot)', stopOpacity: 0.28 }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent-hot)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {g.ticks.map((t) => (
          <g key={t}>
            <line x1={PL} x2={W - PR} y1={g.y(t)} y2={g.y(t)} className="gh-grid" />
            <text x={PL - 8} y={g.y(t) + 3.5} className="gh-axis" textAnchor="end">{t}</text>
          </g>
        ))}
        {g.xLabels.map(([i, d]) => (
          <text key={d.date} x={g.x(i)} y={H - 8} className="gh-axis" textAnchor={i === 0 ? 'start' : i === g.days.length - 1 ? 'end' : 'middle'}>{fmtDate(d.date)}</text>
        ))}
        <path d={g.area} className="gh-area" fill="url(#gh-area)" />
        <path d={g.line} className="gh-line" pathLength="1" />
        {hd && (
          <g>
            <line x1={hx} x2={hx} y1={PT} y2={g.base} className="gh-cursor" />
            <circle cx={hx} cy={hy} r="4.5" className="gh-dot" />
            <g transform={`translate(${tipX} ${PT - 2})`} className="gh-tip">
              <rect width={tipW} height="42" rx="8" />
              <text x="10" y="17" className="gh-tip-date">{fmtDate(hd.date, { weekday: 'short', month: 'short', day: 'numeric' })}</text>
              <text x="10" y="34" className="gh-tip-count">{hd.count} contribution{hd.count === 1 ? '' : 's'}</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
