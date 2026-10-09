import { conflict, notFound } from '../../lib/errors';
import { levelFor } from '../../lib/levels';
import { toUserDto } from './users.dto';
import { usersRepo } from './users.repository';
import type { UpdateMeInput } from './users.schemas';

export const usersService = {
  async me(userId: number) {
    const user = await usersRepo.findById(userId);
    if (!user) throw notFound('USER_NOT_FOUND', 'Account not found');
    return toUserDto(user);
  },

  async updateMe(userId: number, patch: UpdateMeInput) {
    if (patch.email) {
      const owner = await usersRepo.findByEmail(patch.email);
      if (owner && owner.id !== userId) throw conflict('EMAIL_TAKEN', 'That email is already used by another account');
    }
    const user = await usersRepo.update(userId, patch);
    return toUserDto(user);
  },

  async setAvatar(userId: number, avatarUrl: string | null) {
    return toUserDto(await usersRepo.update(userId, { avatarUrl }));
  },

  async stats(userId: number) {
    const user = await usersRepo.findById(userId);
    if (!user) throw notFound('USER_NOT_FOUND', 'Account not found');
    const s = await usersRepo.stats(userId);
    return { xp: user.xp, ...levelFor(user.xp), stamps: s.stamps, savedPlaces: s.saved, placesVisited: s.visitedPlaces };
  },
};
