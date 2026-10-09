import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { authApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import { useAuthStore } from '../../stores/auth';
import LoginView from '../../views/classic/Login.view';
import DeccanLoginView from '../../views/deccan/DeccanLogin.view';
import { modeTabs } from './shared';

export const errorText = (err: unknown) =>
  err instanceof ApiError ? (err.isOffline ? 'You are offline. Connect and try again.' : err.message) : 'Something went wrong. Try again.';

export default function LoginScreen() {
  const p = usePalette();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const next = params.get('next') || '/';

  const submitEmail = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      setSession(await authApi.login({ email: email.trim(), password }));
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const sendCode = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter your 10-digit mobile number.');
      return;
    }
    setError('');
    navigate('/otp', { state: { phone: digits, next } });
  };

  const v = {
    ...modeTabs(p, mode, (m) => {
      setMode(m);
      setError('');
    }),
    pwType: show ? 'text' : 'password',
    hidden: !show,
    shown: show,
    showLabel: show ? 'Hide password' : 'Show password',
    toggleShow: (e?: React.MouseEvent) => {
      e?.preventDefault();
      setShow(!show);
    },
    email,
    password,
    phone,
    onEmail: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    onPassword: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    onPhone: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value.replace(/[^\d ]/g, '').slice(0, 11)),
    onEnter: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') (mode === 'email' ? submitEmail : sendCode)(e);
    },
    submitEmail,
    sendCode,
    busy: busy ? 'true' : 'false',
    loginLabel: busy ? 'Logging in…' : 'Log in',
    sendLabel: 'Send code',
    error,
    google: (e: React.MouseEvent) => {
      e.preventDefault();
      setError('Google sign-in is coming soon. Use email or mobile for now.');
    },
  };
  return <Themed classic={LoginView} deccan={DeccanLoginView} v={v} />;
}
