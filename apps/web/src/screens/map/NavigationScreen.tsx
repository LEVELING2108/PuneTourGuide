import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, usePalette } from '../../lib/palette';
import NavigationView from '../../views/classic/Navigation.view';
import DeccanNavigationView from '../../views/deccan/DeccanNavigation.view';

export default function NavigationScreen() {
  const p = usePalette();
  const [mode, setMode] = useState<'Walk' | 'Auto'>('Walk');
  const walk = mode === 'Walk';

  const v = {
    modes: (['Walk', 'Auto'] as const).map((label) => ({ label, key: label, ...chipColors(p, label === mode), pick: () => setMode(label) })),
    eta: walk ? '8 min' : '4 min',
    meta: walk ? '650 m · arrive 11:22 · Dagdusheth Ganpati' : '1.1 km by road · arrive 11:18 · Dagdusheth Ganpati',
    nextDist: walk ? '200 m' : '350 m',
  };
  return <Themed classic={NavigationView} deccan={DeccanNavigationView} v={v} />;
}
