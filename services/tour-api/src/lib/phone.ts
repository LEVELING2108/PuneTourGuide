/** Normalise an Indian (default) or international number to E.164, or null if invalid. */
export function toE164(raw: string, defaultCountry = '91'): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  // 10-digit Indian mobile, optionally with a leading 0
  const local = digits.replace(/^0/, '');
  if (defaultCountry === '91' && /^[6-9]\d{9}$/.test(local)) return `+91${local}`;
  if (defaultCountry === '91' && /^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

/** +919876543210 -> +91 98XXX X3210 (for logs and other users). */
export function maskPhone(e164: string): string {
  const m = e164.match(/^\+91(\d{2})\d{4}(\d{4})$/);
  if (m) return `+91 ${m[1]}XXX X${m[2].slice(1)}`;
  return e164.length > 6 ? `${e164.slice(0, 3)}${'X'.repeat(e164.length - 6)}${e164.slice(-3)}` : 'XXX';
}

/** +919876543210 -> "98765 43210" for display to the owner. */
export function formatIndian(e164: string): string {
  const m = e164.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `${m[1]} ${m[2]}` : e164;
}
