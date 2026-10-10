import { api } from './client';
import type { SessionResponse, User } from './types';

export const authApi = {
  register: (body: { name: string; email: string; password: string; acceptTerms: true; interests?: string[]; theme?: string; language?: string }) =>
    api<SessionResponse>('/auth/register', { body }),
  login: (body: { email: string; password: string }) => api<SessionResponse>('/auth/login', { body }),
  otpSend: (phone: string, channel: 'sms' | 'voice' = 'sms') =>
    api<{ sent: boolean; channel: 'sms' | 'voice'; expiresIn: number; resendIn: number; devCode?: string }>('/auth/otp/send', { body: { phone, channel } }),
  otpVerify: (phone: string, code: string) => api<SessionResponse>('/auth/otp/verify', { body: { phone, code } }),
  google: (idToken: string) => api<SessionResponse>('/auth/google', { body: { idToken } }),
  forgot: (email: string) => api<{ sent: boolean; devLink?: string }>('/auth/password/forgot', { body: { email } }),
  reset: (token: string, password: string) => api<{ reset: boolean }>('/auth/password/reset', { body: { token, password } }),
};

export type MePatch = Partial<
  Pick<User, 'name' | 'email' | 'interests' | 'language' | 'theme' | 'shakeToSos' | 'smsWhenOffline' | 'tripReminders'>
> & { acceptTerms?: true };

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
