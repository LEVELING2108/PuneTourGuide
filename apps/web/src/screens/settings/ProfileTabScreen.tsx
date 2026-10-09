import { useTheme } from '../../stores/theme';
import DeccanProfileView from '../../views/deccan/DeccanProfile.view';
import SettingsScreen from './SettingsScreen';

/** Profile tab: Deccan shows the travel passport; Classic shows the settings list. */
export default function ProfileTabScreen() {
  const theme = useTheme();
  if (theme === 'deccan') return <DeccanProfileView v={{}} />;
  return <SettingsScreen />;
}
