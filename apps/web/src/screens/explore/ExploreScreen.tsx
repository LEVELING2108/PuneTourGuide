import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, usePalette } from '../../lib/palette';
import { useFlash } from '../../lib/useFlash';
import { useTheme } from '../../stores/theme';
import ExploreView from '../../views/classic/Explore.view';
import DeccanExploreView from '../../views/deccan/DeccanExplore.view';

const CLASSIC_CATS = ['All', 'Forts', 'Temples', 'Heritage', 'Food', 'Nature', 'Museums'];
const DECCAN_CATS = ['All', 'Forts', 'Temples', 'Wadas', 'Food lanes', 'Hills'];

const DEMO = [
  { name: 'Shaniwar Wada', mr: 'वाडा', cat: 'Heritage', dcat: 'Wadas', meta: 'Heritage · Kasba Peth · 2.1 km', dmeta: 'Kasba Peth · 2.1 km', help: 'Hospital 1.2 km', tone: '#1B2220', dtone: '#7A1F4E' },
  { name: 'Pataleshwar Cave Temple', mr: 'लेणी', cat: 'Temples', dcat: 'Temples', meta: 'Temple · Shivajinagar · 3.4 km', dmeta: 'Shivajinagar · 3.4 km', help: 'Hospital 1.6 km', tone: '#26303B', dtone: '#A4462B' },
  { name: 'Sinhagad Fort', mr: 'गड', cat: 'Forts', dcat: 'Forts', meta: 'Fort · trek · 28 km', dmeta: 'Sahyadri trek · 28 km', help: 'Weak signal · save offline first', warn: true, tone: '#4A3426', dtone: '#0E5B5E' },
  { name: 'Dagdusheth Ganpati', mr: 'मंदिर', cat: 'Temples', dcat: 'Temples', meta: 'Temple · Budhwar Peth · 2.3 km', dmeta: 'Budhwar Peth · 2.3 km', help: 'Hospital 0.9 km', tone: '#26303B', dtone: '#A4462B' },
  { name: 'Parvati Hill', mr: 'टेकडी', cat: 'Nature', dcat: 'Hills', meta: 'Hill · Parvati · 4.2 km', dmeta: 'Parvati · 4.2 km', help: 'Hospital 2 km', tone: '#0F4C42', dtone: '#0E5B5E' },
  { name: 'Rajgad Fort', mr: 'गड', cat: 'Forts', dcat: 'Forts', meta: 'Fort · trek · 55 km', dmeta: 'Sahyadri trek · 55 km', help: 'Weak signal · save offline first', warn: true, tone: '#4A3426', dtone: '#0E5B5E' },
];

export default function ExploreScreen() {
  const theme = useTheme();
  const p = usePalette();
  const deccan = theme === 'deccan';
  const [cat, setCat] = useState('All');
  const [slide, setSlide] = useState(0);
  const [added, setAdded] = useState<Record<string, boolean>>({ 'Shaniwar Wada': true });
  const toast = useFlash(2700);

  const chips = (deccan ? DECCAN_CATS : CLASSIC_CATS).map((label) => {
    const on = label === cat;
    const c = deccan
      ? { pressed: on ? 'true' : 'false', bg: on ? p.primary : p.surface, fg: on ? p.surface : p.ink, bd: on ? p.primary : p.chipBd }
      : chipColors(p, on);
    return { label, key: label, ...c, pick: () => setCat(label) };
  });

  const places = DEMO.filter((pl) => cat === 'All' || (deccan ? pl.dcat : pl.cat) === cat)
    .slice(0, 3)
    .map((pl) => {
      const isAdded = !!added[pl.name];
      return {
        ...pl,
        key: pl.name,
        meta: deccan ? pl.dmeta : pl.meta,
        tone: deccan ? pl.dtone : pl.tone,
        helpColor: pl.warn ? '#8A4A12' : p.muted,
        added: isAdded,
        notAdded: !isAdded,
        pressed: isAdded ? 'true' : 'false',
        addLabel: isAdded ? `Remove ${pl.name} from plan` : `Add ${pl.name} to plan`,
        addBg: isAdded ? p.primary : p.surface,
        addBd: isAdded ? p.primary : p.addBd,
        toggle: () => {
          setAdded({ ...added, [pl.name]: !isAdded });
          toast.flash(isAdded ? `${pl.name} removed from your plan` : `${pl.name} added to Saturday`);
        },
      };
    });

  const v = {
    chips,
    places,
    dots: [0, 1, 2].map((i) => ({ w: i === slide ? '20px' : '6px', bg: i === slide ? p.ink : p.slideDotOff })),
    empty: places.length === 0,
    showToast: toast.show,
    toastKey: toast.key,
    toastText: toast.text,
    heading: cat === 'All' ? (deccan ? 'Near you' : 'Nearby') : cat,
    onSlide: (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const first = el.firstElementChild as HTMLElement | null;
      const step = first ? first.offsetWidth + 12 : 300;
      const i = Math.max(0, Math.min(2, Math.round(el.scrollLeft / step)));
      if (i !== slide) setSlide(i);
    },
  };
  return <Themed classic={ExploreView} deccan={DeccanExploreView} v={v} />;
}
