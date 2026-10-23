import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { authApi } from '../../api/auth';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import { afterSignIn, otpTarget, safeNext } from '../../features/signin';
import LoginView from '../../views/classic/Login.view';
import DeccanLoginView from '../../views/deccan/DeccanLogin.view';
import { errorText, modeTabs } from './shared';
import { serverSms } from '../../features/phoneSms';

export default function LoginScreen() {
  const p = usePalette();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const next = safeNext(params.get('next'));

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
      navigate(afterSignIn(await authApi.login({ email: email.trim(), password }), next), { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const sendCode = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (busy) return;
    const digits = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError('Enter your 10-digit mobile number.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await authApi.otpSend(digits);
      otpTarget.set({ phone: digits, next });
      navigate('/otp', { state: { devCode: r.devCode } });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const v = {
    // Login codes need server texts that reach every number (TECH_DESIGN §9.5); hidden until then
    phoneLogin: serverSms(),
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
    sendLabel: busy && mode === 'phone' ? 'Sending…' : 'Send code',
    error,
    googleToken: async (idToken: string) => {
      if (busy) return;
      setError('');
      setBusy(true);
      try {
        navigate(afterSignIn(await authApi.google(idToken), next), { replace: true });
      } catch (err) {
        setError(errorText(err));
      } finally {
        setBusy(false);
      }
    },
    googleUnavailable: setError,
  };
  return <Themed classic={LoginView} deccan={DeccanLoginView} v={v} />;
}
