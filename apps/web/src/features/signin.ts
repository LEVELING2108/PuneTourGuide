import type { SessionResponse } from '../api/types';
import { useAuthStore } from '../stores/auth';

const OTP_KEY = 'pe_otp';

/** Where to go after any sign-in (TECH_DESIGN §9.12). */
export function afterSignIn(s: SessionResponse, next: string) {
  useAuthStore.getState().setSession(s);
  const q = `?next=${encodeURIComponent(next)}`;
  // Mobile sign-ups (and anyone who stopped half-way) still need a name and consent
  if (!s.user.name || !s.user.termsAccepted) return `/almost-there${q}`;
  // Every new account is asked for a first emergency contact
  if (s.isNewUser) return `/first-contact${q}`;
  return next;
}

/** Only same-site paths, so a crafted ?next= link cannot send people to another site. */
export const safeNext = (raw: string | null) => (raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/');

/** The number waiting for a code survives a reload of the code screen (tab only). */
export const otpTarget = {
  set(v: { phone: string; next: string }) {
    try {
      sessionStorage.setItem(OTP_KEY, JSON.stringify(v));
    } catch {
      /* private mode */
    }
  },
  get(): { phone: string; next: string } | null {
    try {
      return JSON.parse(sessionStorage.getItem(OTP_KEY) ?? 'null');
    } catch {
      return null;
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(OTP_KEY);
    } catch {
      /* ignore */
    }
  },
};

/** 98765 43210 → +91 98••• ••210 */
export const maskedPhone = (digits: string) => {
  const d = digits.replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 2)}••• ••${d.slice(7)}` : `+91 ${d}`;
};
