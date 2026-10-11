import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { usersApi } from '../../api/auth';
import { useAccountRequired } from '../../features/account';
import { forgetCachedContacts } from '../../features/contacts';
import { useAuthStore, useUser } from '../../stores/auth';
import { errorText } from '../account/shared';

/**
 * Delete account (DPDP Act right to erasure; Google Play requires it in the app).
 * No mockup exists for this screen, so it uses theme tokens only. SOS red is for the final button.
 */
export default function DeleteAccountScreen() {
  const navigate = useNavigate();
  const user = useUser();
  const endLocalSession = useAuthStore((s) => s.endLocalSession);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useAccountRequired();

  const armed = typed.trim().toUpperCase() === 'DELETE' && !busy;

  const remove = async () => {
    if (!armed) return;
    setBusy(true);
    setError('');
    try {
      await usersApi.deleteAccount();
      // This device forgets the account too: session, contact copy and last position
      forgetCachedContacts();
      try {
        localStorage.removeItem('pe_last_pos');
      } catch {
        /* blocked storage */
      }
      await endLocalSession();
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div className="scr" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <main style={{ padding: '56px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Link to="/settings" style={{ alignSelf: 'flex-start', minHeight: 44, padding: '0 16px', borderRadius: 22, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', display: 'flex', alignItems: 'center', textDecoration: 'none', fontSize: 15 }}>
          ← Back
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 34, lineHeight: 1.1, margin: '8px 0 0' }}>Delete your account</h1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--muted)' }}>
          {user?.email || user?.name ? `${user.name}${user.email ? ` · ${user.email}` : ''}` : ''}
        </p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '16px 18px', fontSize: 15, lineHeight: 1.55 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>This permanently removes:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>your profile, photo and sign-in on every device</li>
            <li>your emergency contacts and medical info</li>
            <li>your plans, saved places, stamps and XP</li>
            <li>your SOS and trip-sharing history</li>
          </ul>
          <p style={{ margin: '10px 0 0', color: 'var(--muted)' }}>It can’t be undone. SOS keeps working without an account: it still calls 112.</p>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)' }}>
          TYPE DELETE TO CONFIRM
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void remove()}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            style={{ height: 50, borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', padding: '0 16px', fontSize: 16, fontFamily: 'inherit', letterSpacing: '0.04em' }}
          />
        </label>
        {error && (
          <p role="alert" style={{ margin: 0, color: 'var(--sos-strong)', fontSize: 14 }}>
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => void remove()}
          aria-disabled={!armed}
          style={{ height: 56, borderRadius: 28, border: 0, background: 'var(--sos-strong)', color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'inherit', opacity: armed ? 1 : 0.5, cursor: armed ? 'pointer' : 'not-allowed' }}
        >
          {busy ? 'Deleting…' : 'Delete my account'}
        </button>
        <Link to="/settings" style={{ alignSelf: 'center', color: 'var(--ink)', fontSize: 15, padding: 10 }}>
          Keep my account
        </Link>
      </main>
    </div>
  );
}
