import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGithubSummary } from '../core/useGithubSummary';

// Live GitHub widgets for v2, reusing the original site's cached data layer.

export function Heatmap({ days, weeks = 26 }) {
  if (!days?.length) return null;
  const slice = days.slice(-weeks * 7);
  const max = Math.max(1, ...slice.map((d) => d.count));
  const cols = [];
  for (let i = 0; i < slice.length; i += 7) cols.push(slice.slice(i, i + 7));
  return (
    <div className="heat" role="img" aria-label={`Contribution heatmap for the last ${weeks} weeks`}>
      {cols.map((col, ci) => (
        <div className="heat-col" key={ci}>
          {col.map((d) => {
            const lv = d.count === 0 ? 0 : Math.ceil((d.count / max) * 4);
            return <span key={d.date} className={`heat-cell lv${lv}`} title={`${d.date}: ${d.count}`} />;
          })}
        </div>
      ))}
    </div>
  );
}

export function LangBar({ languages }) {
  if (!languages?.length) return null;
  return (
    <div className="langs">
      <div className="langs-bar">
        {languages.map((l) => <span key={l.name} style={{ width: `${l.pct}%`, background: l.color }} title={`${l.name} ${l.pct.toFixed(1)}%`} />)}
      </div>
      <ul className="langs-legend">
        {languages.map((l) => (
          <li key={l.name}><i style={{ background: l.color }} />{l.name}<em>{l.pct.toFixed(1)}%</em></li>
        ))}
      </ul>
    </div>
  );
}

const fmt = (v) => (v == null ? '—' : v.toLocaleString());

export function GithubStrip() {
  const gh = useGithubSummary();
  // the panel changes height once data lands: re-measure every scroll trigger below it
  useEffect(() => {
    if (!gh.loading) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [gh.loading]);
  const stats = [
    ['Public repos', gh.profile?.public_repos],
    ['Contributions (1y)', gh.contrib?.source === 'calendar' ? gh.contrib?.total : null],
    ['Current streak', gh.streaks ? `${gh.streaks.current.len}d` : null],
    ['Longest streak', gh.streaks ? `${gh.streaks.longest.len}d` : null],
    ['Stars earned', gh.repos?.length ? gh.stars : null],
    ['Followers', gh.profile?.followers],
  ];
  return (
    <div className="ghs">
      <div className="ghs-stats">
        {stats.map(([k, v]) => (
          <div className="ghs-stat" key={k}>
            <b className={gh.loading ? 'is-loading' : ''}>{gh.loading ? '···' : typeof v === 'string' ? v : fmt(v)}</b>
            <span>{k}</span>
          </div>
        ))}
      </div>
      <div className="ghs-panel panel-frame">
        <header><span className="mono">Contribution calendar</span><span className="mono ghs-src">{gh.contrib ? `last ${gh.contrib.source === 'calendar' ? '26 weeks' : '90 days'}` : ''}</span></header>
        {gh.contrib ? <Heatmap days={gh.contrib.days} weeks={26} /> : <p className="ghs-empty">{gh.loading ? 'Loading activity…' : gh.rateLimited ? 'GitHub rate limit reached. Try again in a few minutes.' : 'Activity is unavailable right now.'}</p>}
        <LangBar languages={gh.languages} />
      </div>
    </div>
  );
}
