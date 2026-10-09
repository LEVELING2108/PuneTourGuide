import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import SignUpView from '../../views/classic/SignUp.view';
import DeccanSignUpView from '../../views/deccan/DeccanSignUp.view';
import { agreeBox, modeTabs, passwordScore } from './shared';

const LABELS = ['', 'Too weak', 'Okay', 'Strong', 'Excellent'];

export default function SignUpScreen() {
  const p = usePalette();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [pw, setPw] = useState('');
  const [agree, setAgree] = useState(false);

  const score = passwordScore(pw);
  const colors = [p.segOff, '#C8321C', '#C27A1E', '#2FA58A', p.primary];
  const email = mode === 'email';

  const v = {
    ...modeTabs(p, mode, setMode),
    ...agreeBox(p, agree, () => setAgree(!agree)),
    segs: [0, 1, 2, 3].map((i) => ({ bg: i < score ? colors[score] : p.segOff })),
    strengthLabel: pw.length === 0 ? '' : LABELS[score],
    strengthColor: score <= 1 ? '#A3281A' : score === 2 ? '#8A4A12' : p.primary,
    onPw: (e: React.FormEvent<HTMLInputElement>) => setPw(e.currentTarget.value),
    ctaLabel: email ? 'Create account' : 'Send code',
    ctaHref: email ? '/first-contact' : '/otp',
  };
  return <Themed classic={SignUpView} deccan={DeccanSignUpView} v={v} />;
}
