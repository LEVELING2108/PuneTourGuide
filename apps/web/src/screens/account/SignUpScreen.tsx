import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { authApi } from '../../api/auth';
import { Themed } from '../../components/Themed';
import { afterSignIn, otpTarget, safeNext } from '../../features/signin';
import { usePalette } from '../../lib/palette';
import { useSettingsStore } from '../../stores/settings';
import { useTheme } from '../../stores/theme';
import SignUpView from '../../views/classic/SignUp.view';
import DeccanSignUpView from '../../views/deccan/DeccanSignUp.view';
import { agreeBox, errorText, modeTabs, passwordScore } from './shared';
import { serverSms } from '../../features/phoneSms';

const LABELS = ['', 'Too weak', 'Okay', 'Strong', 'Excellent'];

export default function SignUpScreen() {
  const p = usePalette();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const theme = useTheme();
  const language = useSettingsStore((s) => s.language);
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const next = safeNext(params.get('next'));

  const score = passwordScore(pw);
  const colors = [p.segOff, '#C8321C', '#C27A1E', '#2FA58A', p.primary];
  const isEmail = mode === 'email';

  const submit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!agree) return setError('Please accept the Terms and Privacy Policy.');
    setError('');
    if (isEmail) {
      if (!name.trim()) return setError('Enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email.');
      if (pw.length < 8) return setError('Use at least 8 characters for your password.');
      if (score < 2) return setError('Choose a stronger password: mix letters with numbers or symbols.');
    } else if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      return setError('Enter your 10-digit mobile number.');
    }
    setBusy(true);
    try {
      if (isEmail) {
        const s = await authApi.register({ name: name.trim(), email: email.trim(), password: pw, acceptTerms: true, theme, language });
        navigate(afterSignIn(s, next), { replace: true });
      } else {
        const digits = phone.replace(/\D/g, '');
        const r = await authApi.otpSend(digits);
        otpTarget.set({ phone: digits, next });
        navigate('/otp', { state: { devCode: r.devCode } });
      }
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
    ...agreeBox(p, agree, () => setAgree(!agree)),
    name,
    email,
    pw,
    phone,
    onName: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    onEmail: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    onPw: (e: React.ChangeEvent<HTMLInputElement>) => setPw(e.target.value),
    onPhone: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value.replace(/[^\d ]/g, '').slice(0, 11)),
    segs: [0, 1, 2, 3].map((i) => ({ bg: i < score ? colors[score] : p.segOff })),
    strengthLabel: pw.length === 0 ? '' : LABELS[score],
    strengthColor: score <= 1 ? '#A3281A' : score === 2 ? '#8A4A12' : p.primary,
    ctaLabel: busy ? (isEmail ? 'Creating…' : 'Sending…') : isEmail ? 'Create account' : 'Send code',
    ctaHref: isEmail ? '/first-contact' : '/otp',
    submit,
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
  return <Themed classic={SignUpView} deccan={DeccanSignUpView} v={v} />;
}
