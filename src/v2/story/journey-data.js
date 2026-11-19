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
