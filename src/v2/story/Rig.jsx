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
const OL = 6; // outline thickness (svg units) for limbs

const ink = { stroke: LINE, strokeWidth: 3.6, strokeLinejoin: 'round', strokeLinecap: 'round' };

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
function Leg({ id, color, wide }) {
  return (
    <g data-j={id}>
      <Limb len={44} w={wide ? 22 : 16} color={color} />
      <g data-j={`${id}L`} transform="translate(0 44)">
        <Limb len={42} w={wide ? 15 : 12} color={color} />
        {/* wrapped shin bands */}
        <line x1="-6" y1="14" x2="6" y2="18" {...ink} strokeWidth="2.2" />
        <line x1="-6" y1="24" x2="6" y2="28" {...ink} strokeWidth="2.2" />
        <g data-j={id === 'lB' ? 'fB' : 'fF'} transform="translate(0 42)">
          <path d="M-7 -3 L13 1 Q17 4 14 7 L-7 7 Z" fill={color} {...ink} />
        </g>
      </g>
    </g>
  );
}

function Arm({ id, color, front, variant }) {
  const oni = variant === 'oni';
  return (
    <g data-j={id}>
      {variant === 'samurai' && <path d="M-13 -6 L13 -8 L15 16 L-11 18 Z" fill={color} {...ink} />}
      <Limb len={30} w={oni ? 15 : 11} color={color} />
      <g data-j={`${id}L`} transform="translate(0 30)">
        <Limb len={28} w={oni ? 13 : 9} color={color} />
        <circle cx="0" cy="29" r={oni ? 8 : 6} fill={color} {...ink} strokeWidth="3" />
        {front && (
          <g data-j="sword" transform="translate(0 28)">
            <g data-j="blade" style={{ opacity: oni ? 1 : 0 }}>
              {oni ? (
                <>
                  <path d="M-4 -14 L4 -14 L9 92 L-9 92 Z" fill={color} {...ink} />
                  {[20, 40, 60, 80].map((y) => <circle key={y} cx={y % 40 ? 6 : -6} cy={y} r="2.6" fill={RED} />)}
                </>
              ) : (
                <>
                  {/* released form: the blade burns with a red aura */}
                  <path data-j="aura" className="rig-aura" d="M-9 -2 Q-14 50 -4 116 Q0 128 4 116 Q14 50 9 -2 Z" fill={RED} style={{ opacity: 0 }} />
                  <rect x="-3.5" y="-25" width="7" height="23" rx="2" fill={BODY} {...ink} strokeWidth="2.6" />
                  {[-20, -13, -6].map((y) => <line key={y} x1="-3" x2="3" y1={y} y2={y + 4} stroke={RED} strokeWidth="1.6" />)}
                  <rect x="-9" y="-3.5" width="18" height="5" rx="2" fill={RED} {...ink} strokeWidth="2.4" />
                  <path d="M-2.8 1.5 L2.8 1.5 L3.2 96 Q0 110 -2.6 100 Z" fill="var(--rig-steel, #f6f3ec)" {...ink} strokeWidth="2.4" />
                  <line x1="0.6" y1="6" x2="1" y2="94" stroke={LINE} strokeWidth="0.9" opacity="0.6" />
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
        <rect x="-6" y="-6" width="12" height="10" fill={color} />
        <path d="M-15 -14 Q-16 -34 2 -36 Q20 -34 18 -12 Q16 4 0 4 Q-14 2 -15 -14 Z" fill={color} {...ink} />
        <path d="M-10 -30 Q-22 -48 -14 -62 Q-10 -46 -2 -34 Z" fill={color} {...ink} />
        <path d="M10 -32 Q20 -50 12 -64 Q22 -50 18 -30 Z" fill={color} {...ink} />
        <path d="M-18 -26 L-30 -38 L-22 -22 L-34 -24 L-18 -14 Z" fill={color} {...ink} />
        <path d="M4 -22 L15 -20 L13 -16 L4 -18 Z" fill={RED} className="rig-glow" />
        <path d="M2 -6 L16 -6 L14 -1 L4 -1 Z" fill={RED} opacity="0.85" />
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
      {/* eye: heavy upper lid, dark iris, glint */}
      <path d="M5 -17.5 Q10 -21 16 -18.5" fill="none" {...ink} strokeWidth="2.6" />
      <ellipse cx="11" cy="-15.6" rx="2.3" ry="2.8" fill="var(--rig-pupil, #0d0d0f)" />
      <circle cx="10.2" cy="-16.6" r="0.8" fill="#ffffff" />
      <path d="M4 -21.5 L16 -23" fill="none" {...ink} strokeWidth="2.4" />
      {/* nose + mouth + red chin cord */}
      <path d="M17.5 -12 L19.5 -8 L17 -7.5" fill="none" {...ink} strokeWidth="1.4" />
      <path d="M11 -3 L15 -3.6" fill="none" {...ink} strokeWidth="1.4" />
      <path d="M-8 -24 Q-6 -8 6 1" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" />
      {/* bangs falling from under the hat */}
      <path d="M-12 -26 L18 -27 L16 -18 L12 -24 L9 -14 L6 -23 L2 -16 L-1 -24 L-6 -15 L-8 -24 Z" fill="var(--rig-hair, #0d0d0f)" {...ink} strokeWidth="2" />
      {/* kasa: dark underside, woven top, apex knob */}
      <ellipse cx="3" cy="-27" rx="34" ry="6" fill="#0d0d0f" stroke={LINE} strokeWidth="2.4" transform="rotate(-6 3 -27)" />
      <path d="M-31 -26 Q-6 -40 4 -50 Q16 -40 37 -31 Q4 -36 -31 -26 Z" fill={color} {...ink} strokeWidth="2.8" />
      <path d="M4 -50 L-18 -30 M4 -50 L-6 -33 M4 -50 L8 -34 M4 -50 L22 -33" fill="none" {...ink} strokeWidth="1.1" />
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
    return <path d="M-16 4 L16 4 L24 -56 Q0 -72 -24 -56 Z" fill={color} {...ink} />;
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
      </g>
      {/* sheathed sword across the back, handle over the shoulder */}
      <g data-j="sheathed">
        <line x1="-22" y1="-2" x2="18" y2="-74" stroke={LINE} strokeWidth={6 + OL} strokeLinecap="round" />
        <line x1="-22" y1="-2" x2="18" y2="-74" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <rect x="14" y="-90" width="5" height="18" rx="2" fill={RED} {...ink} strokeWidth="2.2" transform="rotate(29 16 -80)" />
      </g>
      <path d="M-12 3 L12 3 L16 -58 Q0 -68 -16 -58 Z" fill={color} {...ink} />
      <path d="M-18 -60 Q0 -70 18 -60 L22 -34 Q2 -24 -26 -30 Q-30 -46 -18 -60 Z" fill={color} {...ink} />
      <path d="M-14 -50 L-18 -32 M2 -56 L4 -30 M14 -54 L18 -36" fill="none" {...ink} strokeWidth="1.4" />
      <circle cx="4" cy="-58" r="3.4" fill={RED} {...ink} strokeWidth="1.6" />
      {/* crossed collar of the gi */}
      <path d="M-10 -60 L4 -30 M8 -61 L-2 -40" fill="none" {...ink} strokeWidth="2.2" />
      <path d="M-13 -9 L13 -9 L13 -1 L-13 -1 Z" fill={RED} {...ink} strokeWidth="2.6" />
      <path d="M-12 -6 L-30 2 L-27 7 L-11 -2 Z" fill={RED} {...ink} strokeWidth="2.2" />
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
        <Leg id="lB" color={back} wide={variant !== 'ninja'} />
        <g data-j="torso">
          <Arm id="aB" color={back} variant={variant} />
          <Torso variant={variant} color={color} />
          <Head variant={variant} color={color} />
          <Arm id="aF" color={color} front variant={variant} />
        </g>
        <Leg id="lF" color={color} wide={variant !== 'ninja'} />
      </g>
    </svg>
  );
}
