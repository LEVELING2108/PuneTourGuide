import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/auth';
import { googleApi, type GooglePhoto, type Spot } from '../api/google';
import { useAuthStore } from '../stores/auth';

// Kept only in memory for this session (Google's terms forbid storing it); the server sends no-store
const SESSION = { staleTime: 10 * 60_000, gcTime: 30 * 60_000, retry: 1 } as const;

export const useGooglePlace = (id: number | null) =>
  useQuery({ queryKey: ['google', 'place', id], queryFn: () => googleApi.place(id!), enabled: !!id, ...SESSION });

export const useGoogleNearby = (id: number | null) =>
  useQuery({ queryKey: ['google', 'nearby', id], queryFn: () => googleApi.nearby(id!), enabled: !!id, ...SESSION });

export const useSpot = (googleId: string | null) =>
  useQuery({ queryKey: ['google', 'spot', googleId], queryFn: () => googleApi.spot(googleId!), enabled: !!googleId, ...SESSION });

/** "★ 4.6 · 71,181 reviews" */
export const ratingText = (rating: number | null, count: number | null) =>
  rating === null ? null : `★ ${rating.toFixed(1)}${count ? ` · ${count.toLocaleString('en-IN')} ${count === 1 ? 'review' : 'reviews'}` : ''}`;

/** "Photo: A Photographer" (Google requires the author's name with each photo). */
export const photoCredit = (photo: GooglePhoto | null) => (photo?.authors.length ? `Photo: ${photo.authors.map((a) => a.name).join(', ')}` : null);

/** Side quest done: +XP once; refresh the spot, the rows that show it and the user's XP. */
export function useVisitSpot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (googleId: string) => googleApi.visitSpot(googleId),
    onSuccess: (r) => {
      const mark = (s: Spot) => (s.googleId === r.googleId ? { ...s, visitedAt: r.visitedAt } : s);
      qc.setQueriesData<Awaited<ReturnType<typeof googleApi.nearby>>>({ queryKey: ['google', 'nearby'] }, (old) =>
        old?.available ? { ...old, sideQuests: old.sideQuests.map(mark), food: old.food.map(mark) } : old
      );
      qc.setQueryData<Awaited<ReturnType<typeof googleApi.spot>>>(['google', 'spot', r.googleId], (old) => (old?.available ? { ...old, visitedAt: r.visitedAt } : old));
      const { user, setUser } = useAuthStore.getState();
      if (user) setUser({ ...user, xp: r.totalXp });
      if (r.firstVisit) usersApi.me().then(setUser, () => undefined);
      qc.invalidateQueries({ queryKey: ['stamps'] });
    },
  });
}
