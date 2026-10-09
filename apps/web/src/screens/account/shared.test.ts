import { describe, expect, it } from 'vitest';
import { passwordScore } from './shared';

describe('passwordScore', () => {
  it('is 0 for an empty password', () => {
    expect(passwordScore('')).toBe(0);
  });

  it('caps short passwords at "too weak"', () => {
    expect(passwordScore('Ab1!')).toBe(1);
  });

  it('rewards length, digits, capitals and symbols', () => {
    expect(passwordScore('longenough')).toBe(1);
    expect(passwordScore('longenough1')).toBe(2);
    expect(passwordScore('Longenough1')).toBe(3);
    expect(passwordScore('Longenough1!')).toBe(4);
  });
});
