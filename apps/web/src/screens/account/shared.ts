import { ApiError } from '../../api/client';
import type { Palette } from '../../lib/palette';

/** Email / Mobile segmented control used by Login and SignUp. */
export const modeTabs = (p: Palette, mode: 'email' | 'phone', setMode: (m: 'email' | 'phone') => void) => {
  const email = mode === 'email';
  return {
    isEmail: email,
    isPhone: !email,
    segX: email ? '0%' : '100%',
    emailSel: email ? 'true' : 'false',
    phoneSel: email ? 'false' : 'true',
    emailColor: email ? p.ink : p.muted,
    phoneColor: email ? p.muted : p.ink,
    pickEmail: () => setMode('email'),
    pickPhone: () => setMode('phone'),
  };
};

/** Terms checkbox + primary CTA enabled state. */
export const agreeBox = (p: Palette, agree: boolean, toggle: () => void) => ({
  agreeChecked: agree ? 'true' : 'false',
  boxBg: agree ? p.primary : p.surface,
  boxBd: agree ? p.primary : p.boxBd,
  toggleAgree: toggle,
  ctaBg: agree ? p.primary : p.ctaOff,
  ctaDisabled: agree ? 'false' : 'true',
});

/** Client-side password strength, 0–4 (SignUp). */
export function passwordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length > 0 && pw.length < 8) score = Math.min(score, 1);
  if (pw.length > 0 && score === 0) score = 1;
  return score;
}

export const RELATIONS = ['Parent', 'Partner', 'Sibling', 'Friend', 'Other'] as const;

/** A message a person can act on, for any error from the API or the network. */
export const errorText = (err: unknown) =>
  err instanceof ApiError ? (err.isOffline ? 'You are offline. Connect and try again.' : err.message) : 'Something went wrong. Try again.';
