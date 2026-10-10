import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Themed } from '../../components/Themed';
import { useAccountRequired } from '../../features/account';
import { canPickContacts, pickPhoneContact, useSaveContact } from '../../features/contacts';
import { safeNext } from '../../features/signin';
import { chipColors, usePalette } from '../../lib/palette';
import OnboardView from '../../views/classic/Onboard.view';
import DeccanOnboardView from '../../views/deccan/DeccanOnboard.view';
import { RELATIONS } from './shared';

const localDigits = (raw: string) => {
  const d = raw.replace(/\D/g, '');
  return (d.length > 10 && d.startsWith('91') ? d.slice(2) : d.replace(/^0/, '')).slice(0, 10);
};
const formatLocal = (d: string) => (d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d);

/** First emergency contact (new accounts). Skippable; SOS still calls 112 without one. */
export default function OnboardScreen() {
  const p = usePalette();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const save = useSaveContact();
  const [rel, setRel] = useState<string>('Parent');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [picked, setPicked] = useState(false);
  const [error, setError] = useState('');
  const next = safeNext(params.get('next'));
  useAccountRequired();

  const who = name.trim() ? name.trim() : 'THEY';
  const valid = !!name.trim() && /^[6-9]\d{9}$/.test(phone);
  const v = {
    rels: RELATIONS.map((label) => ({ label, key: label, ...chipColors(p, label === rel), pick: () => setRel(label) })),
    whoUpper: who.toUpperCase(),
    name,
    phone: formatLocal(phone),
    pickLabel: picked ? 'Picked from contacts · change' : 'Pick from my contacts',
    pickContact: async () => {
      if (!canPickContacts()) return setError("This browser can't open your contacts. Type their number below.");
      const c = await pickPhoneContact();
      if (!c) return;
      setPicked(true);
      setError('');
      if (c.name) setName(c.name);
      setPhone(localDigits(c.phone));
    },
    onName: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    onPhone: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(localDigits(e.target.value)),
    saveDisabled: valid && !save.isPending ? 'false' : 'true',
    error,
    save: (e: React.MouseEvent) => {
      e.preventDefault();
      if (save.isPending) return;
      if (!name.trim()) return setError('Enter their name.');
      if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter their 10-digit mobile number.');
      setError('');
      save.mutate(
        { body: { name: name.trim(), relation: rel, phone: `+91${phone}`, isPrimary: true } },
        { onSuccess: () => navigate(next, { replace: true }), onError: (err) => setError(err.message) }
      );
    },
    skip: (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(next, { replace: true });
    },
  };
  return <Themed classic={OnboardView} deccan={DeccanOnboardView} v={v} />;
}
