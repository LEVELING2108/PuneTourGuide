import { useEffect, useState } from 'react';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import OtpView from '../../views/classic/Otp.view';
import DeccanOtpView from '../../views/deccan/DeccanOtp.view';

const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const p = usePalette();
  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secs <= 0) return;
    const t = window.setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secs]);

  const done = code.length === 6;
  const v = {
    cells: [0, 1, 2, 3, 4, 5].map((i) => {
      const filled = i < code.length;
      const active = i === code.length;
      return {
        d: code[i] || '',
        filled,
        caret: active,
        bd: active ? p.primary : filled ? p.otpFilled : p.segOff,
        shadow: active ? p.otpShadow : 'none',
      };
    }),
    secs: secs < 10 ? '0' + secs : String(secs),
    waiting: secs > 0,
    canResend: secs <= 0,
    resend: () => setSecs(RESEND_SECONDS),
    onCode: (e: React.FormEvent<HTMLInputElement>) => {
      const next = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
      e.currentTarget.value = next;
      setCode(next);
    },
    ctaBg: done ? p.primary : p.ctaOff,
    ctaDisabled: done ? 'false' : 'true',
  };
  return <Themed classic={OtpView} deccan={DeccanOtpView} v={v} />;
}
