import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { usersApi } from '../../api/auth';
import { Themed } from '../../components/Themed';
import { useAccountRequired } from '../../features/account';
import { safeNext } from '../../features/signin';
import { usePalette } from '../../lib/palette';
import { useAuthStore, useUser } from '../../stores/auth';
import PhoneNameView from '../../views/classic/PhoneName.view';
import DeccanPhoneNameView from '../../views/deccan/DeccanPhoneName.view';
import { agreeBox, errorText } from './shared';

/** "Almost there": name, optional email and consent for new mobile users. */
export default function PhoneNameScreen() {
  const p = usePalette();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useUser();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const next = safeNext(params.get('next'));
  useAccountRequired();

  useEffect(() => {
    if (user) {
      setName((n) => n || user.name);
      setEmail((e) => e || (user.email ?? ''));
    }
  }, [user]);

  const v = {
    ...agreeBox(p, agree, () => setAgree(!agree)),
    name,
    email,
    onName: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    onEmail: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    error,
    submit: async (e: React.MouseEvent) => {
      e.preventDefault();
      if (busy) return;
      if (!name.trim()) return setError('Enter your name.');
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email, or leave it empty.');
      if (!agree) return setError('Please accept the Terms and Privacy Policy.');
      setBusy(true);
      setError('');
      try {
        setUser(await usersApi.update({ name: name.trim(), ...(email.trim() ? { email: email.trim() } : {}), acceptTerms: true }));
        navigate(`/first-contact?next=${encodeURIComponent(next)}`, { replace: true });
      } catch (err) {
        setError(errorText(err));
      } finally {
        setBusy(false);
      }
    },
  };
  return <Themed classic={PhoneNameView} deccan={DeccanPhoneNameView} v={v} />;
}
