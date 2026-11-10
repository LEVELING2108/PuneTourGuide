import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Themed } from '../../components/Themed';
import { savePrefs } from '../../features/preferences';
import { usePalette } from '../../lib/palette';
import { useThemeStore, type ThemeName } from '../../stores/theme';
import ThemeView from '../../views/classic/Theme.view';
import DeccanThemeView from '../../views/deccan/DeccanTheme.view';

const CLASSIC_PRIMARY = '#0F4C42';
const DECCAN_PRIMARY = '#7A1F4E';

/** App theme picker. "Apply" switches <html data-theme> and returns Home. */
export default function ThemeScreen() {
  const p = usePalette();
  const theme = useThemeStore((st) => st.theme);
  const navigate = useNavigate();
  const [choice, setChoice] = useState<ThemeName>(theme);
  const c = choice === 'classic';
  const deccanUi = theme === 'deccan';
  // In the Deccan screen both cards highlight in Deccan plum (as in the mockup)
  const classicAccent = deccanUi ? DECCAN_PRIMARY : CLASSIC_PRIMARY;
  const classicShadowColor = deccanUi ? 'rgba(122,31,78,0.6)' : 'rgba(15,76,66,0.6)';

  const v = {
    classicChecked: c ? 'true' : 'false',
    deccanChecked: c ? 'false' : 'true',
    classicBd: c ? classicAccent : p.line,
    deccanBd: c ? p.line : DECCAN_PRIMARY,
    classicShadow: c ? `0 18px 30px -20px ${classicShadowColor}` : 'none',
    deccanShadow: c ? 'none' : '0 18px 30px -20px rgba(122,31,78,0.6)',
    classicRing: c ? `7px solid ${classicAccent}` : p.ringOff,
    deccanRing: c ? p.ringOff : `7px solid ${DECCAN_PRIMARY}`,
    pickClassic: () => setChoice('classic'),
    pickDeccan: () => setChoice('deccan'),
    chosen: c ? 'Classic' : 'Deccan',
    applyHref: '/',
    applyBg: deccanUi ? DECCAN_PRIMARY : c ? CLASSIC_PRIMARY : DECCAN_PRIMARY,
    apply: (e: React.MouseEvent) => {
      e.preventDefault();
      // Applied at once on this phone; saved to the profile when logged in (TECH_DESIGN §9.10)
      void savePrefs({ theme: choice }).catch(() => undefined);
      navigate('/');
    },
  };
  return <Themed classic={ThemeView} deccan={DeccanThemeView} v={v} />;
}
