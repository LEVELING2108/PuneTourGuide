import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { authApi } from '../../api/auth';
import { DeccanOnly } from '../../components/Themed';
import { errorText, passwordScore } from './shared';

const LABELS = ['', 'Too weak', 'Okay', 'Strong', 'Excellent'];

/**
 * Opened from the emailed link (/reset?token=…). Not in the mockups; built from the same tokens
 * as Forgot password. After a reset every old session is signed out, so it goes to Log in.
 */
export default function ResetPasswordScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const [pw, setPw] = useState('');
  const [again, setAgain] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const score = passwordScore(pw);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (pw.length < 8) return setError('Use at least 8 characters.');
    if (score < 2) return setError('Choose a stronger password: mix letters with numbers or symbols.');
    if (pw !== again) return setError('The two passwords do not match.');
    setBusy(true);
    setError('');
    try {
      await authApi.reset(token, pw);
      setDone(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const field: React.CSSProperties = { height: 52, borderRadius: 16, border: '1px solid var(--line)', background: 'var(--surface)', padding: '0 16px', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)', width: '100%', boxSizing: 'border-box' };
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--muted)' };
  const cta: React.CSSProperties = { height: 56, borderRadius: 28, border: 'none', background: 'var(--primary)', color: 'var(--bg)', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' };

  return (
    <div className="scr" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)', padding: '72px 24px 32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <DeccanOnly>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'var(--gold)' }} />
      </DeccanOnly>
      <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, lineHeight: 1 }}>
        {done ? 'Password changed' : 'New '}
        {!done && <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>password</span>}
      </h1>
      {done ? (
        <>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--muted)' }}>For your safety you have been signed out everywhere. Log in with your new password.</p>
          <button style={cta} onClick={() => navigate('/login', { replace: true })}>
            Log in
          </button>
        </>
      ) : !token ? (
        <>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--muted)' }}>This link is incomplete. Ask for a new one.</p>
          <Link to="/forgot" style={cta}>
            Send a new link
          </Link>
        </>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label}>NEW PASSWORD</span>
            <input type={show ? 'text' : 'password'} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" style={field} aria-label="New password" />
          </label>
          {pw && <div style={{ fontSize: 12.5, color: score <= 1 ? '#A3281A' : 'var(--muted)' }}>{LABELS[score]}</div>}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label}>TYPE IT AGAIN</span>
            <input type={show ? 'text' : 'password'} autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} style={field} aria-label="Type the new password again" />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
          </label>
          {error && (
            <div role="alert" style={{ fontSize: 13, color: '#A3281A' }}>
              {error} {/expired|used/.test(error) && <Link to="/forgot">Send a new link</Link>}
            </div>
          )}
          <button type="submit" style={{ ...cta, opacity: busy ? 0.7 : 1 }} disabled={busy}>
            {busy ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </div>
  );
}
