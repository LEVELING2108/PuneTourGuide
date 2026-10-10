export type User = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  phoneVerified: boolean;
  avatarUrl: string | null;
  hasPassword: boolean;
  termsAccepted: boolean;
  hasGoogle: boolean;
  language: string;
  theme: 'classic' | 'deccan';
  interests: string[];
  shakeToSos: boolean;
  smsWhenOffline: boolean;
  tripReminders: boolean;
  xp: number;
  level: number;
  levelName: string;
  nextLevelName: string | null;
  xpToNext: number;
  progress: number;
  createdAt: string;
};

export type SessionResponse = {
  user: User;
  accessToken: string;
  isNewUser: boolean;
};
