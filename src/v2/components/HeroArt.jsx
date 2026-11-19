import { FEATURED, SKILLS } from '../data/portfolio';
import { Weapon } from '../story/Scenery';
import { rand } from '../story/world';
import ProjectLogo from './ProjectLogo';

// Page-specific art that stands beside the wanderer in each sub page's hero.

/** Projects: a fan of case files, each stamped 撃破 (defeated). */
export function FilesArt() {
  const files = FEATURED.slice(0, 5);
  return (
    <div className="ha-files">
      {files.map((p, i) => (
        <div className="ha-file" key={p.slug} style={{ '--i': i - (files.length - 1) / 2 }}>
          <span className="ha-file-tab mono">Case {String(i + 1).padStart(2, '0')}</span>
          <div className="ha-file-art"><ProjectLogo project={p} /></div>
          <b>{p.title.replace(/\s*\(.*\)$/, '').replace(/ - .*$/, '')}</b>
          <em className="ha-stamp">撃破</em>
        </div>
      ))}
      <span className="ph2-sfx sfx ha-sfx">バンッ</span>
    </div>
  );
}

const WEAPON_FOR = ['katana', 'kunai', 'shuriken', 'kama', 'bow', 'naginata'];

/** Skills: the six weapon classes orbit the wanderer. */
export function ArsenalArt() {
  return (
    <div className="ha-ring">
      <div className="ha-ring-track" />
      <div className="ha-ring-spin">
        {SKILLS.slice(0, 6).map((c, i) => (
          <div className="ha-weapon" key={c.category} style={{ '--a': `${i * 60}deg` }}>
            <div className="ha-weapon-in">
              <svg viewBox="-215 -165 430 330"><Weapon kind={WEAPON_FOR[i]} /></svg>
              <span>{c.jp}</span>
            </div>
          </div>
        ))}
      </div>
      <span className="ph2-sfx sfx ha-sfx">シャキン</span>
    </div>
  );
}

/** GitHub: a manga panel of contribution squares that ripple; real data when it has loaded. */
export function CommitsArt({ days, total }) {
  const COLS = 16;
  const r = rand(11);
  const cells = days?.length
    ? (() => {
      const slice = days.slice(-COLS * 7);
      const max = Math.max(1, ...slice.map((d) => d.count));
      return slice.map((d) => (d.count === 0 ? 0 : Math.ceil((d.count / max) * 4)));
    })()
    : Array.from({ length: COLS * 7 }, () => Math.floor(r() * r() * 5));
  return (
    <div className="ha-commits">
      <header><b>草</b><span className="mono">{total ? `${total.toLocaleString()} contributions · 1y` : 'Contribution log'}</span></header>
      <div className="ha-grid">
        {cells.map((lv, i) => <i key={i} className={`lv${lv}`} style={{ '--c': Math.floor(i / 7) }} />)}
      </div>
      <footer className="mono">git push --force-of-will</footer>
      <span className="ph2-sfx sfx ha-sfx">カタカタ</span>
    </div>
  );
}

/** Blog: an unrolled makimono with the latest chapters brushed onto it. */
export function ScrollArt({ posts }) {
  return (
    <div className="ha-scroll">
      <span className="ha-rod" />
      <div className="ha-paper">
        <span className="ha-paper-head">書 · Latest chapters</span>
        {posts.slice(0, 4).map((p, i) => (
          <div className="ha-line" key={p.slug} style={{ '--i': i }}>
            <b>{p.kanji}</b><span>{p.title}</span>
          </div>
        ))}
      </div>
      <span className="ha-rod" />
      <span className="ha-lantern"><i /></span>
      <span className="ph2-sfx sfx ha-sfx">サラサラ</span>
    </div>
  );
}
