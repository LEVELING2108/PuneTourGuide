import { googleDirectionsUrl, googlePlaceUrl } from './googleMaps';

describe('Google Maps hand-off', () => {
  it('opens the place listing by name in Pune', () => {
    expect(googlePlaceUrl({ name: 'Aga Khan Palace', area: 'Kalyani Nagar' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=Aga%20Khan%20Palace%2C%20Kalyani%20Nagar%2C%20Pune'
    );
  });

  it('starts navigation in the matching travel mode (auto follows car roads)', () => {
    expect(googleDirectionsUrl({ lat: 18.5523, lng: 73.9015 }, 'walk')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=18.552300,73.901500&travelmode=walking'
    );
    expect(googleDirectionsUrl({ lat: 18.5523, lng: 73.9015 }, 'auto')).toContain('travelmode=driving');
  });
});
