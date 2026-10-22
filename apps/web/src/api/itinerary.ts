import { api } from './client';

export type StopPlace = {
  id: number | null;
  name: string;
  nameMr: string | null;
  category: string | null;
  kind: string | null;
  area: string | null;
  lat: number | null;
  lng: number | null;
  weakSignal: boolean;
  xp: number;
  visitMinutes: number | null;
  /** "8:00 AM - 6:30 PM"; opensAt / closesAt in minutes after midnight (null = always open or unknown) */
  hours: string | null;
  opensAt: number | null;
  closesAt: number | null;
  hospital: { name: string; km: number | null } | null;
};

export type Stop = { id: number; time: string; order: number; done: boolean; place: StopPlace };

export type PlanDay = { id: number; day: number; label: string; date: string; weekday: string; stops: Stop[] };

export type RouteTicket = {
  id: number;
  slug: string;
  title: string;
  mode: string;
  summary: string;
  deccanTitle: string | null;
  deccanSummary: string | null;
  tone: string;
  stopCount: number;
  maxHospitalKm: number;
  weakSignal: boolean;
  stops: { placeId: number; name: string; nameMr: string | null; time: string | null }[];
};

export type TickResult = { stop: Stop; stampCollected: boolean; xpAwarded: number; totalXp?: number };

export type OptimiseResult = { day: PlanDay; minutesSaved: number; estimated: boolean };

/** A "Start Day N" trip (trip mode). `summary` is set once it has ended. */
export type DayRun = {
  id: number;
  dayId: number | null;
  dayNumber: number;
  startedAt: string;
  endedAt: string | null;
  endReason: 'user' | 'complete' | 'replaced' | 'auto' | null;
  skipped: number[];
  summary: { placesVisited: number; xpEarned: number; km: number; minutes: number } | null;
};

export const itineraryApi = {
  plan: () => api<PlanDay[]>('/itinerary'),
  addStop: (placeId: number, dayId?: number) =>
    api<{ stop: Stop; day: { id: number; day: number; weekday: string } }>('/itinerary/stops', { body: { placeId, ...(dayId ? { dayId } : {}) } }),
  removeStop: (id: number) => api<{ id: number; placeId: number | null }>(`/itinerary/stops/${id}`, { method: 'DELETE' }),
  updateStop: (id: number, patch: { done?: boolean; time?: string; dayId?: number }) =>
    api<TickResult>(`/itinerary/stops/${id}`, { method: 'PATCH', body: patch }),
  fromRoute: (routeId: number, dayId?: number) => api<PlanDay>(`/itinerary/from-route/${routeId}`, { body: dayId ? { dayId } : {} }),
  routes: () => api<RouteTicket[]>('/routes'),
  optimize: (dayId?: number) => api<OptimiseResult>('/itinerary/optimize', { body: dayId ? { dayId } : {} }),

  // Trip mode
  startDay: (dayId: number) => api<DayRun>(`/itinerary/days/${dayId}/start`, { body: {} }),
  run: () => api<DayRun | null>('/itinerary/run'),
  skip: (runId: number, stopId: number, skipped: boolean) => api<DayRun>(`/itinerary/runs/${runId}/skip`, { body: { stopId, skipped } }),
  endRun: (runId: number, reason: 'user' | 'complete') => api<DayRun>(`/itinerary/runs/${runId}/end`, { body: { reason } }),
};
