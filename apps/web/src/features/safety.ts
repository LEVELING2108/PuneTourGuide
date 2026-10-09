import { usePermissionStore } from '../stores/permissions';

/**
 * One-line safety status for Home ("Offline pack saved · 2 emergency contacts").
 * Contacts and offline packs are added in later phases; until then it reports what is ready.
 */
export function useSafetySummary() {
  const { location, motion } = usePermissionStore();
  const parts = [location ? 'Location on' : null, motion ? 'shake to SOS' : null].filter(Boolean);
  return {
    summary: parts.length ? `${parts.join(' · ')} · SOS calls 112 even offline` : 'SOS calls 112 even offline',
    short: 'SOS works offline',
  };
}
