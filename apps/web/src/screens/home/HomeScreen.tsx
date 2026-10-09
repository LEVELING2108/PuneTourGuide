import { Themed } from '../../components/Themed';
import { useSafetyReady } from '../../stores/permissions';
import MainView from '../../views/classic/Main.view';
import DeccanHomeView from '../../views/deccan/DeccanHome.view';

/** Home. Shows the amber "Safety not set up" card while location or motion is missing (HomeSetup). */
export default function HomeScreen() {
  const ready = useSafetyReady();
  return <Themed classic={MainView} deccan={DeccanHomeView} v={{ ready, notReady: !ready }} />;
}
