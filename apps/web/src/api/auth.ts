import { api } from './client';
import type { SessionResponse, User } from './types';

export const authApi = {
  register: (body: { name: string; email: string; password: string; acceptTerms: true; interests?: string[]; theme?: string; language?: string }) =>
    api<SessionResponse>('/auth/register', { body }),
  login: (body: { email: string; password: string }) => api<SessionResponse>('/auth/login', { body }),
};

export type MePatch = Partial<
  Pick<User, 'name' | 'email' | 'interests' | 'language' | 'theme' | 'shakeToSos' | 'smsWhenOffline' | 'tripReminders'>
>;

export const usersApi = {
  me: () => api<User>('/users/me'),
  update: (patch: MePatch) => api<User>('/users/me', { method: 'PATCH', body: patch }),
  uploadAvatar: (image: Blob) => api<User>('/users/me/avatar', { blob: image }),
  removeAvatar: () => api<User>('/users/me/avatar', { method: 'DELETE' }),
  stamps: () =>
    api<{
      total: number;
      collected: number;
      forts: number;
      stamps: { placeId: number; name: string; nameMr: string | null; category: string; kind: string | null; estYear: string | null; collectedAt: string }[];
    }>('/users/me/stamps'),
  stats: () => api<{ xp: number; level: number; levelName: string; stamps: number; placesVisited: number; savedPlaces: number }>('/users/me/stats'),
};
