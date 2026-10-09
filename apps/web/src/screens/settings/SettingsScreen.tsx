import { Themed } from '../../components/Themed';
import { toggleColors, usePalette } from '../../lib/palette';
import { useSettingsStore } from '../../stores/settings';
import ProfileView from '../../views/classic/Profile.view';
import DeccanSettingsView from '../../views/deccan/DeccanSettings.view';

/** Settings list: Classic "Profile" tab, Deccan "Settings" (reached from the passport). */
export default function SettingsScreen() {
  const p = usePalette();
  const { shakeToSos, tripReminders, set } = useSettingsStore();
  const shake = toggleColors(p, shakeToSos);
  const notify = toggleColors(p, tripReminders);

  const v = {
    shakeText: shakeToSos ? 'On · 5-second countdown before calling 112' : 'Off · use the SOS button instead',
    shakePressed: shake.pressed,
    shakeTrack: shake.track,
    shakeKnob: shake.knob,
    toggleShake: () => set({ shakeToSos: !shakeToSos }),
    notifyPressed: notify.pressed,
    notifyTrack: notify.track,
    notifyKnob: notify.knob,
    toggleNotify: () => set({ tripReminders: !tripReminders }),
  };
  return <Themed classic={ProfileView} deccan={DeccanSettingsView} v={v} />;
}
