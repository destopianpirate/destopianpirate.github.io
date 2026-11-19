import { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, GitFork, Github, Search, Star } from 'lucide-react';
import { ME } from '../data/portfolio';
import { useReveal } from '../core/reveal';
import PageHero from '../components/PageHero';
import { GithubStrip, Heatmap } from '../components/GithubLive';
import { useGithubSummary } from '../core/useGithubSummary';
import '../styles/pages.css';

export default function Github2() {
  const root = useRef(null);
  const gh = useGithubSummary();
  const [q, setQ] = useState('');
  const [lang, setLang] = useState('All');
  const [sort, setSort] = useState('updated');

  const langs = useMemo(() => ['All', ...Array.from(new Set(gh.repos.map((r) => r.language).filter(Boolean))).sort()], [gh.repos]);
  const list = useMemo(() => {
    let r = gh.repos.filter((x) => (lang === 'All' || x.language === lang) && (`${x.name} ${x.description || ''}`).toLowerCase().includes(q.toLowerCase()));
    if (sort === 'stars') r = [...r].sort((a, b) => b.stargazers_count - a.stargazers_count);
    if (sort === 'name') r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [gh.repos, q, lang, sort]);

  useReveal(root, () => {}, [gh.loading]);

  return (
    <div className="page github2" ref={root}>
      <PageHero ep="VOL.02 · RECORDS" jp="記録 — Live from GitHub" kanji="記" title="Commit" accent="log.">
        <p className="lead">Live data from <a className="ulink" href={ME.github} target="_blank" rel="noreferrer">@{ME.githubHandle}</a>, cached for 30 minutes.</p>
      </PageHero>

      <section className="paper gh-sec">
        <div className="wrap">
          <div data-anim="up"><GithubStrip /></div>
        </div>
      </section>

      {gh.contrib?.source === 'calendar' && (
        <section className="ink gh-year">
          <div className="wrap">
            <span className="kicker kicker--light">一年</span>
            <h2 className="h-xl h-light" data-anim="chars">A year in squares.</h2>
            <div className="gh-year-map" data-anim="up"><Heatmap days={gh.contrib.days} weeks={53} /></div>
            <p className="mono gh-year-total">{gh.contrib.total.toLocaleString()} contributions in the last year</p>
          </div>
        </section>
      )}

      <section className="paper-2 gh-repos">
        <div className="wrap">
          <span className="kicker">保管庫</span>
          <h2 className="h-xl" data-anim="chars">Repositories.</h2>
          <div className="gh-tools">
            <label className="gh-search">
              <Search size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search repos…" aria-label="Search repositories" />
            </label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Filter by language">
              {langs.map((l) => <option key={l}>{l}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="updated">Recently updated</option>
              <option value="stars">Most stars</option>
              <option value="name">Name</option>
            </select>
          </div>

          {gh.loading && <p className="gh-note">Loading repositories…</p>}
          {!gh.loading && !gh.repos.length && (
            <p className="gh-note">{gh.rateLimited ? 'GitHub rate limit reached for your network. Try again in a few minutes.' : 'Repositories are unavailable right now.'}</p>
          )}
          <div className="repo-grid">
            {list.map((r) => (
              <a key={r.name} href={r.html_url} target="_blank" rel="noreferrer" className="repo" data-cursor="OPEN">
                <header>
                  <Github size={16} />
                  <h3>{r.name}</h3>
                  <ArrowUpRight size={16} className="repo-arrow" />
                </header>
                <p>{r.description || 'No description.'}</p>
                <footer>
                  {r.language && <span className="repo-lang"><i />{r.language}</span>}
                  <span><Star size={13} /> {r.stargazers_count}</span>
                  <span><GitFork size={13} /> {r.forks_count}</span>
                </footer>
              </a>
            ))}
          </div>
          {!gh.loading && gh.repos.length > 0 && !list.length && <p className="gh-note">No repositories match.</p>}
          <div className="sk-cta">
            <a href={ME.github} target="_blank" rel="noreferrer" className="btn btn--ink"><Github size={16} /> Full profile on GitHub</a>
          </div>
        </div>
      </section>
    </div>
  );
}
