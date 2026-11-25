import { useId } from 'react';
import { DeccanOnly } from '../../components/Themed';
import type { Sky } from './sky';

// Shades of the theme's own colour; gold for the sun, moon and bhagwa. No other colours.
const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
const P = 'var(--primary)';
const GOLD = 'var(--gold)';
const CITY = mix(P, 34, 'black');
const FAR = mix(P, 70, 'black');
const SKY: Record<Sky, { top: string; bottom: string }> = {
  dawn: { top: mix(P, 94, 'white'), bottom: mix(P, 70, 'white') },
  day: { top: P, bottom: mix(P, 78, 'white') },
  dusk: { top: mix(P, 62, 'black'), bottom: mix(P, 88, GOLD) },
  night: { top: mix(P, 26, 'black'), bottom: mix(P, 62, 'black') },
  rain: { top: mix(P, 55, 'black'), bottom: mix(P, 72, 'var(--muted)') },
};

const STARS = Array.from({ length: 16 }, (_, i) => ({ x: ((i * 67) % 330) + 8, y: ((i * 31) % 84) + 6, r: i % 3 ? 0.9 : 1.5, o: 0.4 + (i % 4) * 0.14 }));
const DROPS = Array.from({ length: 30 }, (_, i) => `M${((i * 53) % 340) + 6} ${((i * 37) % 120) + 44}l-4 11`).join('');
const CLOUD = 'M0 22a11 11 0 0 1 4-21 15 15 0 0 1 28-2 12 12 0 0 1 12 23z';

/** Pune's skyline with Shaniwar Wada's Delhi Darwaza (as on the app icon), under the current sky. */
export function HomeSky({ sky }: { sky: Sky }) {
  const id = useId();
  const low = sky === 'dawn' || sky === 'dusk';
  return (
    <div aria-hidden="true" data-sky={sky} style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 342 178" preserveAspectRatio="xMaxYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: SKY[sky].top }} />
            <stop offset="1" style={{ stopColor: SKY[sky].bottom }} />
          </linearGradient>
          <mask id={`${id}m`}>
            <rect width="342" height="178" fill="white" />
            <circle cx="322" cy="38" r="17" fill="black" />
          </mask>
        </defs>
        <rect width="342" height="178" fill={`url(#${id}s)`} />
        {sky === 'night' && (
          <>
            {STARS.map((s) => (
              <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
            ))}
            <circle cx="314" cy="46" r="18" mask={`url(#${id}m)`} style={{ fill: GOLD }} />
          </>
        )}
        {sky === 'rain' && (
          <>
            <path d={CLOUD} transform="translate(168 22)" fill="white" opacity="0.22" />
            <path d={CLOUD} transform="translate(276 16) scale(1.3)" fill="white" opacity="0.22" />
            <path d={DROPS} stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
          </>
        )}
        {sky !== 'night' && sky !== 'rain' && <circle cx="312" cy={low ? 96 : 46} r="22" style={{ fill: GOLD }} />}
        <path d="M0 140L48 118L84 130L132 104L188 132L240 112L342 130V178H0Z" opacity="0.75" style={{ fill: FAR }} />
        <g style={{ fill: CITY }}>
          <path d="M0 178V158H26V148H36V158H70V150A12 12 0 0 1 94 150V158H140V152H152V158H208V178ZM300 178V162H342V178Z" />
          <g transform="translate(206 70)">
            <path d="M0 108L3 52H35L37 108ZM75 108L77 52H109L112 108Z" />
            {[4, 13, 22, 31, 78, 87, 96, 105].map((x) => (
              <path key={x} d={`M${x - 2} 53v-5a3 3 0 0 1 6 0v5z`} />
            ))}
            <path d="M38 108V34H74V108ZM35 30H77V35H35ZM43 17H69V31H43ZM40 13H72V17H40ZM55 -14H57V14H55Z" />
          </g>
        </g>
        <g transform="translate(206 70)" style={{ fill: GOLD }}>
          <path d="M57 -13L84 -7L72 -2L84 3L57 9Z" />
          <path d="M47 108V66Q47 54 56 47Q65 54 65 66V108Z" opacity="0.55" />
          {[47, 54, 61].map((x) => (
            <rect key={x} x={x} y="21" width="4" height="8" rx="2" />
          ))}
        </g>
      </svg>
      <DeccanOnly>
        <svg width="100%" height="12" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <pattern id={`${id}z`} width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="var(--gold)" />
              <path d="M0 12 L6 3 L12 12 Z" fill="var(--primary)" />
            </pattern>
          </defs>
          <rect width="100%" height="12" fill={`url(#${id}z)`} />
        </svg>
      </DeccanOnly>
    </div>
  );
}
