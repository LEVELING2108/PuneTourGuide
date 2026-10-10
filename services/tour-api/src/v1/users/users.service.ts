import sharp from 'sharp';
import { badRequest, conflict, notFound } from '../../lib/errors';
import { randomToken } from '../../lib/crypto';
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

  /**
   * Profile photo: decoded and re-encoded by sharp (rejects anything that is not really an image),
   * rotated per EXIF then stripped of all metadata, so a photo cannot leak where it was taken.
   */
  async setAvatar(userId: number, upload: Buffer) {
    let webp: Buffer;
    try {
      webp = await sharp(upload, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize(256, 256, { fit: 'cover' })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      throw badRequest('IMAGE_INVALID', 'Choose a JPEG, PNG, WebP or HEIC photo');
    }
    const key = randomToken(18);
    await usersRepo.setAvatar(userId, key, webp, `/api/v1/avatars/${key}.webp`);
    return this.me(userId);
  },

  async removeAvatar(userId: number) {
    await usersRepo.removeAvatar(userId);
    return this.me(userId);
  },

  avatar: (key: string) => usersRepo.avatarByKey(key),

  async stamps(userId: number) {
    const { rows, total, forts } = await usersRepo.stamps(userId);
    return {
      total,
      collected: rows.length,
      forts,
      stamps: rows.map((r) => ({
        placeId: r.place.id,
        name: r.place.name,
        nameMr: r.place.name_mr,
        category: r.place.category,
        kind: r.place.kind,
        estYear: r.place.estYear || null,
        collectedAt: r.collectedAt.toISOString(),
      })),
    };
  },

  async stats(userId: number) {
    const user = await usersRepo.findById(userId);
    if (!user) throw notFound('USER_NOT_FOUND', 'Account not found');
    const s = await usersRepo.stats(userId);
    return { xp: user.xp, ...levelFor(user.xp), stamps: s.stamps, savedPlaces: s.saved, placesVisited: s.visitedPlaces };
  },
};
