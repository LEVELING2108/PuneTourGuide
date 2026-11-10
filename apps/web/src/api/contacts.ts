import { api } from './client';

export type Contact = {
  id: number;
  name: string;
  relation: string;
  /** E.164 */
  phone: string;
  phoneDisplay: string;
  isPrimary: boolean;
};

export type ContactInput = { name: string; relation: string; phone: string; isPrimary?: boolean };

export const contactsApi = {
  list: () => api<Contact[]>('/contacts'),
  create: (body: ContactInput) => api<Contact>('/contacts', { body }),
  update: (id: number, body: Partial<ContactInput>) => api<Contact>(`/contacts/${id}`, { method: 'PATCH', body }),
  remove: (id: number) => api<{ id: number }>(`/contacts/${id}`, { method: 'DELETE' }),
  testAlert: () => api<{ sentTo: string[] }>('/contacts/test-alert', { body: {} }),
};
