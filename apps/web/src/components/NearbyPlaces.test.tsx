import { act, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { shortKmText, travelText } from '../features/places';
import { NearbyPlaces, type NearbyCard } from './NearbyPlaces';

const card = (over: Partial<NearbyCard> = {}): NearbyCard => ({
  key: 1,
  name: 'Lal Mahal',
  label: 'Heritage',
  tone: '#26303B',
  distance: '350 m away',
  travel: '~6 min walk',
  status: 'Open now',
  closed: false,
  href: '/place/1',
  added: false,
  addLabel: 'Add Lal Mahal to plan',
  toggle: vi.fn(),
  ...over,
});

const renderRows = (props: Partial<Parameters<typeof NearbyPlaces>[0]>) =>
  render(
    <MemoryRouter>
      <NearbyPlaces sections={[]} loading={false} emptyText={null} mapHref="/map?layer=places&at=18.5195,73.8553" {...props} />
    </MemoryRouter>
  );

describe('nearby text', () => {
  it('shows metres under 1 km and a rough walk or drive time', () => {
    expect(shortKmText(0.34)).toBe('350 m');
    expect(shortKmText(0.01)).toBe('50 m');
    expect(shortKmText(2.4)).toBe('2.4 km');
    expect(travelText(0.5)).toBe('~8 min walk');
    expect(travelText(1.5)).toBe('~24 min walk');
    expect(travelText(8.5)).toBe('~32 min drive');
  });
});

describe('NearbyPlaces', () => {
  it('shows each row with cards that open the place and add it to the plan', () => {
    const c = card();
    const { getByRole, getByText, queryByText } = renderRows({
      sections: [
        { key: 'places', title: 'Also nearby', items: [c] },
        { key: 'food', title: 'Food nearby', items: [] },
      ],
    });
    expect(getByRole('heading', { name: 'Also nearby' })).toBeInTheDocument();
    expect(queryByText('Food nearby')).toBeNull(); // empty rows are hidden
    expect(getByRole('link', { name: /Lal Mahal/ })).toHaveAttribute('href', '/place/1');
    expect(getByRole('link', { name: 'See on map' })).toHaveAttribute('href', '/map?layer=places&at=18.5195,73.8553');
    expect(getByText(/~6 min walk/)).toHaveTextContent('· Open now');
    fireEvent.click(getByRole('button', { name: 'Add Lal Mahal to plan' }));
    expect(c.toggle).toHaveBeenCalled();
  });

  it('says so when nothing is close by, and shows nothing while it has no answer', () => {
    expect(renderRows({ emptyText: 'No other places close by.' }).getByText('No other places close by.')).toBeInTheDocument();
    expect(renderRows({}).container).toBeEmptyDOMElement();
  });

  it('shows placeholders while loading', () => {
    const { container } = renderRows({ loading: true });
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('shows Google spots with a photo and rating, and no add button', () => {
    const { getByRole, queryByRole, getByText, container } = renderRows({
      sections: [{ key: 'quests', title: 'Side quests', items: [card({ key: 'ChIJ-sunrise', name: 'Sunrise Point', photoUrl: '/api/v1/google/photo?name=x', rating: '★ 4.7 · 607 reviews', toggle: undefined, done: true })] }],
      attribution: 'Places, ratings and photos: Google Maps',
      label: 'Side quests and food',
      mapHref: undefined,
    });
    expect(getByRole('region', { name: 'Side quests and food' })).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/api/v1/google/photo?name=x');
    expect(getByText('★ 4.7 · 607 reviews')).toBeInTheDocument();
    expect(getByText(/✓ Done/)).toBeInTheDocument();
    expect(queryByRole('button')).toBeNull();
    expect(queryByRole('link', { name: 'See on map' })).toBeNull();
    expect(getByText('Places, ratings and photos: Google Maps')).toBeInTheDocument();
  });

  it('fetches a photo only once its card is on screen', () => {
    let show: (seen: boolean) => void = () => undefined;
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
          show = (seen) => cb([{ isIntersecting: seen }]);
        }
        observe = observe;
        disconnect = vi.fn();
      }
    );
    try {
      const { container } = renderRows({
        sections: [{ key: 'quests', title: 'Side quests', items: [card({ key: 'ChIJ-far', photoUrl: '/api/v1/google/photo?name=far', toggle: undefined })] }],
        mapHref: undefined,
      });
      expect(observe).toHaveBeenCalled();
      expect(container.querySelector('img')).toBeNull();
      act(() => show(false));
      expect(container.querySelector('img')).toBeNull();
      act(() => show(true));
      expect(container.querySelector('img')).toHaveAttribute('src', '/api/v1/google/photo?name=far');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
