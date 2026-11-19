import { BASE, POSES, applyPose } from './pose';

// Articulated SVG character for the scroll story. Facing +x.
// Angles are degrees; 0 = limb hanging straight down, negative = swung forward.
// Two looks from the same rig, picked with CSS variables on a parent:
//   silhouette (default): body and outline share one colour
//   line art (.actor--line): white fill with a bold black ink outline, manga style

const BODY = 'var(--rig-body, #0d0d0f)';
const BACK = 'var(--rig-back, #2a2a30)';
const LINE = 'var(--rig-line, var(--rig-body, #0d0d0f))';
const RED = 'var(--rig-accent, #e3122c)';
const DET = 'var(--rig-detail, #5a5a66)'; // inner detail lines on silhouette characters (the oni)
const HORN = 'var(--rig-horn, #ece4d2)'; // bone: horns, fangs, claws, studs
const TIGER = 'var(--rig-tiger, #c40f25)';
const ROPE = 'var(--rig-rope, #d9c9a0)';
const INK = '#0d0d0f';
const OL = 6; // outline thickness (svg units) for limbs

const ink = { stroke: LINE, strokeWidth: 3.6, strokeLinejoin: 'round', strokeLinecap: 'round' };
const det = (w = 1.8) => ({ stroke: DET, strokeWidth: w, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' });
const bone = { fill: HORN, stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' };

/** A capsule limb: thick outline stroke under the fill stroke. */
function Limb({ len, w, color }) {
  return (
    <>
      <line x1="0" y1="0" x2="0" y2={len} stroke={LINE} strokeWidth={w + OL} strokeLinecap="round" />
      <line x1="0" y1="0" x2="0" y2={len} stroke={color} strokeWidth={w} strokeLinecap="round" />
    </>
  );
}

/* ---------- body parts ---------- */
function Leg({ id, color, wide, variant }) {
  const oni = variant === 'oni';
  const ninja = variant === 'ninja';
  return (
    <g data-j={id}>
      <Limb len={44} w={wide ? 22 : 16} color={color} />
      {oni && <path d="M-10 10 Q0 14 10 10 M-9 24 Q0 28 9 24" {...det(1.6)} />}
      <g data-j={`${id}L`} transform="translate(0 44)">
        <Limb len={42} w={wide ? 15 : 12} color={color} />
        {oni ? (
          <>
            {/* iron greave with a centre ridge */}
            <path d="M-9 4 L9 4 L8 32 L-8 32 Z" fill={color} stroke={DET} strokeWidth="2" strokeLinejoin="round" />
            <path d="M0 6 L0 30 M-8 12 L8 12 M-8 24 L8 24" {...det(1.2)} />
            {/* spiked anklet */}
            <path d="M-10 34 L10 34" stroke={RED} strokeWidth="3" strokeLinecap="round" />
            <path d="M-10 33 L-15 30 L-9 36 Z M10 33 L15 30 L9 36 Z" {...bone} />
          </>
        ) : (
          <>
            {/* wrapped shin bands */}
            <line x1="-6" y1="14" x2="6" y2="18" {...ink} strokeWidth="2.2" />
            <line x1="-6" y1="24" x2="6" y2="28" {...ink} strokeWidth="2.2" />
            {ninja && (
              <>
                <line x1="-6" y1="19" x2="6" y2="23" {...ink} strokeWidth="1.4" />
                <line x1="-6" y1="30" x2="6" y2="34" {...ink} strokeWidth="1.4" />
                {/* knee guard */}
                <rect x="-8.5" y="-6" width="17" height="11" rx="3.5" fill={color} {...ink} strokeWidth="2.2" />
                <line x1="-5" y1="-1" x2="5" y2="-1" {...ink} strokeWidth="1.2" />
              </>
            )}
          </>
        )}
        <g data-j={id === 'lB' ? 'fB' : 'fF'} transform="translate(0 42)">
          {oni ? (
            <>
              <path d="M-9 -4 L12 -1 L19 3 L16 5 L18 8 L-9 8 Z" fill={color} stroke={DET} strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M18 8 L23 8 L19 5 Z M15 8 L19 11 L13 8 Z" {...bone} />
            </>
          ) : (
            <>
              <path d="M-7 -3 L13 1 Q17 4 14 7 L-7 7 Z" fill={color} {...ink} />
              {/* tabi split toe */}
              {ninja && <line x1="9" y1="1.5" x2="9.5" y2="6.5" {...ink} strokeWidth="1.4" />}
            </>
          )}
        </g>
      </g>
    </g>
  );
}

function Kanabo({ color }) {
  // studded iron war club: wrapped grip, ring pommel, flaring octagonal head
  const studs = [];
  for (let y = 24; y <= 100; y += 12) {
    const e = 6 + (6 * (y - 8)) / 104;
    studs.push(
      <path key={`l${y}`} d={`M${-e} ${y - 3} L${-e - 5.5} ${y} L${-e} ${y + 3} Z`} {...bone} />,
      <path key={`r${y}`} d={`M${e} ${y - 3} L${e + 5.5} ${y} L${e} ${y + 3} Z`} {...bone} />,
      <circle key={`c${y}`} cx={(y / 12) % 2 ? -2.5 : 2.5} cy={y} r="2" fill={RED} />,
    );
  }
  return (
    <>
      <circle cx="0" cy="-27" r="4.5" fill="none" stroke={DET} strokeWidth="2.4" />
      <rect x="-3.5" y="-23" width="7" height="32" rx="2" fill={color} stroke={DET} strokeWidth="1.6" />
      {[-19, -13, -7, -1].map((y) => <line key={y} x1="-3.5" x2="3.5" y1={y} y2={y + 4} stroke={RED} strokeWidth="1.8" />)}
      <path d="M-6.5 8 L6.5 8 L12 110 Q0 118 -12 110 Z" fill={color} stroke={DET} strokeWidth="2" strokeLinejoin="round" />
      <path d="M-6.5 14 L6.5 14 M-11.5 104 L11.5 104" stroke={DET} strokeWidth="3" />
      <path d="M0 15 L0 102 M-4 15 L-7 102 M4 15 L7 102" {...det(0.9)} />
      {studs}
    </>
  );
}

function Arm({ id, color, front, variant }) {
  const oni = variant === 'oni';
  const ninja = variant === 'ninja';
  return (
    <g data-j={id}>
      {variant === 'samurai' && <path d="M-13 -6 L13 -8 L15 16 L-11 18 Z" fill={color} {...ink} />}
      <Limb len={30} w={oni ? 15 : 11} color={color} />
      {ninja && (
        <>
          {/* loose gi sleeve */}
          <path d="M-7 -5 L7 -5 L10 16 Q0 21 -10 16 Z" fill={color} {...ink} strokeWidth="2.6" />
          <path d="M-3 0 L-6 15 M3 0 L4 14" fill="none" {...ink} strokeWidth="1.1" />
          {front && (
            <g>
              {/* light shoulder guard, laced in red */}
              <path d="M-9 -8 L9 -8 L10 1 L-10 1 Z" fill={color} {...ink} strokeWidth="2.2" />
              {[-4, 4].map((x) => <line key={x} x1={x} x2={x} y1="-7" y2="0" stroke={RED} strokeWidth="1.3" />)}
            </g>
          )}
        </>
      )}
      {oni && (
        <g>
          {/* layered armour pauldron with a bone spike */}
          <path d="M-4 -15 L0 -31 L4 -15 Z" {...bone} />
          <path d="M-19 -9 Q0 -21 19 -9 L21 5 Q0 -4 -21 5 Z" fill={color} stroke={DET} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-21 5 Q0 -4 21 5 L20 17 Q0 8 -20 17 Z" fill={color} stroke={DET} strokeWidth="2" strokeLinejoin="round" />
          {[[-10, -2], [0, -6], [10, -2], [-10, 10], [0, 6], [10, 10]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.7" fill={RED} />)}
        </g>
      )}
      <g data-j={`${id}L`} transform="translate(0 30)">
        <Limb len={28} w={oni ? 13 : 9} color={color} />
        {ninja && (
          <>
            {/* bandaged forearm */}
            {[7, 12, 17, 22].map((y) => <line key={y} x1="-5" y1={y} x2="5" y2={y + 3} {...ink} strokeWidth={y % 2 ? 1.2 : 1.8} />)}
          </>
        )}
        {oni && (
          <>
            {/* spiked iron bracer */}
            <rect x="-9.5" y="5" width="19" height="17" rx="2" fill={color} stroke={DET} strokeWidth="2" />
            <path d="M-9.5 8 L-16 11 L-9.5 14 Z M-9.5 15 L-16 18 L-9.5 21 Z M9.5 8 L16 11 L9.5 14 Z M9.5 15 L16 18 L9.5 21 Z" {...bone} />
            <line x1="-9" y1="13.5" x2="9" y2="13.5" stroke={RED} strokeWidth="1.6" />
          </>
        )}
        <circle cx="0" cy="29" r={oni ? 8 : 6} fill={color} {...ink} strokeWidth="3" />
        {oni && <path d="M-6 34 L-5 41 L-2.5 35 Z M-1.5 36 L0 43 L1.5 36 Z M3 35 L5 41 L6 34 Z" {...bone} />}
        {ninja && <path d="M-3 27 L3 27" fill="none" {...ink} strokeWidth="1.2" />}
        {front && (
          <g data-j="sword" transform="translate(0 28)">
            <g data-j="blade" style={{ opacity: oni ? 1 : 0 }}>
              {oni ? (
                <Kanabo color={color} />
              ) : (
                <>
                  {/* released form: the blade burns with a red aura */}
                  <path data-j="aura" className="rig-aura" d="M-9 -2 Q-14 50 -4 116 Q0 128 4 116 Q14 50 9 -2 Z" fill={RED} style={{ opacity: 0 }} />
                  <rect x="-3.5" y="-25" width="7" height="23" rx="2" fill={BODY} {...ink} strokeWidth="2.6" />
                  {[-20, -13, -6].map((y) => <path key={y} d={`M-3 ${y} L3 ${y + 4} M3 ${y} L-3 ${y + 4}`} stroke={RED} strokeWidth="1.5" />)}
                  <circle cx="0" cy="-27" r="2.4" fill={RED} {...ink} strokeWidth="1.4" />
                  {/* tsuba: round guard with a cut-out */}
                  <ellipse cx="0" cy="-1" rx="10" ry="3.8" fill={RED} {...ink} strokeWidth="2.4" />
                  <ellipse cx="-5" cy="-1" rx="2" ry="1" fill={LINE} />
                  <rect x="-2.8" y="1.5" width="5.6" height="5" fill="var(--rig-steel, #f6f3ec)" {...ink} strokeWidth="1.6" />
                  <path d="M-2.8 6 L2.8 6 L3.2 96 Q0 110 -2.6 100 Z" fill="var(--rig-steel, #f6f3ec)" {...ink} strokeWidth="2.4" />
                  {/* hamon: the wavy temper line */}
                  <path d="M1.4 10 Q2.6 18 1.2 26 Q2.6 34 1.2 42 Q2.6 50 1.2 58 Q2.6 66 1.2 74 Q2.4 84 1.4 94" fill="none" stroke={LINE} strokeWidth="0.9" opacity="0.7" />
                </>
              )}
            </g>
          </g>
        )}
      </g>
    </g>
  );
}

function Head({ variant, color }) {
  if (variant === 'samurai') {
    return (
      <g data-j="head" transform="translate(0 -64)">
        <rect x="-5" y="-6" width="10" height="10" fill={color} {...ink} strokeWidth="2.6" />
        <path d="M-14 -16 Q-15 -28 2 -29 Q16 -28 15 -14 Q14 -2 2 -2 Q-12 -3 -14 -16 Z" fill={color} {...ink} />
        <path d="M4 -14 L17 -12 L13 -3 L2 -5 Z" fill={color} {...ink} strokeWidth="2.6" />
        <rect x="6" y="-19" width="9" height="3" rx="1.5" fill={RED} />
        <path d="M-16 -20 Q2 -46 20 -20 Z" fill={color} {...ink} />
        <path d="M-25 -18 L25 -21 L23 -15 L-23 -12 Z" fill={color} {...ink} />
        <path d="M-14 -16 Q-31 -6 -29 7 L-12 -2 Z" fill={color} {...ink} />
        <path d="M4 -34 Q-10 -60 -18 -64 Q0 -54 6 -38 Q14 -54 30 -60 Q18 -48 8 -33 Z" fill={RED} {...ink} strokeWidth="2.4" />
      </g>
    );
  }
  if (variant === 'oni') {
    return (
      <g data-j="head" transform="translate(0 -64)">
        <rect x="-7" y="-6" width="14" height="10" fill={color} />
        {/* wild mane streaming back */}
        <path fill={color} stroke={DET} strokeWidth="1.8" strokeLinejoin="round"
          d="M-2 -40 Q-30 -48 -52 -30 L-38 -28 L-58 -14 L-40 -14 L-54 2 L-34 -4 L-42 14 L-20 -2 L-14 -10 Z">
          <animate attributeName="d" dur="1.1s" repeatCount="indefinite"
            values="M-2 -40 Q-30 -48 -52 -30 L-38 -28 L-58 -14 L-40 -14 L-54 2 L-34 -4 L-42 14 L-20 -2 L-14 -10 Z;
                    M-2 -40 Q-32 -44 -55 -24 L-40 -24 L-60 -8 L-42 -10 L-52 8 L-34 0 L-38 18 L-20 0 L-14 -10 Z;
                    M-2 -40 Q-30 -48 -52 -30 L-38 -28 L-58 -14 L-40 -14 L-54 2 L-34 -4 L-42 14 L-20 -2 L-14 -10 Z" />
        </path>
        <path d="M-10 -36 L-40 -24 M-12 -26 L-44 -8 M-14 -16 L-36 6" {...det(1.2)} />
        {/* skull */}
        <path d="M-16 -14 Q-18 -38 2 -40 Q23 -38 21 -12 Q19 7 0 7 Q-15 5 -16 -14 Z" fill={color} {...ink} />
        {/* ringed bone horns */}
        <path d="M-8 -36 Q-26 -52 -18 -76 Q-6 -54 3 -38 Z" {...bone} strokeWidth="2" />
        <path d="M-12 -44 L-3 -41 M-15 -52 L-7 -49 M-17 -61 L-11 -58" stroke={INK} strokeWidth="1.3" />
        <path d="M10 -37 Q26 -54 19 -78 Q32 -56 21 -33 Z" {...bone} strokeWidth="2" />
        <path d="M13 -42 L22 -40 M16 -50 L25 -49 M18 -59 L26 -59" stroke={INK} strokeWidth="1.3" />
        {/* heavy brow, burning eye with a slit pupil */}
        <path d="M2 -27 L23 -25 L21 -20 L4 -21.5 Z" fill={color} stroke={DET} strokeWidth="1.6" />
        <path d="M6 -20.5 L20 -18.5 L18 -14 L6 -16 Z" fill={RED} className="rig-glow" />
        <path d="M13 -19.6 L13.4 -14.6" stroke="#ffd34d" strokeWidth="1.8" strokeLinecap="round" />
        {/* red war paint and creased snout */}
        <path d="M-6 -14 L8 -11 M-8 -8 L6 -5.5 M-4 -30 L4 -24" stroke={RED} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M20 -14 L23 -9 L20 -8" {...det(1.4)} />
        {/* open maw: fangs above, tusks below */}
        <path d="M5 -6 L22 -7 L20 3 L7 3 Z" fill="#1c0005" stroke={RED} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M8 -6.2 L9.6 -1.6 L11.2 -6.4 Z M14 -6.6 L15.6 -2 L17.2 -6.8 Z" {...bone} strokeWidth="0.9" />
        <path d="M7 3 L5 -6 L10 2.6 Z M19.5 3 L22.5 -8 L16.5 2.6 Z" {...bone} strokeWidth="1.1" />
        <path d="M-4 -10 Q-8 -6 -5 0" {...det(1.4)} />
      </g>
    );
  }
  // the wanderer: bare face with a sharp eye, long wind-torn hair, wide straw kasa and red chin cord
  return (
    <g data-j="head" transform="translate(0 -64)">
      <rect x="-5" y="-6" width="10" height="10" fill={color} {...ink} strokeWidth="2.6" />
      {/* long hair streaming behind */}
      <path fill="var(--rig-hair, #0d0d0f)" stroke={LINE} strokeWidth="2.4" strokeLinejoin="round"
        d="M-6 -30 C-26 -30 -40 -20 -58 -6 L-44 -10 L-56 6 L-38 -2 L-46 14 L-26 0 L-14 -6 Z">
        <animate attributeName="d" dur="1s" repeatCount="indefinite"
          values="M-6 -30 C-26 -30 -40 -20 -58 -6 L-44 -10 L-56 6 L-38 -2 L-46 14 L-26 0 L-14 -6 Z;
                  M-6 -30 C-28 -26 -42 -12 -60 0 L-46 -4 L-54 12 L-36 2 L-42 18 L-24 2 L-14 -6 Z;
                  M-6 -30 C-26 -30 -40 -20 -58 -6 L-44 -10 L-56 6 L-38 -2 L-46 14 L-26 0 L-14 -6 Z" />
      </path>
      {/* face (three-quarter, facing +x) */}
      <path d="M-12 -24 Q-14 -6 -4 2 Q4 6 12 0 Q18 -6 18 -16 L17 -26 Z" fill={color} {...ink} />
      {/* ear and jaw shadow */}
      <path d="M-3 -17 Q-8 -15 -6 -9 Q-4 -7 -2 -9" fill="none" {...ink} strokeWidth="1.6" />
      <path d="M-6 -2 Q2 3 8 1" fill="none" {...ink} strokeWidth="1" opacity="0.6" />
      {/* eye: heavy upper lid, dark iris, glint, lower lash */}
      <path d="M5 -17.5 Q10 -21 16 -18.5" fill="none" {...ink} strokeWidth="2.6" />
      <ellipse cx="11" cy="-15.6" rx="2.3" ry="2.8" fill="var(--rig-pupil, #0d0d0f)" />
      <circle cx="10.2" cy="-16.6" r="0.8" fill="#ffffff" />
      <path d="M7.5 -12.6 L13.5 -12.8" fill="none" {...ink} strokeWidth="0.9" />
      <path d="M4 -21.5 L16 -23" fill="none" {...ink} strokeWidth="2.4" />
      {/* battle scar across the cheek */}
      <path d="M14.5 -12.5 L9 -5 M13 -10 L11.6 -10.6 M11.6 -7.8 L10.2 -8.4" fill="none" stroke={RED} strokeWidth="1.3" strokeLinecap="round" />
      {/* nose + mouth + red chin cord */}
      <path d="M17.5 -12 L19.5 -8 L17 -7.5" fill="none" {...ink} strokeWidth="1.4" />
      <path d="M11 -3 L15 -3.6" fill="none" {...ink} strokeWidth="1.4" />
      <path d="M-8 -24 Q-6 -8 6 1" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" />
      {/* bangs falling from under the hat */}
      <path d="M-12 -26 L18 -27 L16 -18 L12 -24 L9 -14 L6 -23 L2 -16 L-1 -24 L-6 -15 L-8 -24 Z" fill="var(--rig-hair, #0d0d0f)" {...ink} strokeWidth="2" />
      {/* kasa: dark underside, woven top with rings, apex knob */}
      <ellipse cx="3" cy="-27" rx="34" ry="6" fill="#0d0d0f" stroke={LINE} strokeWidth="2.4" transform="rotate(-6 3 -27)" />
      <path d="M-31 -26 Q-6 -40 4 -50 Q16 -40 37 -31 Q4 -36 -31 -26 Z" fill={color} {...ink} strokeWidth="2.8" />
      <path d="M4 -50 L-18 -30 M4 -50 L-6 -33 M4 -50 L8 -34 M4 -50 L22 -33" fill="none" {...ink} strokeWidth="1.1" />
      <path d="M-20 -30.5 Q4 -41 27 -32.5 M-8 -37 Q5 -45 15 -38.5" fill="none" {...ink} strokeWidth="0.9" />
      <circle cx="4" cy="-50" r="2.6" fill={LINE} />
      {/* cord tails fluttering from the hat */}
      <path className="rig-tails" d="M-28 -26 C-40 -24 -48 -18 -60 -20 L-58 -16 C-46 -14 -38 -20 -27 -23 Z" fill={RED} {...ink} strokeWidth="1.8">
        <animate attributeName="d" dur="0.9s" repeatCount="indefinite"
          values="M-28 -26 C-40 -24 -48 -18 -60 -20 L-58 -16 C-46 -14 -38 -20 -27 -23 Z;
                  M-28 -26 C-40 -20 -50 -26 -62 -16 L-59 -12 C-48 -22 -38 -16 -27 -23 Z;
                  M-28 -26 C-40 -24 -48 -18 -60 -20 L-58 -16 C-46 -14 -38 -20 -27 -23 Z" />
      </path>
    </g>
  );
}

function Torso({ variant, color }) {
  if (variant === 'samurai') {
    return (
      <>
        <path d="M-16 0 L16 0 L34 72 L-34 72 Z" fill={color} {...ink} />
        <path d="M-12 2 L-20 70 M6 2 L14 70" fill="none" {...ink} strokeWidth="2" />
        <path d="M-15 4 L15 4 L21 -58 Q0 -70 -21 -58 Z" fill={color} {...ink} />
        {[-12, -24, -36, -48].map((y) => <line key={y} x1="-16" x2="17" y1={y} y2={y - 1} stroke={RED} strokeWidth="2" />)}
      </>
    );
  }
  if (variant === 'oni') {
    const beads = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      return [-19 + 38 * t, -58 + 17 * Math.sin(Math.PI * t)];
    });
    return (
      <>
        {/* tiger-skin kilt */}
        <path d="M-21 -6 L21 -6 L27 26 L15 21 L8 30 L0 22 L-8 30 L-15 21 L-27 26 Z" fill={TIGER} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M-16 1 L-12 12 M-6 -1 L-4 13 M6 -1 L4 12 M15 1 L12 13 M-21 13 L-17 20 M19 13 L23 20 M0 6 L1 16" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        {/* muscled chest */}
        <path d="M-18 4 L18 4 L26 -56 Q0 -74 -26 -56 Z" fill={color} {...ink} />
        <path d="M-17 -50 Q-5 -43 0 -47 Q6 -43 19 -50 M0 -47 L0 -14 M-13 -33 Q-5 -29 0 -31 Q6 -29 15 -33 M-11 -21 Q0 -17 13 -21 M-20 -40 Q-16 -30 -15 -18 M21 -40 Q17 -30 16 -18" {...det(1.8)} />
        {/* shimenawa rope belt with paper streamers */}
        <path d="M-21 -11 L21 -11 L21 -2 L-21 -2 Z" fill={ROPE} stroke={INK} strokeWidth="2" />
        {[-18, -12, -6, 0, 6, 12, 18].map((x) => <line key={x} x1={x - 2} y1="-11" x2={x + 3} y2="-2" stroke={INK} strokeWidth="1.2" />)}
        <path d="M-4 -2 L-6 6 L-2 6 L-4 14 L0 14 L-2 22 M6 -2 L4 6 L8 6 L6 14" fill="none" stroke="#f6f3ec" strokeWidth="2.2" strokeLinejoin="miter" />
        {/* prayer-bead necklace */}
        {beads.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 4 ? 4.8 : 3.4} fill={i === 4 ? RED : HORN} stroke={INK} strokeWidth="1.2" />)}
        <path d={`M${beads[4][0] - 2} ${beads[4][1] - 1} L${beads[4][0] + 2} ${beads[4][1] + 2}`} stroke={INK} strokeWidth="1" />
      </>
    );
  }
  return (
    <>
      {/* released form: a long tattered battle coat streaming behind */}
      <g data-j="cloak" style={{ opacity: 0 }}>
        <path className="rig-cloak" fill="var(--rig-cloak, #0d0d0f)" stroke={LINE} strokeWidth="3.6" strokeLinejoin="round"
          d="M-14 -62 L14 -62 L16 -20 L4 40 L-4 30 L-12 58 L-20 40 L-32 66 L-38 42 L-52 60 L-50 20 Z">
          <animate attributeName="d" dur="0.8s" repeatCount="indefinite"
            values="M-14 -62 L14 -62 L16 -20 L4 40 L-4 30 L-12 58 L-20 40 L-32 66 L-38 42 L-52 60 L-50 20 Z;
                    M-14 -62 L14 -62 L16 -20 L2 44 L-6 32 L-16 60 L-24 42 L-38 64 L-44 40 L-58 54 L-52 16 Z;
                    M-14 -62 L14 -62 L16 -20 L4 40 L-4 30 L-12 58 L-20 40 L-32 66 L-38 42 L-52 60 L-50 20 Z" />
        </path>
        <path d="M-12 -56 L-44 22 L-40 30 L-8 -50 Z" fill={RED} opacity="0.9" />
        <path d="M-20 -30 L-30 10 M-10 -20 L-16 30" fill="none" stroke="#f6f3ec" strokeWidth="1.2" opacity="0.5" />
      </g>
      {/* sheathed sword across the back, handle over the shoulder */}
      <g data-j="sheathed">
        <line x1="-22" y1="-2" x2="18" y2="-74" stroke={LINE} strokeWidth={6 + OL} strokeLinecap="round" />
        <line x1="-22" y1="-2" x2="18" y2="-74" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="-14" y1="-16" x2="-10" y2="-23" stroke={RED} strokeWidth="2" />
        <rect x="14" y="-90" width="5" height="18" rx="2" fill={RED} {...ink} strokeWidth="2.2" transform="rotate(29 16 -80)" />
      </g>
      <path d="M-12 3 L12 3 L16 -58 Q0 -68 -16 -58 Z" fill={color} {...ink} />
      {/* chain-mesh undershirt at the open collar */}
      <path d="M-4 -58 L6 -44 M0 -58 L8 -48 M-6 -54 L4 -40" fill="none" {...ink} strokeWidth="0.8" opacity="0.7" />
      <path d="M-18 -60 Q0 -70 18 -60 L22 -34 Q2 -24 -26 -30 Q-30 -46 -18 -60 Z" fill={color} {...ink} />
      <path d="M-14 -50 L-18 -32 M2 -56 L4 -30 M14 -54 L18 -36" fill="none" {...ink} strokeWidth="1.4" />
      <path d="M-24 -40 L-20 -32 M20 -48 L22 -40" fill="none" {...ink} strokeWidth="1" />
      <circle cx="4" cy="-58" r="3.4" fill={RED} {...ink} strokeWidth="1.6" />
      {/* crossed collar of the gi */}
      <path d="M-10 -60 L4 -30 M8 -61 L-2 -40" fill="none" {...ink} strokeWidth="2.2" />
      {/* gi folds below the mantle */}
      <path d="M-8 -24 L-10 -10 M6 -26 L8 -10" fill="none" {...ink} strokeWidth="1.2" />
      <path d="M-13 -9 L13 -9 L13 -1 L-13 -1 Z" fill={RED} {...ink} strokeWidth="2.6" />
      {/* obi knot and tails */}
      <path d="M-14 -7 Q-18 -5 -14 -2 Q-10 -5 -14 -7 Z" fill={RED} {...ink} strokeWidth="1.8" />
      <path d="M-12 -6 L-30 2 L-27 7 L-11 -2 Z" fill={RED} {...ink} strokeWidth="2.2" />
      <path d="M-13 -4 L-24 10 L-20 12 L-11 -1 Z" fill={RED} {...ink} strokeWidth="2" />
      {/* kunai pouch on the hip */}
      <rect x="5" y="-6" width="9" height="12" rx="2" fill={color} {...ink} strokeWidth="2" />
      <path d="M5 -2 L14 -2" fill="none" {...ink} strokeWidth="1.4" />
      <circle cx="9.5" cy="-9" r="2.2" fill="none" {...ink} strokeWidth="1.4" />
    </>
  );
}

/** <Rig variant="ninja|samurai|oni" /> renders a posable character; pose it later with applyPose(svg, P). */
export default function Rig({ variant = 'ninja', className = '', pose = POSES.stand, label }) {
  const color = BODY;
  const back = variant === 'ninja' ? BACK : BODY;
  return (
    <svg
      className={`rig rig--${variant} ${className}`}
      viewBox="-150 -200 300 300"
      ref={(el) => {
        if (el && !el.__posed) { el.__posed = true; applyPose(el, { ...BASE, ...pose }); }
      }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g data-j="root">
        <Leg id="lB" color={back} wide={variant !== 'ninja'} variant={variant} />
        <g data-j="torso">
          <Arm id="aB" color={back} variant={variant} />
          <Torso variant={variant} color={color} />
          <Head variant={variant} color={color} />
          <Arm id="aF" color={color} front variant={variant} />
        </g>
        <Leg id="lF" color={color} wide={variant !== 'ninja'} variant={variant} />
      </g>
    </svg>
  );
}
