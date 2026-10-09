import { Themed } from '../../components/Themed';
import SignOutView from '../../views/classic/SignOut.view';
import DeccanSignOutView from '../../views/deccan/DeccanSignOut.view';
import SettingsScreen from './SettingsScreen';

/** Sign-out sheet over the settings list. */
export default function SignOutScreen() {
  return <Themed classic={SignOutView} deccan={DeccanSignOutView} v={{ underlay: <SettingsScreen /> }} />;
}
