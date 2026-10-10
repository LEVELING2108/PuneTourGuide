import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '../../api/auth';
import { contactsApi } from '../../api/contacts';
import { Themed } from '../../components/Themed';
import { useAccountRequired } from '../../features/account';
import { useContacts } from '../../features/contacts';
import { namesText } from '../../features/live';
import { toggleColors, usePalette } from '../../lib/palette';
import { useFlash } from '../../lib/useFlash';
import { useIsLoggedIn } from '../../stores/auth';
import { useSettingsStore } from '../../stores/settings';
import { useTheme } from '../../stores/theme';
import ContactsView from '../../views/classic/Contacts.view';
import DeccanContactsView from '../../views/deccan/DeccanContacts.view';

const MAX = 5;
const TONES = {
  classic: ['#4A3426', '#26303B', '#0F4C42', '#1B2220', '#5E6763'],
  deccan: ['#A4462B', '#0E5B5E', '#7A1F4E', '#8A6420', '#3A2A22'],
};

/** "+91 ••••• •4521": the screen shows only the last digits; the call button uses the full number. */
const masked = (e164: string) => (e164.startsWith('+91') ? `+91 ••••• •${e164.slice(-4)}` : `••• ${e164.slice(-4)}`);

export default function ContactsScreen() {
  const p = usePalette();
  const theme = useTheme();
  const loggedIn = useIsLoggedIn();
  const { smsWhenOffline, set } = useSettingsStore();
  const contactsQ = useContacts();
  const [sent, setSent] = useState(false);
  const toast = useFlash(2900);
  const sms = toggleColors(p, smsWhenOffline);

  useAccountRequired();

  const test = useMutation({
    mutationFn: contactsApi.testAlert,
    onSuccess: (r) => {
      setSent(true);
      toast.flash(`Test alert sent to ${namesText(r.sentTo)}`);
    },
    onError: (err) => toast.flash(err.message),
  });

  const list = contactsQ.data ?? [];
  const v = {
    contacts: list.map((c, i) => ({
      key: c.id,
      name: c.name,
      initial: c.name.charAt(0).toUpperCase(),
      tone: TONES[theme][i % TONES[theme].length],
      isPrimary: c.isPrimary,
      meta: `${c.relation} · ${masked(c.phone)}`,
      tel: `tel:${c.phone}`,
      callLabel: `Call ${c.name}`,
      editHref: `/settings/contacts/${c.id}`,
      editLabel: `Edit ${c.name}`,
    })),
    empty: contactsQ.isSuccess && list.length === 0,
    canAdd: list.length < MAX,
    countText: `${list.length} of ${MAX}`,
    smsText: smsWhenOffline ? 'Location sent by text if there’s no data' : 'Off · alerts need mobile data',
    smsPressed: sms.pressed,
    smsTrack: sms.track,
    smsKnob: sms.knob,
    toggleSms: () => {
      const next = !smsWhenOffline;
      set({ smsWhenOffline: next });
      if (loggedIn) usersApi.update({ smsWhenOffline: next }).catch(() => set({ smsWhenOffline: !next }));
    },
    testLabel: test.isPending ? 'Sending…' : sent ? 'Sent' : 'Send',
    testBusy: test.isPending || list.length === 0,
    testBg: sent ? p.softBg : p.surface,
    testFg: sent ? p.primary : p.ink,
    testBd: sent ? p.softBd : p.testBd,
    showToast: toast.show,
    toastKey: toast.key,
    toastText: toast.text,
    sendTest: () => {
      if (!list.length) return toast.flash('Add an emergency contact first');
      test.mutate();
    },
  };
  return <Themed classic={ContactsView} deccan={DeccanContactsView} v={v} />;
}
