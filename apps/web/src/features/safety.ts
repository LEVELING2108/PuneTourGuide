import { usePermissionStore } from '../stores/permissions';
import { useIsLoggedIn } from '../stores/auth';
import { cachedContacts, useContacts } from './contacts';

/**
 * One-line safety status for Home ("Location on · shake to SOS · 2 emergency contacts").
 * Offline packs join it in Phase 6.
 */
export function useSafetySummary() {
  const { location, motion } = usePermissionStore();
  const loggedIn = useIsLoggedIn();
  const contactsQ = useContacts();
  const n = loggedIn ? (contactsQ.data?.length ?? cachedContacts().length) : cachedContacts().length;
  const contacts = n ? `${n} emergency ${n === 1 ? 'contact' : 'contacts'}` : 'no emergency contacts yet';
  const parts = [location ? 'Location on' : null, motion ? 'shake to SOS' : null, contacts].filter(Boolean);
  return {
    summary: parts.join(' · '),
    short: n ? `${n} ${n === 1 ? 'contact' : 'contacts'}` : 'add a contact',
    contacts: n,
  };
}
