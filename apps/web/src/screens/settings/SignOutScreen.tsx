import { useNavigate } from 'react-router';
import { Themed } from '../../components/Themed';
import { useAuthStore } from '../../stores/auth';
import SignOutView from '../../views/classic/SignOut.view';
import DeccanSignOutView from '../../views/deccan/DeccanSignOut.view';
import SettingsScreen from './SettingsScreen';

/**
 * Sign-out sheet over the settings list. Clears the session but keeps contacts, medical
 * summary and offline packs on the device so SOS still works.
 */
export default function SignOutScreen() {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);

  const v = {
    underlay: <SettingsScreen />,
    signOut: async (e: React.MouseEvent) => {
      e.preventDefault();
      await signOut();
      navigate('/login', { replace: true });
    },
  };
  return <Themed classic={SignOutView} deccan={DeccanSignOutView} v={v} />;
}
