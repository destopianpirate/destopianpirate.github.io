import { useEffect, useState } from 'react';

// Live GitHub data for the "GitHub Insights" tab. Replaces the third-party image widgets
// (github-readme-stats, activity-graph, ...) that are rate-limited or shut down.
//   - profile + repos: GitHub REST API (CORS-enabled, 60 requests/hour per visitor IP when unauthenticated)
//   - contribution calendar: github-contributions-api.jogruber.de, falling back to the public events feed
// Everything is cached in sessionStorage for 30 minutes and de-duplicated while in flight.

export const GH_USER = 'destopianpirate';
const TTL = 30 * 60 * 1000;
const inflight = new Map();

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(`gh:${key}`);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    return Date.now() - t < TTL ? v : null;
  } catch {
    return null;
  }
}

function writeCache(key, v) {
  try {
    sessionStorage.setItem(`gh:${key}`, JSON.stringify({ t: Date.now(), v }));
  } catch {
    /* storage unavailable (private mode) - the in-flight cache still de-duplicates */
  }
}

function cached(key, loader) {
  const hit = readCache(key);
  if (hit) return Promise.resolve(hit);
  if (inflight.has(key)) return inflight.get(key);
  const p = loader().then(
    (v) => { writeCache(key, v); inflight.delete(key); return v; },
    (e) => { inflight.delete(key); throw e; }
  );
  inflight.set(key, p);
  return p;
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(res.status === 403 || res.status === 429 ? 'rate-limit' : `http-${res.status}`);
  return res.json();
}

export const getProfile = () =>
  cached('profile', async () => {
    const u = await gh(`/users/${GH_USER}`);
    return { public_repos: u.public_repos, followers: u.followers, following: u.following, created_at: u.created_at };
  });

export const getRepos = () =>
  cached('repos', async () => {
    const list = await gh(`/users/${GH_USER}/repos?sort=updated&per_page=100`);
    return list.map((r) => ({
      name: r.name, description: r.description, html_url: r.html_url, language: r.language,
      stargazers_count: r.stargazers_count, forks_count: r.forks_count, size: r.size, fork: r.fork,
    }));
  });

// Last-resort source: the public events feed only reaches back ~90 days, but needs no third party.
async function eventsAsDays() {
  const settled = await Promise.allSettled([1, 2].map((p) => gh(`/users/${GH_USER}/events/public?per_page=100&page=${p}`)));
  const ok = settled.filter((s) => s.status === 'fulfilled');
  // nothing came back at all: surface the failure instead of drawing a misleading flat zero line
  if (ok.length === 0) throw settled[0].reason;
  const counts = new Map();
  for (const ev of ok.flatMap((s) => s.value)) {
    const d = ev.created_at.slice(0, 10);
    const n = ev.type === 'PushEvent' ? Math.max(1, ev.payload?.size ?? 1) : 1;
    counts.set(d, (counts.get(d) || 0) + n);
  }
  const days = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const dt = new Date(now);
    dt.setUTCDate(dt.getUTCDate() - i);
    const k = dt.toISOString().slice(0, 10);
    days.push({ date: k, count: counts.get(k) || 0 });
  }
  return { days, total: days.reduce((a, d) => a + d.count, 0), source: 'events' };
}

export const getContributions = () =>
  cached('contrib', async () => {
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
      if (!res.ok) throw new Error('contrib');
      const j = await res.json();
      return { days: j.contributions.map(({ date, count }) => ({ date, count })), total: j.total.lastYear, source: 'calendar' };
    } catch {
      return eventsAsDays();
    }
  });

export function computeStreaks(days) {
  let run = 0;
  let runStart = null;
  let best = { len: 0, start: null, end: null };
  for (const d of days) {
    if (d.count > 0) {
      if (run === 0) runStart = d.date;
      run += 1;
      if (run > best.len) best = { len: run, start: runStart, end: d.date };
    } else {
      run = 0;
    }
  }
  // current streak: walk back from today (today may still be empty if yesterday was active)
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i -= 1;
  const end = days[i]?.date ?? null;
  let len = 0;
  let start = null;
  while (i >= 0 && days[i].count > 0) { len += 1; start = days[i].date; i -= 1; }
  return { current: { len, start: len ? start : null, end: len ? end : null }, longest: best };
}

/** Each piece resolves independently, so one failing source never blanks the others. */
export function useGithubData() {
  const [state, setState] = useState({ loading: true, profile: null, repos: null, contrib: null });
  useEffect(() => {
    let on = true;
    Promise.allSettled([getProfile(), getRepos(), getContributions()]).then(([p, r, c]) => {
      if (!on) return;
      setState({
        loading: false,
        profile: p.status === 'fulfilled' ? p.value : null,
        repos: r.status === 'fulfilled' ? r.value : null,
        contrib: c.status === 'fulfilled' ? c.value : null,
        rateLimited: [p, r, c].some((x) => x.status === 'rejected' && x.reason?.message === 'rate-limit'),
      });
    });
    return () => { on = false; };
  }, []);
  return state;
}
