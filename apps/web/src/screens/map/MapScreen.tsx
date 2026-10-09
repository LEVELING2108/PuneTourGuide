import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, usePalette } from '../../lib/palette';
import MapView from '../../views/classic/Map.view';
import DeccanMapView from '../../views/deccan/DeccanMap.view';

type Mode = 'places' | 'route';
type Sheet = Mode | 'help';

export default function MapScreen() {
  const p = usePalette();
  const [mode, setMode] = useState<Mode>('places');
  const [help, setHelp] = useState(true);
  const [sheet, setSheet] = useState<Sheet>('help');

  const pc = chipColors(p, mode === 'places');
  const rc = chipColors(p, mode === 'route');
  const hc = chipColors(p, help);

  const v = {
    showPlaces: mode === 'places',
    showRoute: mode === 'route',
    help,
    sheetPlaces: sheet === 'places',
    sheetRoute: sheet === 'route',
    sheetHelp: sheet === 'help',
    placesBg: pc.bg, placesFg: pc.fg, placesBd: pc.bd, placesPressed: pc.pressed,
    routeBg: rc.bg, routeFg: rc.fg, routeBd: rc.bd, routePressed: rc.pressed,
    helpBg: hc.bg, helpFg: hc.fg, helpBd: hc.bd, helpPressed: hc.pressed,
    pickPlaces: () => {
      setMode('places');
      setSheet('places');
    },
    pickRoute: () => {
      setMode('route');
      setSheet('route');
    },
    toggleHelp: () => {
      if (help) {
        setHelp(false);
        setSheet(sheet === 'help' ? mode : sheet);
      } else {
        setHelp(true);
        setSheet('help');
      }
    },
  };
  return <Themed classic={MapView} deccan={DeccanMapView} v={v} />;
}
