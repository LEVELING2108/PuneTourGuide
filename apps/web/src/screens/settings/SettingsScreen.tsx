import { useEffect } from 'react';
import { Themed } from '../../components/Themed';
import { useOffline } from '../../features/offline';
import { savePrefs } from '../../features/preferences';
import { useProfileSummary } from '../../features/profile';
import { toggleColors, usePalette } from '../../lib/palette';
import { useQuery } from '@tanstack/react-query';
import { medicalApi } from '../../api/medical';
import { useSettingsStore } from '../../stores/settings';
import ProfileView from '../../views/classic/Profile.view';
import DeccanSettingsView from '../../views/deccan/DeccanSettings.view';

/** Settings list: Classic "Profile" tab, Deccan "Settings" (reached from the passport). */
export default function SettingsScreen() {
  const p = usePalette();
  const { shakeToSos, tripReminders } = useSettingsStore();
  const s = useProfileSummary();
  const offline = useOffline();
  const medicalQ = useQuery({ queryKey: ['medical'], queryFn: medicalApi.get, enabled: s.loggedIn, staleTime: 10 * 60_000 });
  const shake = toggleColors(p, shakeToSos);
  const notify = toggleColors(p, tripReminders);

  useEffect(() => {
    if (!offline.loaded) void offline.load();
  }, [offline]);

  // Safety profile is complete with at least one contact and medical info saved
  const complete = s.contactsCount > 0 && !!medicalQ.data?.saved;
  const med = medicalQ.data;

  const v = {
    name: s.name,
    since: s.since,
    initials: s.initials,
    avatarUrl: s.avatarUrl,
    editHref: s.loggedIn ? '/settings/profile' : '/login?next=%2Fprofile',
    editLabel: s.loggedIn ? 'Edit profile' : 'Log in',
    levelKicker: `LEVEL ${s.level}`,
    levelName: s.levelName,
    xpText: s.xpText,
    levelPct: s.levelPct,
    statsText: s.statsText,
    toNextText: s.toNextText,
    safetyStatus: complete ? 'Complete' : 'Needs setup',
    safetyDot: complete ? '#2FA58A' : '#C27A1E',
    contactsText: s.contactsText,
    medicalText: med?.saved ? `${med.bloodGroup ? `Blood group ${med.bloodGroup.replace('-', '−')} · ` : ''}shared only during an SOS` : s.loggedIn ? 'Not added yet' : 'Log in to add',
    offlineText: s.offlineText,
    languageText: s.languageText,
    themeText: s.themeText,
    signLabel: s.loggedIn ? 'Sign out' : 'Log in',
    signHref: s.loggedIn ? '/settings/sign-out' : '/login?next=%2Fprofile',
    shakeText: shakeToSos ? 'On · 5-second countdown before calling 112' : 'Off · use the SOS button instead',
    shakePressed: shake.pressed,
    shakeTrack: shake.track,
    shakeKnob: shake.knob,
    toggleShake: () => void savePrefs({ shakeToSos: !shakeToSos }).catch(() => undefined),
    notifyPressed: notify.pressed,
    notifyTrack: notify.track,
    notifyKnob: notify.knob,
    toggleNotify: () => void savePrefs({ tripReminders: !tripReminders }).catch(() => undefined),
  };
  return <Themed classic={ProfileView} deccan={DeccanSettingsView} v={v} />;
}
