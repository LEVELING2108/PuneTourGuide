import { decrypt, encrypt } from '../../lib/crypto';
import { medicalRepo } from './medical.repository';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export type MedicalInput = {
  bloodGroup: (typeof BLOOD_GROUPS)[number] | null;
  allergies: string;
  medicines: string;
  notes: string;
  showOnLockScreen: boolean;
};

const seal = (v: string) => (v.trim() ? encrypt(v.trim()) : null);
const open = (v: string | null) => {
  if (!v) return '';
  try {
    return decrypt(v);
  } catch {
    return ''; // key rotated or corrupt: never fail the screen over it
  }
};

/** TECH_DESIGN §9.8: free text encrypted at rest (AES-256-GCM); only the owner reads it back. */
export const medicalService = {
  async get(userId: number) {
    const m = await medicalRepo.get(userId);
    if (!m) return { bloodGroup: null, allergies: '', medicines: '', notes: '', showOnLockScreen: true, updatedAt: null, saved: false };
    return {
      bloodGroup: m.bloodGroup,
      allergies: open(m.allergiesEnc),
      medicines: open(m.medicinesEnc),
      notes: open(m.notesEnc),
      showOnLockScreen: m.showOnLockScreen,
      updatedAt: m.updatedAt.toISOString(),
      saved: true,
    };
  },

  async put(userId: number, input: MedicalInput) {
    const r = await medicalRepo.upsert(userId, {
      bloodGroup: input.bloodGroup,
      allergiesEnc: seal(input.allergies),
      medicinesEnc: seal(input.medicines),
      notesEnc: seal(input.notes),
      showOnLockScreen: input.showOnLockScreen,
    });
    return { ...(await this.get(userId)), updatedAt: r.updatedAt.toISOString() };
  },

  async remove(userId: number) {
    await medicalRepo.remove(userId);
    return { removed: true };
  },
};
