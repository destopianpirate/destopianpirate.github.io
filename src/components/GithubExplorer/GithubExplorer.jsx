import { useState, useEffect } from 'react';
import './GithubExplorer.css';

export default function GithubExplorer() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    let active = true;
    fetch('https://api.github.com/users/destopianpirate/repos?sort=updated&per_page=100')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (active) {
          const sorted = data
            .filter(r => !r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count);
          setRepos(sorted);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('GitHub API failed, loading local fallback repos', err);
        if (active) {
          setLoading(false);
          setRepos([
            { name: 'QS-IITGN', description: 'The official interactive Web platform for Quizzing Society of IIT Gandhinagar built with GSAP scroll animation systems.', html_url: 'https://github.com/destopianpirate/qs_iitgn', language: 'JavaScript', stargazers_count: 5, forks_count: 0 },
            { name: 'AcadX', description: 'Academic planner and student workspace featuring calendar schedules and Gemini AI companion.', html_url: 'https://github.com/destopianpirate', language: 'JavaScript', stargazers_count: 5, forks_count: 1 },
            { name: 'AssignmentAI', description: 'Deep learning homework helper utilizing document vision OCR models and PDF compiler.', html_url: 'https://github.com/destopianpirate', language: 'JavaScript', stargazers_count: 4, forks_count: 0 },
            { name: 'RoadGuard-AI', description: 'Real-time road cracking detect system utilizing YOLOv8 and Google Maps GPS coordinates.', html_url: 'https://github.com/destopianpirate', language: 'Python', stargazers_count: 6, forks_count: 2 },
            { name: 'FamShield', description: 'Mobile parental safety tracker and remote device telemetry app built with React Native and Expo.', html_url: 'https://github.com/destopianpirate/famapp', language: 'TypeScript', stargazers_count: 3, forks_count: 0 },
            { name: 'ZeroGPTi', description: 'NLP linguistic checker assessing sentence grammar structures and machine probability rates.', html_url: 'https://github.com/destopianpirate', language: 'Python', stargazers_count: 2, forks_count: 0 },
            { name: 'IoT-Dashboard', description: 'Low-latency edge sensor network dashboard mapping telemetry curves via MQTT broker.', html_url: 'https://github.com/destopianpirate', language: 'JavaScript', stargazers_count: 3, forks_count: 1 }
          ]);
        }
      });
    return () => { active = false; };
  }, []);

  const languages = ['All', ...new Set(repos.map(r => r.language).filter(Boolean))];

  const filteredRepos = repos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()));
    const matchesLanguage = selectedLanguage === 'All' || repo.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="github-explorer-section">
      <div className="explorer-header">
        <h3 className="explorer-title">Public Repository Explorer</h3>
        <p className="explorer-desc">Search, filter, and review live repository telemetry from my GitHub account.</p>
      </div>

      <div className="explorer-controls">
        <input
          type="text"
          placeholder="Search repositories..."
          className="explorer-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="explorer-lang-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="explorer-loader">Synchronizing telemetry from api.github.com...</div>
      ) : (
        <div className="github-explorer-grid">
          {filteredRepos.map(repo => (
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="repo-card"
              key={repo.name}
            >
              <div className="repo-card-header">
                <h4 className="repo-card-name">{repo.name}</h4>
                {repo.language && <span className="repo-lang-badge">{repo.language}</span>}
              </div>
              <p className="repo-card-desc">{repo.description || "No description provided."}</p>
              <div className="repo-card-stats">
                <span className="repo-stat-item">★ {repo.stargazers_count}</span>
                <span className="repo-stat-item">⌥ {repo.forks_count}</span>
              </div>
            </a>
          ))}
          {filteredRepos.length === 0 && (
            <div className="explorer-no-results">No public repositories match your search filters.</div>
          )}
        </div>
      )}
    </div>
  );
}
