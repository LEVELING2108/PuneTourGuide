import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { toggleColors, usePalette } from '../../lib/palette';
import { useFlash } from '../../lib/useFlash';
import { useSettingsStore } from '../../stores/settings';
import ContactsView from '../../views/classic/Contacts.view';
import DeccanContactsView from '../../views/deccan/DeccanContacts.view';

export default function ContactsScreen() {
  const p = usePalette();
  const { smsWhenOffline, set } = useSettingsStore();
  const [sent, setSent] = useState(false);
  const toast = useFlash(2900);
  const sms = toggleColors(p, smsWhenOffline);

  const v = {
    smsText: smsWhenOffline ? 'Location sent by text if there’s no data' : 'Off · alerts need mobile data',
    smsPressed: sms.pressed,
    smsTrack: sms.track,
    smsKnob: sms.knob,
    toggleSms: () => set({ smsWhenOffline: !smsWhenOffline }),
    testLabel: sent ? 'Sent' : 'Send',
    testBg: sent ? p.softBg : p.surface,
    testFg: sent ? p.primary : p.ink,
    testBd: sent ? p.softBd : p.testBd,
    showToast: toast.show,
    toastKey: toast.key,
    sendTest: () => {
      setSent(true);
      toast.flash();
    },
  };
  return <Themed classic={ContactsView} deccan={DeccanContactsView} v={v} />;
}
