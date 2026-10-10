import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Themed } from '../../components/Themed';
import { canPickContacts, pickPhoneContact, useContacts, useRemoveContact, useSaveContact } from '../../features/contacts';
import { chipColors, toggleColors, usePalette } from '../../lib/palette';
import { useIsLoggedIn } from '../../stores/auth';
import ContactEditView from '../../views/classic/ContactEdit.view';
import DeccanContactEditView from '../../views/deccan/DeccanContactEdit.view';
import { RELATIONS } from '../account/shared';

type Props = { mode: 'add' | 'edit' };

/** Digits a person would type after +91, from anything pasted or picked ("+91 98765-43210"). */
const localDigits = (raw: string) => {
  const d = raw.replace(/\D/g, '');
  return (d.length > 10 && d.startsWith('91') ? d.slice(2) : d.replace(/^0/, '')).slice(0, 10);
};
const formatLocal = (d: string) => (d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d);
const relationOf = (r: string) => ((RELATIONS as readonly string[]).includes(r) ? r : 'Other');

/** Add or edit an emergency contact (ContactAdd is this screen in "add" mode). */
export default function ContactEditScreen({ mode }: Props) {
  const p = usePalette();
  const navigate = useNavigate();
  const { id } = useParams();
  const loggedIn = useIsLoggedIn();
  const add = mode === 'add';
  const contactsQ = useContacts();
  const existing = add ? null : contactsQ.data?.find((c) => c.id === Number(id)) ?? null;
  const save = useSaveContact();
  const removeM = useRemoveContact();

  const [s, setS] = useState({ name: '', rel: 'Friend', phone: '', primary: false, confirm: false, picked: false });
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(add);

  useEffect(() => {
    if (!loggedIn) navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
  }, [loggedIn, navigate]);

  useEffect(() => {
    if (!add && existing && !loaded) {
      setS({ name: existing.name, rel: relationOf(existing.relation), phone: localDigits(existing.phone), primary: existing.isPrimary, confirm: false, picked: false });
      setLoaded(true);
    }
    if (!add && contactsQ.isSuccess && !existing) navigate('/settings/contacts', { replace: true });
  }, [add, existing, loaded, contactsQ.isSuccess, navigate]);

  // The first contact is always the primary one
  const first = add && contactsQ.isSuccess && contactsQ.data.length === 0;
  const primaryOn = first || s.primary;
  const primary = toggleColors(p, primaryOn);
  const valid = s.name.trim().length > 0 && /^[6-9]\d{9}$/.test(s.phone);

  const v = {
    rels: RELATIONS.map((label) => ({ label, key: label, ...chipColors(p, label === s.rel), pick: () => setS({ ...s, rel: label }) })),
    isAdd: add,
    canPick: add && canPickContacts(),
    title: add ? 'Add contact' : 'Edit contact',
    ctaLabel: save.isPending ? 'Saving…' : add ? 'Add contact' : 'Save changes',
    saving: save.isPending,
    saveOpacity: valid ? 1 : 0.55,
    showAvatar: !add || s.picked,
    initial: (s.name || '?').charAt(0).toUpperCase(),
    pickLabel: s.picked ? 'Picked from contacts · change' : 'Pick from phone contacts',
    pickContact: async () => {
      const c = await pickPhoneContact();
      if (c) setS({ ...s, picked: true, name: c.name || s.name, phone: localDigits(c.phone) });
    },
    name: s.name,
    phone: formatLocal(s.phone),
    onName: (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, name: e.target.value }),
    onPhone: (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, phone: localDigits(e.target.value) }),
    primaryPressed: primary.pressed,
    primaryTrack: primary.track,
    primaryKnob: primary.knob,
    togglePrimary: () => {
      // Exactly one primary: switch it on here to move it; it cannot be switched off.
      if (existing?.isPrimary || first) return setError('Make another contact primary instead');
      setS({ ...s, primary: !s.primary });
    },
    error,
    save: () => {
      setError('');
      if (!s.name.trim()) return setError('Enter a name');
      if (!/^[6-9]\d{9}$/.test(s.phone)) return setError('Enter a 10-digit mobile number');
      save.mutate(
        { id: existing?.id, body: { name: s.name.trim(), relation: s.rel, phone: `+91${s.phone}`, isPrimary: primaryOn } },
        { onSuccess: () => navigate('/settings/contacts'), onError: (err) => setError(err.message) }
      );
    },
    canRemove: !add,
    confirming: s.confirm,
    notConfirming: !s.confirm,
    askRemove: () => setS({ ...s, confirm: true }),
    cancelRemove: () => setS({ ...s, confirm: false }),
    remove: () => {
      if (!existing) return;
      removeM.mutate(existing.id, { onSuccess: () => navigate('/settings/contacts'), onError: (err) => setError(err.message) });
    },
  };
  return <Themed classic={ContactEditView} deccan={DeccanContactEditView} v={v} />;
}
