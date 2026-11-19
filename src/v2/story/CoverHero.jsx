import { useEffect, useId, useRef } from 'react';
import { store } from '../core/store';
import { rand } from './world';
import portrait from '../../assets/profile-story.webp';

// Opening "weekly manga magazine" cover: your photo is cut into four comic panels, each inked
// differently (halftone ink, red duotone, raw colour, line art). The panels sit at different
// depths, so the cover splits apart in 3D as the pointer moves.

const VB = { w: 560, h: 700 };
const COVER_PANELS = [
  { key: 'ink', pts: '0,0 300,0 270,318 0,300', fly: [-1, -1] },
  { key: 'duo', pts: '314,0 560,0 560,340 284,320', fly: [1, -1] },
  { key: 'raw', pts: '0,314 268,332 238,700 0,700', fly: [-1, 1] },
  { key: 'line', pts: '282,334 560,354 560,700 252,700', fly: [1, 1] },
];

function Filter({ id, kind }) {
  if (kind === 'ink') {
    return (
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer><feFuncR type="linear" slope="1.9" intercept="-0.38" /><feFuncG type="linear" slope="1.9" intercept="-0.38" /><feFuncB type="linear" slope="1.9" intercept="-0.38" /></feComponentTransfer>
      </filter>
    );
  }
  if (kind === 'duo') {
    return (
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.05 0.89 1" />
          <feFuncG type="table" tableValues="0.05 0.07 0.96" />
          <feFuncB type="table" tableValues="0.06 0.17 0.93" />
        </feComponentTransfer>
      </filter>
    );
  }
  if (kind === 'line') {
    return (
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer><feFuncR type="discrete" tableValues="0 0 1 1 1" /><feFuncG type="discrete" tableValues="0 0 1 1 1" /><feFuncB type="discrete" tableValues="0 0 1 1 1" /></feComponentTransfer>
      </filter>
    );
  }
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="1.15" />
    </filter>
  );
}

function Panel({ p, uid }) {
  const clip = `c-${p.key}-${uid}`;
  const filt = `f-${p.key}-${uid}`;
  const dots = `d-${p.key}-${uid}`;
  return (
    <svg className={`cpanel cpanel--${p.key}`} viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true">
      <defs>
        <clipPath id={clip}><polygon points={p.pts} /></clipPath>
        <Filter id={filt} kind={p.key} />
        <pattern id={dots} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
          <circle cx="3.5" cy="3.5" r="1.6" fill="#0d0d0f" />
        </pattern>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width={VB.w} height={VB.h} fill={p.key === 'line' ? '#fff' : '#fbf8f1'} />
        <image href={portrait} x="-70" y="0" width="700" height="700" preserveAspectRatio="xMidYMid slice" filter={`url(#${filt})`} />
        {p.key === 'ink' && <rect width={VB.w} height={VB.h} fill={`url(#${dots})`} opacity="0.32" style={{ mixBlendMode: 'multiply' }} />}
        {p.key === 'raw' && (
          <g opacity="0.5">
            {Array.from({ length: 26 }, (_, i) => {
              const a = (i / 26) * Math.PI * 2;
              return <line key={i} x1={120} y1={560} x2={120 + Math.cos(a) * 600} y2={560 + Math.sin(a) * 600} stroke="#fff" strokeWidth={i % 2 ? 1 : 2.4} />;
            })}
          </g>
        )}
      </g>
      <polygon points={p.pts} fill="none" stroke="#0d0d0f" strokeWidth="7" strokeLinejoin="miter" />
    </svg>
  );
}

function Barcode() {
  const r = rand(77);
  let x = 0;
  const bars = [];
  while (x < 150) {
    const w = 1 + Math.floor(r() * 4);
    bars.push(<rect key={x} x={x} y="0" width={w} height="44" fill="#0d0d0f" />);
    x += w + 1 + Math.floor(r() * 3);
  }
  return (
    <svg className="cv-barcode" viewBox="0 0 150 60" aria-hidden="true">
      {bars}
      <text x="0" y="58" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#0d0d0f">4 902026 000207</text>
    </svg>
  );
}

export default function CoverHero({ name }) {
  const uid = useId().replace(/:/g, '');
  const rig = useRef(null);

  // the whole cover tilts toward the pointer; panels sit at different depths
  useEffect(() => {
    let raf, rx = 0, ry = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ry += (store.mouse.x * 12 - ry) * 0.07;
      rx += (store.mouse.y * 9 - rx) * 0.07;
      if (rig.current) rig.current.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="cover-art" role="img" aria-label={`Manga-style cover featuring a photo of ${name}, split into four comic panels`}>
      <div className="cover-3d" ref={rig}>
        <div className="cover-page" />
        {COVER_PANELS.map((p) => <Panel key={p.key} p={p} uid={uid} />)}
        <div className="cover-badge"><b>新連載</b><span>New series</span></div>
        <span className="cover-sfx sfx" aria-hidden="true">ドンッ</span>
        <div className="bubble cover-bubble">Yo. I'm <b>{name.split(' ')[0]}.</b></div>
        <div className="cover-strip mono">第二巻 · Vol.02 · {name.toUpperCase()}</div>
      </div>
    </div>
  );
}

export { Barcode };
