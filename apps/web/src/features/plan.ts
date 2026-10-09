import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itineraryApi, type PlanDay } from '../api/itinerary';
import { useAuthStore } from '../stores/auth';

/** Today's date in Pune as YYYY-MM-DD (matches PlanDay.date). */
export const puneTodayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

const setStopDone = (days: PlanDay[] | undefined, stopId: number, done: boolean) =>
  days?.map((d) => ({ ...d, stops: d.stops.map((s) => (s.id === stopId ? { ...s, done } : s)) }));

/** Tick / untick a stop. Optimistic; the server awards XP + stamp once per place. */
export function useTickStop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { stopId: number; done: boolean }) => itineraryApi.updateStop(p.stopId, { done: p.done }),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: ['itinerary'] });
      const before = qc.getQueryData<PlanDay[]>(['itinerary']);
      qc.setQueryData<PlanDay[]>(['itinerary'], (old) => setStopDone(old, p.stopId, p.done));
      return { before };
    },
    onError: (_e, _p, ctx) => qc.setQueryData(['itinerary'], ctx?.before),
    onSuccess: (r) => {
      const { user, setUser } = useAuthStore.getState();
      if (user && r.totalXp !== undefined) setUser({ ...user, xp: r.totalXp });
      if (r.stampCollected) qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/** Optimise a day's order; the response carries the reordered day. */
export function useOptimiseDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dayId: number) => itineraryApi.optimize(dayId),
    onSuccess: (r) => qc.setQueryData<PlanDay[]>(['itinerary'], (old) => old?.map((d) => (d.id === r.day.id ? r.day : d))),
  });
}
