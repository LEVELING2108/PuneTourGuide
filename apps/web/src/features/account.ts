import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../stores/auth';

/**
 * For screens that belong to an account (plan, contacts, medical, profile): once the session
 * has been restored on app start, send guests to log in and back here afterwards.
 * Waiting for `ready` matters: on a fresh load (a bookmark, a shared link) the session is
 * restored from the refresh cookie a moment after the first render.
 */
export function useAccountRequired() {
  const ready = useAuthStore((s) => s.ready);
  const loggedIn = useAuthStore((s) => !!s.user);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (ready && !loggedIn) navigate(`/login?next=${encodeURIComponent(pathname + search)}`, { replace: true });
  }, [ready, loggedIn, navigate, pathname, search]);
  return loggedIn;
}
