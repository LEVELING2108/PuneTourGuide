import { useState } from 'react';
import { authApi } from '../../api/auth';
import { errorText } from './shared';
import { Themed } from '../../components/Themed';
import ForgotPasswordView from '../../views/classic/ForgotPassword.view';
import DeccanForgotPasswordView from '../../views/deccan/DeccanForgotPassword.view';

/** "Check your inbox" is shown for every email: the screen never reveals which emails have accounts. */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState<string | undefined>();

  const send = async () => {
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter the email you signed up with.');
    setBusy(true);
    setError('');
    try {
      const r = await authApi.forgot(email.trim());
      setDevLink(r.devLink);
      setSent(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const v = {
    sent,
    notSent: !sent,
    email,
    onEmail: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    onEnter: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') void send();
    },
    busy,
    error,
    devLink,
    send: () => void send(),
    again: () => void send(),
  };
  return <Themed classic={ForgotPasswordView} deccan={DeccanForgotPasswordView} v={v} />;
}
