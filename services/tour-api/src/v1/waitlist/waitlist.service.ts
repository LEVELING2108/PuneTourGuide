import { waitlistRepo } from './waitlist.repository';

export const waitlistService = {
  /**
   * Always the same answer, whether the email was new or already listed, so the form cannot be
   * used to find out who signed up.
   */
  async join(email: string) {
    await waitlistRepo.add(email);
    return { joined: true };
  },
};
