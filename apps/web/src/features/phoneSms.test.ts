import { describe, expect, it } from 'vitest';
import { medicalSummary, serverSms, smsHref, sosText, testText, trackLink } from './phoneSms';

const body = (href: string) => decodeURIComponent(href.slice(href.indexOf('body=') + 5));

describe('texts from the phone', () => {
  it('opens the messaging app with every contact and the text filled in', () => {
    const android = smsHref(['+91 98765 43210', '+919876500000'], 'SOS: help & call');
    expect(android).toBe(`sms:+919876543210,+919876500000?&body=${encodeURIComponent('SOS: help & call')}`);
    expect(body(android)).toBe('SOS: help & call');
    // iPhone needs its own form for several recipients; one recipient works with the usual one
    expect(smsHref(['+919876543210', '+919876500000'], 'x', true)).toBe('sms://open?addresses=+919876543210,+919876500000&body=x');
    expect(smsHref(['+919876543210'], 'x', true)).toBe('sms:+919876543210?&body=x');
  });

  it('matches the server alert: live link, map pin from GPS, hospital, medical, 112', () => {
    const text = sosText({
      link: trackLink('abc-123'),
      at: { lat: 18.519512, lng: 73.855321 },
      hospital: { name: 'Surya Sahyadri Hospital', km: 0.2 },
      medical: 'blood group B+',
    });
    expect(text).toBe(
      `SOS: I need help now. Live location: ${window.location.origin}/track/abc-123 Map: https://maps.google.com/?q=18.51951,73.85532 Nearest hospital: Surya Sahyadri Hospital (0.2 km). Call me, or 112. Medical: blood group B+`
    );
  });

  it('still says something useful with no data and no GPS', () => {
    expect(sosText({ link: null, at: null })).toBe('SOS: I need help now. I could not get my location. Call me, or 112.');
  });

  it('shares medical details under the same rule as the server', () => {
    const m = { bloodGroup: 'O-', allergies: ' penicillin ', medicines: '', showOnLockScreen: false };
    expect(medicalSummary(m)).toBe('blood group O-');
    expect(medicalSummary({ ...m, showOnLockScreen: true })).toBe('blood group O-; allergies: penicillin');
    expect(medicalSummary({ ...m, bloodGroup: null })).toBeNull();
    expect(medicalSummary(null)).toBeNull();
  });

  it('marks the test text as a test, and keeps server texts off by default', () => {
    expect(testText()).toMatch(/^TEST - no action needed/);
    expect(serverSms()).toBe(false);
  });
});
