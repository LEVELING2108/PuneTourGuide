import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/auth';
import { useContacts } from './contacts';
import { namesText } from './live';
import { useOffline } from './offline';
import { useIsLoggedIn, useUser } from '../stores/auth';
import { useSettingsStore } from '../stores/settings';
import { useTheme } from '../stores/theme';
import { initials } from '../lib/text';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', mr: 'मराठी', hi: 'हिन्दी', gu: 'ગુજરાતી', as: 'Assamese', bn: 'Bengali', brx: 'Bodo', doi: 'Dogri', kn: 'Kannada',
  ks: 'Kashmiri', kok: 'Konkani', mai: 'Maithili', ml: 'Malayalam', mni: 'Manipuri', ne: 'Nepali', or: 'Odia', pa: 'Punjabi',
  sa: 'Sanskrit', sat: 'Santali', sd: 'Sindhi', ta: 'Tamil', te: 'Telugu', ur: 'Urdu',
};
export const languageName = (code: string) => LANGUAGE_NAMES[code] ?? code;

/** Everything the profile / settings / passport screens show about you, from real data. */
export function useProfileSummary() {
  const user = useUser();
  const loggedIn = useIsLoggedIn();
  const theme = useTheme();
  const language = useSettingsStore((s) => s.language);
  const contactsQ = useContacts();
  const statsQ = useQuery({ queryKey: ['stats'], queryFn: usersApi.stats, enabled: loggedIn, staleTime: 60_000 });
  const stampsQ = useQuery({ queryKey: ['stamps'], queryFn: usersApi.stamps, enabled: loggedIn, staleTime: 60_000 });
  const saved = useOffline((s) => s.saved);

  const contacts = contactsQ.data ?? [];
  const stats = statsQ.data;
  const forts = stampsQ.data?.forts ?? 0;
  const since = user ? new Date(user.createdAt).getFullYear() : null;

  return {
    user,
    loggedIn,
    name: user?.name ?? 'Guest traveller',
    initials: user ? initials(user.name) : 'G',
    avatarUrl: user?.avatarUrl ?? null,
    since: user ? `Exploring Pune since ${since}` : 'Log in to keep your plan, contacts and medical info',
    level: user?.level ?? 1,
    levelName: user?.levelName ?? 'Newcomer',
    xp: user?.xp ?? 0,
    xpText: `${(user?.xp ?? 0).toLocaleString('en-IN')} XP`,
    levelPct: `${Math.round((user?.progress ?? 0) * 100)}%`,
    toNextText: user?.nextLevelName ? `${user.xpToNext} XP to ${user.nextLevelName}` : user ? 'Top level reached' : 'Collect stamps to level up',
    statsText: stats
      ? [`${stats.placesVisited} ${stats.placesVisited === 1 ? 'place' : 'places'}`, `${forts} ${forts === 1 ? 'fort' : 'forts'}`, `${stats.savedPlaces} saved`].join(' · ')
      : 'Tick places in your plan to collect stamps',
    contactsText: contacts.length ? namesText(contacts.map((c) => c.name)) : loggedIn ? 'Add someone to alert in an SOS' : 'Log in to add contacts',
    contactsCount: contacts.length,
    offlineText: saved.length ? `${saved.length} saved · ${namesText(saved.map((p) => p.name.replace(/ (Fort|peths)$/, '')))}` : 'None saved yet',
    languageText: languageName(language),
    themeText: theme === 'deccan' ? 'Deccan' : 'Classic',
    stamps: stampsQ.data,
  };
}
