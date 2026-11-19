import { useMemo } from 'react';
import { computeStreaks, useGithubData } from '../../components/GithubInsights/githubData';

// GitHub profile, repos and contributions (cached by the original site's data layer), summarised for v2.
const LANG_COLORS = ['#e3122c', '#0d0d0f', '#ff8fa3', '#7a7a80', '#9e0b1f', '#c9c4b8'];

export function useGithubSummary() {
  const gh = useGithubData();
  return useMemo(() => {
    const repos = (gh.repos || []).filter((r) => !r.fork);
    const langs = {};
    repos.forEach((r) => {
      if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; // by repo count: byte size over-weights notebooks
    });
    const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, v], i) => ({ name, pct: (v / total) * 100, color: LANG_COLORS[i % LANG_COLORS.length] }));
    const stars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
    const streaks = gh.contrib ? computeStreaks(gh.contrib.days) : null;
    return { ...gh, repos, languages, stars, streaks };
  }, [gh]);
}
