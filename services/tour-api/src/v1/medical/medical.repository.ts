import { prisma } from '../../lib/prisma';

export type MedicalRow = {
  bloodGroup: string | null;
  allergiesEnc: string | null;
  medicinesEnc: string | null;
  notesEnc: string | null;
  showOnLockScreen: boolean;
};

export const medicalRepo = {
  get: (userId: number) =>
    prisma.medicalProfile.findUnique({
      where: { userId },
      select: { bloodGroup: true, allergiesEnc: true, medicinesEnc: true, notesEnc: true, showOnLockScreen: true, updatedAt: true },
    }),

  upsert: (userId: number, data: MedicalRow) =>
    prisma.medicalProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data, select: { updatedAt: true } }),

  remove: (userId: number) => prisma.medicalProfile.deleteMany({ where: { userId } }),
};
