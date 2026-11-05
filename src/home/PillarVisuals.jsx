// Coded (no images) illustrations for the three discipline cards.
// All three are flat technical drawings on dotted paper: ink outlines, one orange-red accent that moves.

const LAYERS = [3, 5, 5, 2];
const LAYER_X = [34, 96, 158, 216];
const HOT = [1, 2, 3, 0]; // index of the highlighted node per layer → the "active" signal path

function layerNodes(n, x) {
  const gap = 118 / Math.max(n - 1, 1);
  const top = 75 - ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => ({ x, y: n === 1 ? 75 : top + i * gap }));
}

export function NeuralGraph() {
  const layers = LAYERS.map((n, i) => layerNodes(n, LAYER_X[i]));
  const edges = [];
  layers.slice(0, -1).forEach((L, li) => {
    L.forEach((a, ai) => layers[li + 1].forEach((b, bi) => {
      edges.push({ a, b, hot: ai === HOT[li] && bi === HOT[li + 1], key: `${li}-${ai}-${bi}` });
    }));
  });
  return (
    <svg className="h3-nn" viewBox="0 0 250 150" aria-hidden="true">
      <g className="h3-nn-edges">
        {edges.map((e) => (
          <line key={e.key} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y} className={e.hot ? 'is-hot' : ''} />
        ))}
      </g>
      <g className="h3-nn-signals">
        {edges.filter((e) => e.hot).map((e, i) => (
          <line key={e.key} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y} style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
      </g>
      {layers.map((L, li) => L.map((n, ni) => {
        const hot = ni === HOT[li];
        return (
          <g key={`${li}-${ni}`} className={`h3-nn-node ${hot ? 'is-hot' : ''}`} style={{ animationDelay: `${li * 0.35}s` }}>
            {hot && <circle className="h3-nn-ring" cx={n.x} cy={n.y} r="7" style={{ animationDelay: `${li * 0.35}s` }} />}
            <circle cx={n.x} cy={n.y} r={hot ? 5.5 : 4.5} />
          </g>
        );
      }))}
    </svg>
  );
}

/* Systems: a rack elevation. Three units with vent grilles, drive bays and LEDs; a packet runs along each. */
const RACK_Y = [14, 56, 98];

export function ServerRack() {
  return (
    <svg className="dv" viewBox="0 0 250 150" aria-hidden="true">
      <line className="dv-rail" x1="38" y1="8" x2="38" y2="138" />
      <line className="dv-rail" x1="212" y1="8" x2="212" y2="138" />
      <line className="dv-rail" x1="26" y1="142" x2="224" y2="142" />
      {RACK_Y.map((y, i) => (
        <g key={y}>
          <rect className="dv-box" x="46" y={y} width="158" height="34" rx="2" />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <line key={k} className="dv-fine" x1={58 + k * 6} y1={y + 9} x2={58 + k * 6} y2={y + 25} />
          ))}
          {[0, 1, 2].map((k) => (
            <rect key={k} className="dv-fine" x={108 + k * 24} y={y + 10} width="18" height="14" rx="1.5" />
          ))}
          <circle className={`dv-led ${i === 2 ? 'is-hot' : ''}`} cx="186" cy={y + 17} r="2.4" />
          <circle className="dv-led-off" cx="194" cy={y + 17} r="2.4" />
          {[42, 208].map((x) => [8, 26].map((dy) => <circle key={`${x}-${dy}`} className="dv-screw" cx={x} cy={y + dy} r="1.4" />))}
          <line className="dv-packet" x1="50" y1={y + 30} x2="200" y2={y + 30} style={{ animationDelay: `${i * 0.7}s` }} />
        </g>
      ))}
    </svg>
  );
}

/* Web: two browser windows in wireframe, with a self-drawing chart, bars that grow and a pulsing button. */
const BARS = [10, 18, 13, 24, 16, 20, 12];

export function BrowserWireframe() {
  return (
    <svg className="dv" viewBox="0 0 250 150" aria-hidden="true">
      <g className="dv-back">
        <rect className="dv-box" x="30" y="10" width="150" height="104" rx="2" />
        <line className="dv-fine" x1="30" y1="22" x2="180" y2="22" />
        <line className="dv-fine" x1="42" y1="40" x2="112" y2="40" />
        <line className="dv-fine" x1="42" y1="52" x2="140" y2="52" />
        <line className="dv-fine" x1="42" y1="64" x2="98" y2="64" />
      </g>
      <rect className="dv-box" x="58" y="28" width="164" height="112" rx="2" />
      <line className="dv-fine" x1="58" y1="42" x2="222" y2="42" />
      <circle className="dv-dot is-hot" cx="67" cy="35" r="2.2" />
      <circle className="dv-dot" cx="75" cy="35" r="2.2" />
      <circle className="dv-dot" cx="83" cy="35" r="2.2" />
      <rect className="dv-fine" x="96" y="32" width="100" height="6" rx="3" />
      <line className="dv-fine" x1="82" y1="42" x2="82" y2="140" />
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} className={k === 0 ? 'dv-solid' : 'dv-fine'} x="65" y={50 + k * 14} width="10" height="8" rx="1" />
      ))}
      <path className="dv-area" d="M92 94 C108 90 112 68 128 72 S150 96 166 82 S196 58 214 62 L214 100 L92 100 Z" />
      <path className="dv-curve" pathLength="1" d="M92 94 C108 90 112 68 128 72 S150 96 166 82 S196 58 214 62" />
      <line className="dv-fine" x1="92" y1="100" x2="214" y2="100" />
      {BARS.map((h, k) => (
        <rect key={k} className="dv-bar" x={92 + k * 13} y={132 - h} width="8" height={h} style={{ animationDelay: `${k * 0.18}s` }} />
      ))}
      <rect className="dv-cta" x="180" y="118" width="34" height="14" rx="2" />
    </svg>
  );
}

export default function PillarVisual({ index }) {
  if (index === 0) return <NeuralGraph />;
  if (index === 1) return <ServerRack />;
  return <BrowserWireframe />;
}
