import { useId } from 'react';
import { rand } from './world';

// "The Wandering Engineer": original hand-drawn ink key art (vector), manga style.
// Kasa straw hat, long wind-torn hair, wrapped travelling cloak, sheathed katana, rain.
// `view` crops the same drawing for close-up panels.

const INK = '#0d0d0f';
const PAPER = '#fbf8f1';
const RED = '#e3122c';

const VIEWS = {
  full: '0 0 600 800',
  eyes: '248 284 104 52',
  face: '226 250 150 150',
  hand: '372 500 110 150',
  hat: '60 100 480 200',
};

const line = (w = 2.4) => ({ stroke: INK, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' });

function Rain({ seed, count, color, opacity, width }) {
  const r = rand(seed);
  return (
    <g stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const x = r() * 640 - 20, y = r() * 820 - 20, l = 24 + r() * 70;
        return <line key={i} x1={x} y1={y} x2={x - l * 0.12} y2={y + l} />;
      })}
    </g>
  );
}

export default function Wanderer({ view = 'full', className = '', rain = true }) {
  const uid = useId().replace(/:/g, '');
  const id = (n) => `${n}-${uid}`;
  const url = (n) => `url(#${id(n)})`;

  // straw ribs of the hat, from the apex to the far rim
  const ribs = Array.from({ length: 23 }, (_, i) => {
    const t = Math.PI + (i / 22) * Math.PI;
    return [300 + 228 * Math.cos(t), 255 + 34 * Math.sin(t)];
  });

  return (
    <svg className={`wanderer ${className}`} viewBox={VIEWS[view] || VIEWS.full} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ink illustration of a wandering swordsman in a straw hat and cloak, standing in the rain">
      <defs>
        <pattern id={id('hatch')} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={INK} strokeWidth="1.3" />
        </pattern>
        <pattern id={id('cross')} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={INK} strokeWidth="1.5" />
          <line x1="0" y1="0" x2="5" y2="0" stroke={INK} strokeWidth="1.5" />
        </pattern>
        <pattern id={id('tone')} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill={INK} />
        </pattern>
        <pattern id={id('wrap')} width="14" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 0 L7 6 L0 12 M14 0 L7 6 L14 12" stroke={INK} strokeWidth="2" fill="none" />
        </pattern>
        <clipPath id={id('face')}>
          <path d="M256 286 C254 320 262 352 291 383 C310 375 334 352 344 318 L346 286 Z" />
        </clipPath>
      </defs>

      {/* paper + sky */}
      <rect x="-50" y="-50" width="700" height="900" fill={PAPER} />
      <rect x="-50" y="-50" width="700" height="900" fill={url('tone')} opacity="0.18" />
      <g fill="none" strokeLinecap="round" opacity="0.13" stroke={INK}>
        <path d="M-40 60 C120 20 260 70 420 30" strokeWidth="46" strokeDasharray="60 6 120 4 30 8" />
        <path d="M200 -10 C330 40 480 10 660 70" strokeWidth="34" strokeDasharray="90 5 40 7" />
        <path d="M-30 520 C40 470 70 380 60 300" strokeWidth="40" strokeDasharray="70 6 50 4" />
        <path d="M640 640 C560 560 540 460 580 380" strokeWidth="44" strokeDasharray="80 5 30 6" />
      </g>
      <g fill="none" strokeLinecap="round" opacity="0.28" stroke={INK} strokeWidth="2">
        <path d="M-20 92 C120 54 260 98 420 62" /><path d="M210 30 C330 70 480 44 640 98" />
        <path d="M20 540 C70 480 92 400 84 320" /><path d="M600 640 C548 566 532 470 566 392" />
      </g>
      {rain && <Rain seed={5} count={110} color={INK} opacity={0.35} width={1.1} />}

      {/* ---------- back hair mass ---------- */}
      <path d="M244 300 C214 360 204 440 214 520 L226 488 L230 540 L246 470 L252 512 L258 430 C252 380 254 340 262 300 Z" fill={INK} />
      <path d="M342 296 C368 352 380 430 374 512 L362 482 L360 530 L346 466 L340 500 L336 420 C340 372 338 334 332 300 Z" fill={INK} />
      <path d="M222 360 C216 410 218 460 224 500 M370 360 C376 410 374 452 368 492" stroke={PAPER} strokeWidth="1.4" fill="none" opacity="0.7" />

      {/* ---------- cloak ---------- */}
      <path
        d="M248 405 C200 420 160 470 140 560 C125 640 118 720 110 800 L140 782 L160 800 L190 774 L215 800 L250 784 L280 800 L320 780 L350 800 L390 786 L420 800 L455 776 L500 800 C492 720 480 640 462 560 C445 470 400 420 352 405 Z"
        {...line(3.4)} fill={PAPER}
      />
      {/* shadow side of the cloak (light from the right) */}
      <path d="M140 560 C125 640 118 720 110 800 L140 782 L160 800 L176 786 C176 700 186 610 210 520 C220 480 232 450 248 430 C206 444 160 490 140 560 Z" fill={url('hatch')} />
      <path d="M126 700 C122 740 118 770 114 796 L140 782 L150 790 C150 760 154 730 160 700 Z" fill={url('cross')} />
      {/* inner robe between the cloak flaps */}
      <path d="M296 480 C285 560 270 680 262 800 L350 800 C336 680 318 560 306 480 Z" fill={INK} />
      <path d="M287 590 L318 586 L322 640 L283 646 Z" {...line(2.2)} fill={PAPER} />
      <path d="M286 602 L320 598 M285 616 L321 612 M284 630 L322 627" {...line(1.4)} />
      <path d="M300 646 L292 700 L304 694 L310 704 L314 646" {...line(2)} fill={PAPER} />
      {/* cloak folds */}
      <path d="M230 468 C212 560 192 660 182 790" {...line(2)} />
      <path d="M256 498 C242 600 230 700 224 792" {...line(1.6)} />
      <path d="M372 468 C396 560 410 660 426 790" {...line(2)} />
      <path d="M346 500 C362 600 380 700 392 790" {...line(1.6)} />
      <path d="M200 520 C206 560 204 600 198 640 M412 560 C418 600 418 640 414 680" {...line(1.2)} />
      <path d="M296 480 C285 560 270 680 262 800 M306 480 C318 560 336 680 350 800" {...line(2.8)} />
      {/* rain soaking the hem */}
      <path d="M150 760 l2 18 M232 770 l1 16 M330 768 l1 14 M440 760 l2 18" {...line(1.4)} />

      {/* knot at the chest */}
      <path d="M290 470 L268 548 L286 538 L296 476 Z" {...line(2.4)} fill={PAPER} />
      <path d="M310 470 L334 552 L316 542 L304 476 Z" {...line(2.4)} fill={PAPER} />
      <path d="M274 540 L282 520 M326 544 L318 522" {...line(1.2)} />
      <ellipse cx="300" cy="462" rx="22" ry="16" {...line(2.8)} fill={PAPER} />
      <path d="M284 456 Q300 448 316 458 M286 468 Q300 474 314 466" {...line(1.6)} />

      {/* high wrapped collar */}
      <path d="M250 400 Q300 438 352 400 Q364 420 354 434 Q300 472 246 434 Q238 420 250 400 Z" {...line(3)} fill={PAPER} />
      <path d="M256 414 Q300 446 346 414 M262 426 Q300 452 340 426" {...line(1.5)} />
      <path d="M246 434 Q240 420 250 400 L262 412 Q256 424 258 436 Z" fill={url('hatch')} />

      {/* ---------- neck + face ---------- */}
      <path d="M278 370 L276 410 Q298 420 320 406 L318 366 Z" {...line(2.4)} fill={PAPER} />
      <path d="M278 378 Q298 394 318 372 L320 402 Q300 414 278 406 Z" fill={url('hatch')} />
      <path d="M256 286 C254 320 262 352 291 383 C310 375 334 352 344 318 L346 286 Z" fill={PAPER} />
      {/* hat shadow across the upper face + far-cheek shading */}
      <g clipPath={url('face')}>
        <path d="M240 280 L360 280 L360 300 Q330 296 300 302 Q270 298 240 306 Z" fill={url('cross')} opacity="0.55" />
        <path d="M240 280 L360 280 L360 307 Q300 300 240 310 Z" fill={url('tone')} opacity="0.75" />
        <path d="M332 320 C330 344 318 362 300 378 L346 378 L346 316 Z" fill={url('hatch')} opacity="0.85" />
      </g>
      <path d="M256 290 C254 320 262 352 291 383 C310 375 334 352 344 318 L346 290" {...line(3)} />
      <clipPath id={id('eyeN')}><path d="M263 314 Q272 305 284 305 Q293 306 297 312 Q284 321 268 319 Z" /></clipPath>
      <clipPath id={id('eyeF')}><path d="M307 311 Q316 303 327 303 Q335 305 339 309 Q326 318 311 316 Z" /></clipPath>
      {/* brows: tapered, angled down toward the nose */}
      <path d="M262 300 Q278 292 294 303 Q279 297 263 303 Z" fill={INK} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M308 304 Q322 291 341 296 Q323 296 309 307 Z" fill={INK} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      {/* near eye */}
      <path d="M263 314 Q272 305 284 305 Q293 306 297 312 Q284 321 268 319 Z" fill={PAPER} />
      <g clipPath={url('eyeN')}>
        <ellipse cx="283" cy="312.5" rx="5.4" ry="6.6" fill={INK} />
        <ellipse cx="283.4" cy="313.4" rx="2.8" ry="3.6" fill="#45454c" />
        <rect x="260" y="303" width="40" height="5" fill={url('tone')} />
      </g>
      <circle cx="281" cy="310" r="1.6" fill={PAPER} />
      <path d="M262 314 Q272 304 284 304 Q293 305 298 312" {...line(3.6)} />
      <path d="M262 314 L255 312 M263 312 L258 307" {...line(1.8)} />
      <path d="M269 319.5 Q282 322 292 317" {...line(1.1)} />
      {/* far eye */}
      <path d="M307 311 Q316 303 327 303 Q335 305 339 309 Q326 318 311 316 Z" fill={PAPER} />
      <g clipPath={url('eyeF')}>
        <ellipse cx="324" cy="310" rx="4.8" ry="6.2" fill={INK} />
        <ellipse cx="324.3" cy="311" rx="2.5" ry="3.3" fill="#45454c" />
        <rect x="304" y="300" width="40" height="5" fill={url('tone')} />
      </g>
      <circle cx="322.4" cy="307.6" r="1.4" fill={PAPER} />
      <path d="M306 311 Q316 302 327 302 Q336 304 340 309" {...line(3.4)} />
      <path d="M340 309 L346 305" {...line(1.8)} />
      <path d="M312 316.5 Q324 319 334 314" {...line(1.1)} />
      {/* under-eye shadow lines */}
      <path d="M270 324 L276 325 M313 321 L319 322" {...line(0.9)} opacity="0.7" />
      {/* nose, mouth, jaw shadow */}
      <path d="M302 324 Q299 336 296 342 Q300 345 305 342" {...line(1.8)} />
      <path d="M290 359 Q298 361 306 357" {...line(2.2)} />
      <path d="M295 366 L301 366" {...line(1.1)} />
      <path d="M262 340 L268 346 M264 334 L270 340" {...line(1)} />
      {/* scar on the cheek: a story detail */}
      <path d="M327 340 L336 333 M330 344 L338 338" stroke={RED} strokeWidth="1.6" strokeLinecap="round" />

      {/* ---------- front hair: side locks + bangs ---------- */}
      <path d="M258 270 C240 320 236 380 244 440 L250 410 L254 456 L262 396 L266 418 C262 360 262 310 272 276 Z" fill={INK} />
      <path d="M344 268 C362 318 366 376 358 436 L352 408 L348 450 L342 392 L338 412 C342 356 340 308 330 274 Z" fill={INK} />
      <path d="M250 330 C246 370 248 400 252 428 M352 330 C356 370 354 398 350 424" stroke={PAPER} strokeWidth="1.3" fill="none" opacity="0.8" />
      <path d="M258 262 L266 300 L272 280 L280 306 L286 280 L292 318 L300 282 L306 296 L314 276 L318 300 L326 278 L334 298 L340 280 L348 296 L348 262 Z" fill={INK} />
      {/* loose strands across the face */}
      <path d="M292 300 Q286 336 270 376 L274 377 Q292 338 297 300 Z" fill={INK} />
      <path d="M306 296 Q312 326 318 352 L321 351 Q316 324 310 296 Z" fill={INK} />
      <path d="M276 292 Q262 320 258 352 L261 352 Q266 322 280 293 Z" fill={INK} />
      {/* wind-blown locks streaming out to the left */}
      <path d="M252 300 C226 330 190 356 140 352 L176 344 C150 360 120 362 96 352 C140 340 196 316 244 290 Z" fill={INK} />
      <path d="M248 330 C220 372 186 396 150 404 L176 392 C160 410 140 418 118 420 C160 402 200 372 240 326 Z" fill={INK} />
      <path d="M240 312 C210 336 170 350 130 352" stroke={PAPER} strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d="M272 268 L276 292 M300 268 L299 306 M322 268 L326 294" stroke={PAPER} strokeWidth="1.2" opacity="0.75" />

      {/* ---------- hat: dark underside then the woven top ---------- */}
      <ellipse cx="300" cy="258" rx="228" ry="38" fill={INK} />
      <path d="M96 264 Q300 300 504 264" stroke="#2c2c32" strokeWidth="6" fill="none" />
      <path d="M72 255 Q170 186 300 118 Q430 186 528 255 A228 34 0 0 0 72 255 Z" {...line(3.4)} fill={PAPER} />
      {ribs.map(([x, y], i) => (
        <path key={i} d={`M300 120 Q${(300 + x) / 2 + (x - 300) * 0.06} ${(120 + y) / 2 - 6} ${x} ${y}`} {...line(i % 4 === 0 ? 1.6 : 0.9)} opacity={i % 4 === 0 ? 0.9 : 0.55} />
      ))}
      <path d="M150 214 Q300 176 450 214 M110 238 Q300 200 490 238" {...line(1.3)} opacity="0.7" />
      <path d="M72 255 Q170 186 300 118 L260 140 Q170 190 110 238 Z" fill={url('hatch')} opacity="0.7" />
      <path d="M72 255 A228 38 0 0 0 528 255" stroke={PAPER} strokeWidth="2" fill="none" />
      <circle cx="300" cy="120" r="7" fill={INK} />
      {/* red chin cord: the one colour on him */}
      <path d="M252 286 C254 330 270 370 296 392 M348 286 C346 330 330 370 304 392" stroke={RED} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="300" cy="393" r="3.6" fill={RED} stroke={INK} strokeWidth="1.2" />

      {/* ---------- sheathed katana ---------- */}
      <path d="M440 150 Q446 142 452 150 L437 526 L425 526 Z" {...line(2)} fill={INK} />
      <path d="M445 166 L434 510" stroke={PAPER} strokeWidth="1.4" opacity="0.6" />
      <path d="M428 466 L442 470 L441 482 L427 478 Z M427 488 L441 492" fill={RED} stroke={INK} strokeWidth="1.4" />
      <path d="M434 486 C450 520 452 560 470 600 C476 612 468 630 474 650" stroke={RED} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="431" cy="530" rx="19" ry="5.5" fill={INK} />
      <ellipse cx="431" cy="528.5" rx="17" ry="3.6" fill="none" stroke={PAPER} strokeWidth="1" opacity="0.6" />
      <path d="M424 534 L438 534 L434 642 L420 642 Z" fill={url('wrap')} stroke={INK} strokeWidth="2.4" />
      <path d="M419 642 L435 642 L434 652 Q427 656 420 652 Z" fill={INK} />

      {/* ---------- hand gripping the hilt ---------- */}
      <path d="M398 556 C392 590 394 612 404 622 L396 642 C384 630 380 600 386 560 Z" fill={PAPER} {...line(2.4)} />
      <path d="M388 572 C386 594 390 612 398 624" fill={url('hatch')} />
      {[[562, 46, 14], [575.5, 44, 13.5], [589, 41, 13], [602, 36, 12]].map(([y, w, h], i) => (
        <g key={y}>
          <path d={`M${400 + i} ${y + h} L${400 + i} ${y + 3} Q${400 + i} ${y} ${404 + i} ${y} L${400 + w - 7} ${y} Q${400 + w} ${y + h / 2} ${400 + w - 7} ${y + h} Z`} {...line(2.3)} fill={PAPER} />
          <path d={`M${414 + i} ${y + 3} Q${417 + i} ${y + h / 2} ${414 + i} ${y + h - 3}`} {...line(1.1)} />
          <path d={`M${400 + w - 12} ${y + 4} Q${400 + w - 9} ${y + h / 2} ${400 + w - 12} ${y + h - 4}`} {...line(0.9)} />
        </g>
      ))}
      <path d="M400 560 C408 546 428 544 446 552 C450 558 446 564 436 563 C424 561 414 565 404 572 Z" {...line(2.4)} fill={PAPER} />
      <path d="M430 553 Q438 552 444 556" {...line(1.1)} />
      <path d="M403 576 L398 600 L402 616" {...line(1.3)} />

      {/* foreground rain + splatter */}
      {rain && <Rain seed={21} count={60} color={INK} opacity={0.55} width={1.4} />}
      {rain && <Rain seed={33} count={40} color={PAPER} opacity={0.75} width={1.3} />}
      <g fill={INK}>
        {[[96, 520, 3], [108, 540, 1.6], [520, 610, 2.6], [540, 600, 1.4], [470, 300, 1.8], [150, 330, 2.2]].map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />)}
      </g>
    </svg>
  );
}
