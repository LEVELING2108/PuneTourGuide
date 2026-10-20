import { describe, expect, it } from 'vitest';
import { googlePhotoUrl } from '../api/google';
import { photoCredit, ratingText } from './googlePlaces';

describe('google places text', () => {
  it('formats ratings and photo credits', () => {
    expect(ratingText(4.62, 71181)).toBe('★ 4.6 · 71,181 reviews');
    expect(ratingText(5, 1)).toBe('★ 5.0 · 1 review');
    expect(ratingText(null, 10)).toBeNull();
    expect(photoCredit({ name: 'p', authors: [{ name: 'A', uri: null }, { name: 'B', uri: null }] })).toBe('Photo: A, B');
    expect(photoCredit({ name: 'p', authors: [] })).toBeNull();
  });

  it('builds photo URLs through our server, never with a key', () => {
    const url = googlePhotoUrl({ name: 'places/ChIJ123/photos/Abc', authors: [] }, 336.4);
    expect(url).toBe('/api/v1/google/photo?name=places%2FChIJ123%2Fphotos%2FAbc&w=336');
    expect(url).not.toMatch(/key=/i);
  });
});
