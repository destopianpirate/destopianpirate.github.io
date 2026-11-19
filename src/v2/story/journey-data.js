import { SKILLS, TIMELINE } from '../data/portfolio';

// Journey chapter props: an ink travel map with the real route, wooden station signposts and a
// one-way train ticket. Coordinates are a simple lon/lat projection of the three real cities.

const proj = (lon, lat) => [20 + ((lon - 72) / 12) * 260, 200 - ((lat - 22) / 6) * 180];

export const STOPS = [
  { name: 'Prayagraj', kana: 'プラヤーグラージ', what: 'Home', km: 0, at: proj(81.85, 25.44) },
  { name: 'Lucknow', kana: 'ラクナウ', what: 'School · 2021–24', km: 181, at: proj(80.95, 26.85) },
  { name: 'Gandhinagar', kana: 'ガンディーナガル', what: 'IIT · 2025 →', km: 1109, at: proj(72.64, 23.22) },
];

const [P, L, G] = STOPS.map((s) => s.at);
export const LEG1 = `M${P[0]} ${P[1]} Q ${P[0] - 4} ${(P[1] + L[1]) / 2 - 6} ${L[0]} ${L[1]}`;
export const ROUTE = `${LEG1} Q ${(L[0] + G[0]) / 2 + 10} ${L[1] - 30} ${G[0]} ${G[1]}`;

// ---- 千本鳥居 · The Thousand Gates: every gate is dedicated to one milestone or skill ----
const NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export const kanjiNum = (n) => (n <= 10 ? NUM[n - 1] : n < 20 ? `十${NUM[n - 11]}` : `${NUM[Math.floor(n / 10) - 1]}十${n % 10 ? NUM[(n % 10) - 1] : ''}`);

export const GATE_SP = 150; // strip units between gates
export const GATE_LEAD = 420; // strip units before the first gate
export const CAP_Y = 124; // cap top, in strip units (strip is 600 tall)

const skillGates = SKILLS.flatMap((c) => c.items.filter((it) => it.logo).slice(0, 3).map((it) => ({
  jp: c.jp, en: it.name.split(' (')[0].replace(/ (Deep Learning|Engine|Containerization|Version Control|Edge Implementations)$/, ''), sub: `${c.category.split(' ')[0]} · ${it.level}%`,
})));

// the two entrance exams that stood between school and IIT Gandhinagar
const EXAMS = [
  { jp: '試験', en: 'JEE Main', sub: 'Cleared · round one', exam: true },
  { jp: '突破', en: 'JEE Advanced', sub: 'Cleared · the IIT gate', exam: true },
];

const school = [...TIMELINE].reverse();
export const GATES = [
  ...school.slice(0, -1).map((t) => ({ jp: t.kanji, en: t.title.replace(/ \(.*\)/, '').replace(' in Artificial Intelligence', ' · AI'), sub: t.score ? `${t.score}% · ${t.date.slice(-4)}` : t.institution })),
  ...EXAMS,
  ...school.slice(-1).map((t) => ({ jp: t.kanji, en: t.title.replace(/ \(.*\)/, '').replace(' in Artificial Intelligence', ' · AI'), sub: t.institution })),
  ...skillGates,
].slice(0, 20).map((g, i) => ({ ...g, no: kanjiNum(i + 1) }));

// gates where the runner front-flips over to the next cap instead of stepping
export const FLIPS = [2, 3, 9, 14];

export const STRIP_H = 600;
export const STRIP_W = GATE_LEAD + GATES.length * GATE_SP + 700;
