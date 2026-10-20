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
};
