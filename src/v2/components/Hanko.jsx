import { useId } from 'react';

/** A red seal stamp: text runs round a circle that slowly spins, a kanji sits in the middle. */
export default function Hanko({ text = 'AYUSH SINGH · ', center = '印', className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={`hanko ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id={`hk-${id}`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <g className="hanko-spin">
          <text>
            <textPath href={`#hk-${id}`} textLength="460">{text.repeat(2)}</textPath>
          </text>
        </g>
        <circle cx="100" cy="100" r="54" className="hanko-ring" />
        <text x="100" y="100" className="hanko-center" textAnchor="middle" dominantBaseline="central">{center}</text>
      </svg>
    </div>
  );
}
