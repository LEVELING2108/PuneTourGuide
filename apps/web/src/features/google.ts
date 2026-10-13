/**
 * Google sign-in with Google Identity Services: the official "Sign in with Google" button,
 * which hands back an ID token that the Tour API verifies.
 *
 * The button is used instead of the One Tap prompt because browsers hide the prompt for hours
 * to weeks after a user closes it once, which would leave that user no way to sign in with Google.
 */
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';

export type GoogleContext = 'signin' | 'signup';

type ButtonOptions = {
  type: 'standard';
  theme: 'outline';
  size: 'large';
  shape: 'pill';
  text: 'continue_with' | 'signup_with';
  logo_alignment: 'center';
  width: number;
  locale?: string;
};
type Gsi = {
  accounts: {
    id: {
      initialize: (o: { client_id: string; callback: (r: { credential?: string }) => void; context?: GoogleContext; ux_mode: 'popup' }) => void;
      renderButton: (el: HTMLElement, o: ButtonOptions) => void;
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
      s.remove();
      reject(new Error('Google sign-in could not load. Check your connection.'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

// GSI keeps one configuration per page, so it is initialised once and the latest button's handler receives the token.
let onToken: ((idToken: string) => void) | null = null;
let initialised: GoogleContext | null = null;

/**
 * Draws Google's button into `el`. Resolves once it is drawn; rejects with a message the screen
 * can show when Google sign-in isn't configured or its script can't load (for example offline).
 */
export async function renderGoogleButton(
  el: HTMLElement,
  o: { context: GoogleContext; width: number; locale?: string; onToken: (idToken: string) => void },
): Promise<void> {
  if (!CLIENT_ID) throw new Error("Google sign-in isn't set up yet. Use email or mobile.");
  const gsi = await loadGsi();
  onToken = o.onToken;
  if (initialised !== o.context) {
    gsi.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (r) => r.credential && onToken?.(r.credential),
      context: o.context,
      ux_mode: 'popup',
    });
    initialised = o.context;
  }
  gsi.accounts.id.renderButton(el, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    text: o.context === 'signup' ? 'signup_with' : 'continue_with',
    logo_alignment: 'center',
    // Google accepts 200–400 px.
    width: Math.max(200, Math.min(400, Math.round(o.width))),
    locale: o.locale,
  });
}
