// Coded (no images) illustrations for the three focus pillars.

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

export function ServerStack() {
  return (
    <div className="h3-stack-wrap" aria-hidden="true">
      <div className="h3-stack">
        {[0, 1, 2].map((i) => (
          <div className="h3-stack-slab" key={i} style={{ '--i': i }}>
            <span className="h3-stack-led" />
            <span className="h3-stack-vents" />
            <span className="h3-stack-packet" style={{ animationDelay: `${i * 0.6}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrowserStack() {
  return (
    <div className="h3-wins-wrap" aria-hidden="true">
      <div className="h3-wins">
        {[2, 1].map((i) => (
          <div className="h3-win is-back" key={i} style={{ '--i': i }}>
            <div className="h3-win-bar"><i className="is-hot" /><i /><i /></div>
            <div className="h3-win-body">
              <span className="h3-sk" style={{ width: '55%' }} />
              <span className="h3-sk" style={{ width: '80%' }} />
              <span className="h3-sk" style={{ width: '40%' }} />
              <span className="h3-sk" style={{ width: '68%' }} />
            </div>
          </div>
        ))}
        <div className="h3-win is-front" style={{ '--i': 0 }}>
          <div className="h3-win-bar"><i className="is-hot" /><i /><i /><span className="h3-win-url" /></div>
          <div className="h3-win-body h3-win-grid">
            <div className="h3-win-side"><b /><b /><b /><b /></div>
            <div className="h3-win-chart">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                <path className="h3-area" d="M0 32 C 12 30, 18 14, 30 18 S 50 34, 62 22 S 84 6, 100 12 L 100 40 L 0 40 Z" />
                <path className="h3-curve" d="M0 32 C 12 30, 18 14, 30 18 S 50 34, 62 22 S 84 6, 100 12" />
              </svg>
            </div>
            <div className="h3-win-donut"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="13" /><circle className="h3-donut-val" cx="18" cy="18" r="13" /></svg></div>
            <div className="h3-win-bars">{[0, 1, 2, 3, 4].map((b) => <span key={b} style={{ animationDelay: `${b * 0.15}s` }} />)}</div>
            <div className="h3-win-list"><span /><span /><span /></div>
            <div className="h3-win-cta"><span /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PillarVisual({ index }) {
  if (index === 0) return <NeuralGraph />;
  if (index === 1) return <ServerStack />;
  return <BrowserStack />;
}
