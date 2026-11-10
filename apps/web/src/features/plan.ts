import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/auth';
import { itineraryApi, type PlanDay } from '../api/itinerary';
import { useAuthStore } from '../stores/auth';

/** Today's date in Pune as YYYY-MM-DD (matches PlanDay.date). */
export const puneTodayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

/** The day to start on: the one last viewed or added to, else today's, else Day 1. */
export function defaultDayId(days: PlanDay[], remembered: number | null) {
  return (days.find((d) => d.id === remembered) ?? days.find((d) => d.date === puneTodayIso()) ?? days[0])?.id;
}

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
      if (r.stampCollected) {
        // Level, progress and the passport change with XP: take the server's numbers
        usersApi.me().then(setUser, () => undefined);
        qc.invalidateQueries({ queryKey: ['stamps'] });
        qc.invalidateQueries({ queryKey: ['stats'] });
      }
    },
  });
}

/** Move a stop to the end of another day. */
export function useMoveStop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { stopId: number; dayId: number }) => itineraryApi.updateStop(p.stopId, { dayId: p.dayId }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['itinerary'] }),
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
