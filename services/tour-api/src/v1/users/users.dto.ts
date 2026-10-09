import type { User } from '@prisma/client';
import { levelFor } from '../../lib/levels';

/** What the app sees about its own user (never the password hash). */
export function toUserDto(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    phoneVerified: u.phoneVerified,
    avatarUrl: u.avatarUrl,
    hasPassword: !!u.password,
    hasGoogle: !!u.googleId,
    language: u.language,
    theme: u.theme as 'classic' | 'deccan',
    interests: u.interests,
    shakeToSos: u.shakeToSos,
    smsWhenOffline: u.smsWhenOffline,
    tripReminders: u.tripReminders,
    xp: u.xp,
    ...levelFor(u.xp),
    createdAt: u.createdAt,
  };
}

export type UserDto = ReturnType<typeof toUserDto>;
