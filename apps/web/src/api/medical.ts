import { api } from './client';

export type Medical = {
  bloodGroup: string | null;
  allergies: string;
  medicines: string;
  notes: string;
  showOnLockScreen: boolean;
  updatedAt: string | null;
  saved: boolean;
};

export type MedicalInput = Omit<Medical, 'updatedAt' | 'saved'>;

export const medicalApi = {
  get: () => api<Medical>('/medical'),
  put: (body: MedicalInput) => api<Medical>('/medical', { method: 'PUT', body }),
  remove: () => api<{ removed: boolean }>('/medical', { method: 'DELETE' }),
};
