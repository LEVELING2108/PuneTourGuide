import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { authApi } from '../../api/auth';
import { errorText } from './shared';
import { Themed } from '../../components/Themed';
import { afterSignIn, maskedPhone, otpTarget } from '../../features/signin';
import { usePalette } from '../../lib/palette';
import OtpView from '../../views/classic/Otp.view';
import DeccanOtpView from '../../views/deccan/DeccanOtp.view';

const RESEND_SECONDS = 30;

type OtpCredential = Credential & { code?: string };

export default function OtpScreen() {
  const p = usePalette();
  const navigate = useNavigate();
  const location = useLocation();
  // Read once: verify clears it, and the screen must not then think no code was requested
  const [target] = useState(() => otpTarget.get());
  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(RESEND_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>((location.state as { devCode?: string } | null)?.devCode);
  const tried = useRef('');

  // No number waiting for a code (opened directly): start again from log in
  useEffect(() => {
    if (!target) navigate('/login', { replace: true });
  }, [target, navigate]);

  useEffect(() => {
    if (secs <= 0) return;
    const t = window.setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secs]);

  const verify = async (value = code) => {
    if (!target || busy || value.length !== 6) return;
    tried.current = value;
    setBusy(true);
    setError('');
    try {
      const s = await authApi.otpVerify(target.phone, value);
      otpTarget.clear();
      navigate(afterSignIn(s, target.next), { replace: true });
    } catch (err) {
      setError(errorText(err));
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  // Android Chrome: read the code from the SMS automatically (Web OTP API)
  useEffect(() => {
    if (!('OTPCredential' in window)) return;
    const ac = new AbortController();
    (navigator.credentials.get({ otp: { transport: ['sms'] }, signal: ac.signal } as CredentialRequestOptions) as Promise<OtpCredential | null>)
      .then((c) => {
        if (c?.code) {
          setCode(c.code);
          void verify(c.code);
        }
      })
      .catch(() => undefined);
    return () => ac.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resend = async (channel: 'sms' | 'voice') => {
    if (!target || secs > 0) return;
    setError('');
    try {
      const r = await authApi.otpSend(target.phone, channel);
      setDevCode(r.devCode);
      setSecs(r.resendIn);
      if (channel === 'voice' && r.channel === 'sms') setError('Calls are not available here, so we sent the code by SMS again.');
    } catch (err) {
      setError(errorText(err));
    }
  };

  const done = code.length === 6;
  const v = {
    phoneMasked: target ? maskedPhone(target.phone) : '',
    code,
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
    resendSms: () => void resend('sms'),
    callMe: () => void resend('voice'),
    onCode: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
      setCode(value);
      if (value.length === 6 && value !== tried.current) void verify(value);
    },
    verify: (e: React.MouseEvent) => {
      e.preventDefault();
      void verify();
    },
    ctaBg: done && !busy ? p.primary : p.ctaOff,
    ctaDisabled: done && !busy ? 'false' : 'true',
    error,
    devCode,
  };
  return <Themed classic={OtpView} deccan={DeccanOtpView} v={v} />;
}
