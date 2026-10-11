import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactsApi, type Contact, type ContactInput } from '../api/contacts';
import { useIsLoggedIn } from '../stores/auth';

/**
 * Contacts kept on the device so SOS can still text the primary contact with no network
 * (FEATURES: sign-out keeps contacts cached). Name + number only.
 */
const CACHE_KEY = 'pe_sos_contacts';

export type CachedContact = { name: string; phone: string; isPrimary: boolean };

export function cachedContacts(): CachedContact[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const list = raw ? (JSON.parse(raw) as CachedContact[]) : [];
    return Array.isArray(list) ? list.filter((c) => typeof c.phone === 'string' && typeof c.name === 'string') : [];
  } catch {
    return [];
  }
}

/** Account deleted: the device copy of the contacts goes too (signing out keeps it for SOS). */
export function forgetCachedContacts() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* blocked storage: nothing was kept */
  }
}

function cache(list: Contact[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list.map((c) => ({ name: c.name, phone: c.phone, isPrimary: c.isPrimary }))));
  } catch {
    /* storage full or blocked: SOS still dials 112 */
  }
}

export function useContacts() {
  const loggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const list = await contactsApi.list();
      cache(list);
      return list;
    },
    enabled: loggedIn,
    staleTime: 5 * 60_000,
  });
}

export function useSaveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id?: number; body: ContactInput }) => (p.id ? contactsApi.update(p.id, p.body) : contactsApi.create(p.body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useRemoveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

/** Contact Picker API (Android Chrome). Returns null where unsupported or cancelled. */
export async function pickPhoneContact(): Promise<{ name: string; phone: string } | null> {
  type Picker = { select: (props: string[], opts: { multiple: boolean }) => Promise<{ name?: string[]; tel?: string[] }[]> };
  const picker = (navigator as unknown as { contacts?: Picker }).contacts;
  if (!picker?.select) return null;
  try {
    const [c] = await picker.select(['name', 'tel'], { multiple: false });
    if (!c?.tel?.[0]) return null;
    return { name: c.name?.[0] ?? '', phone: c.tel[0] };
  } catch {
    return null;
  }
}

export const canPickContacts = () => typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;
