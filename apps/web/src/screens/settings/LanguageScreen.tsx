import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, toggleColors, usePalette } from '../../lib/palette';
import { useSettingsStore } from '../../stores/settings';
import LanguageView from '../../views/classic/Language.view';
import DeccanLanguageView from '../../views/deccan/DeccanLanguage.view';

const PRIMARY = [
  { id: 'en', native: 'English', english: 'Default', preview: 'Where to, today?' },
  { id: 'mr', native: 'मराठी', english: 'Marathi', preview: 'आज कुठे जायचं?' },
  { id: 'hi', native: 'हिन्दी', english: 'Hindi', preview: 'आज कहाँ चलें?' },
  { id: 'gu', native: 'ગુજરાતી', english: 'Gujarati', preview: 'આજે ક્યાં જવું છે?' },
];

/** Other Indian languages from RoadSoS (ISO code → English name). */
const MORE_LANGUAGES: [string, string][] = [
  ['as', 'Assamese'], ['bn', 'Bengali'], ['brx', 'Bodo'], ['doi', 'Dogri'], ['kn', 'Kannada'], ['ks', 'Kashmiri'],
  ['kok', 'Konkani'], ['mai', 'Maithili'], ['ml', 'Malayalam'], ['mni', 'Manipuri'], ['ne', 'Nepali'], ['or', 'Odia'],
  ['pa', 'Punjabi'], ['sa', 'Sanskrit'], ['sat', 'Santali'], ['sd', 'Sindhi'], ['ta', 'Tamil'], ['te', 'Telugu'], ['ur', 'Urdu'],
];

export default function LanguageScreen() {
  const p = usePalette();
  const { language, matchState, set } = useSettingsStore();
  const [expanded, setExpanded] = useState(false);

  const all: [string, string][] = [['en', 'English'], ['mr', 'Marathi'], ['hi', 'Hindi'], ['gu', 'Gujarati'], ...MORE_LANGUAGES];
  const moreName = Object.fromEntries(MORE_LANGUAGES)[language];
  const cur = PRIMARY.find((l) => l.id === language) ?? {
    id: language,
    native: moreName ?? language,
    english: moreName ?? language,
    preview: `${moreName ?? language} pack downloads when you tap Use`,
  };
  const auto = toggleColors(p, matchState);

  const v = {
    langs: PRIMARY.map((l) => {
      const on = l.id === language;
      return { ...l, key: l.id, checked: on ? 'true' : 'false', ring: on ? `7px solid ${p.primary}` : p.ringOff, pick: () => set({ language: l.id }) };
    }),
    allLangs: all.map(([id, label]) => ({ label, key: id, ...chipColors(p, id === language), pick: () => set({ language: id }) })),
    collapsed: !expanded,
    expanded,
    expandedAttr: expanded ? 'true' : 'false',
    moreLabel: expanded ? 'Show fewer' : 'All 22 Indian languages',
    chevron: expanded ? '-90deg' : '90deg',
    toggleMore: () => setExpanded(!expanded),
    preview: cur.preview,
    chosen: cur.native,
    previewFont: language === 'en' ? p.displayFont : "'Mukta', 'Mukta Vaani', sans-serif",
    previewSize: language === 'en' ? '34px' : '30px',
    autoPressed: auto.pressed,
    autoTrack: auto.track,
    autoKnob: auto.knob,
    toggleAuto: () => set({ matchState: !matchState }),
  };
  return <Themed classic={LanguageView} deccan={DeccanLanguageView} v={v} />;
}
