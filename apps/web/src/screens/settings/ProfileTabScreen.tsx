import type { CSSProperties } from 'react';
import { useProfileSummary } from '../../features/profile';
import { useTheme } from '../../stores/theme';
import DeccanProfileView from '../../views/deccan/DeccanProfile.view';
import SettingsScreen from './SettingsScreen';

/** The five stamp designs from the passport mockup, used in turn. */
const BASE: CSSProperties = {
  height: '80px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  lineHeight: '1.1',
  padding: '0 4px',
  overflow: 'hidden',
};
const DESIGNS: CSSProperties[] = [
  { ['--r' as string]: '-10deg', borderRadius: '40px', border: '2px solid var(--primary)', color: 'var(--primary)' },
  { ['--r' as string]: '6deg', borderRadius: '8px', border: '2px solid #0E5B5E', outline: '1px solid #0E5B5E', outlineOffset: '-6px', color: '#0E5B5E' },
  { ['--r' as string]: '-4deg', borderRadius: '40px', border: '2px dashed #A4462B', color: '#A4462B' },
  { ['--r' as string]: '8deg', borderRadius: '40px', border: '2px solid #A4462B', color: '#A4462B' },
  { ['--r' as string]: '-7deg', borderRadius: '8px', border: '2px solid var(--primary)', color: 'var(--primary)' },
];
const small: CSSProperties = { fontSize: '9px', letterSpacing: '0.14em', fontWeight: 700 };
const display: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '13.5px' };
const marathi: CSSProperties = { fontFamily: 'var(--font-accent)', fontSize: '14.5px' };

/** Short label for a stamp: "Shaniwar Wada" stays, "Pataleshwar Cave Temple" → "Pataleshwar". */
const short = (name: string) => name.replace(/\s+(Cave Temple|Temple|Fort|Palace|Museum|Garden|Hill|Lake|Dam|Restaurant|food lane)$/i, '');

/** Profile tab: Deccan shows the travel passport; Classic shows the settings list. */
export default function ProfileTabScreen() {
  const theme = useTheme();
  const s = useProfileSummary();
  if (theme !== 'deccan') return <SettingsScreen />;

  const stamps = (s.stamps?.stamps ?? []).slice(0, 8).map((st, i) => {
    const d = i % DESIGNS.length;
    const label = short(st.name);
    const sub = (st.kind ?? st.category).toUpperCase();
    const lines =
      d === 0
        ? [{ text: 'PUNE', style: small }, { text: label, style: display }]
        : d === 1 && st.nameMr
          ? [{ text: short(st.nameMr), style: marathi }, { text: label.toUpperCase(), style: small }]
          : d === 2
            ? [{ text: label, style: display }, { text: st.estYear ?? sub, style: small }]
            : d === 3 && st.nameMr
              ? [{ text: short(st.nameMr), style: marathi }, { text: sub, style: small }]
              : [{ text: label, style: display }, { text: sub, style: small }];
    return { key: st.placeId, cls: `s${(i % 5) + 1}`, title: `${st.name} · ${new Date(st.collectedAt).toLocaleDateString('en-IN')}`, style: { ...BASE, ...DESIGNS[d] }, lines };
  });

  const v = {
    name: s.name,
    initials: s.initials,
    avatarUrl: s.avatarUrl,
    levelLine: `Level ${s.level} · ${s.levelName}`,
    xp: s.xp.toLocaleString('en-IN'),
    levelPct: s.levelPct,
    toNextText: s.toNextText,
    editHref: s.loggedIn ? '/settings/profile' : '/login?next=%2Fprofile',
    editText: s.loggedIn ? 'Edit' : 'Log in',
    stampCount: s.stamps ? `${s.stamps.collected} of ${s.stamps.total}` : '',
    stamps,
    nextText: stamps.length ? 'Next stamp' : 'First stamp',
    visitedHref: s.loggedIn ? '/profile/visited' : '/login?next=%2Fprofile%2Fvisited',
  };
  return <DeccanProfileView v={v} />;
}
