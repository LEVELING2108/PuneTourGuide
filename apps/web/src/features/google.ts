/**
 * Google sign-in with Google Identity Services: Google shows its own account chooser
 * (One Tap / FedCM) and hands back an ID token, which the Tour API verifies.
 */
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';

type Notification = { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getNotDisplayedReason?: () => string };
type Gsi = {
  accounts: {
    id: {
      initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; use_fedcm_for_prompt?: boolean; cancel_on_tap_outside?: boolean; context?: string }) => void;
      prompt: (cb?: (n: Notification) => void) => void;
      cancel: () => void;
    };
  };
};

export const googleConfigured = () => !!CLIENT_ID;

let loading: Promise<Gsi> | null = null;
function loadGsi(): Promise<Gsi> {
  const w = window as unknown as { google?: Gsi };
  if (w.google?.accounts?.id) return Promise.resolve(w.google);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => (w.google ? resolve(w.google) : reject(new Error('Google sign-in did not load')));
    s.onerror = () => {
      loading = null;
      reject(new Error('Google sign-in could not load. Check your connection.'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Resolves with a Google ID token, or rejects with a message the screen can show. */
export async function googleIdToken(context: 'signin' | 'signup' = 'signin'): Promise<string> {
  if (!CLIENT_ID) throw new Error("Google sign-in isn't set up yet. Use email or mobile.");
  const gsi = await loadGsi();
  return new Promise((resolve, reject) => {
    gsi.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (r) => (r.credential ? resolve(r.credential) : reject(new Error('Google sign-in was cancelled'))),
      use_fedcm_for_prompt: true,
      cancel_on_tap_outside: true,
      context,
    });
    gsi.accounts.id.prompt((n) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) reject(new Error('Google sign-in was closed or blocked by the browser. Try again, or use email or mobile.'));
    });
  });
}
