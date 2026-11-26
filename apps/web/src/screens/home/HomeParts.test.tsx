import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DayRoute } from './HomeParts';

const route = (n: number, current: number) => ({ done: Array.from({ length: n }, (_, i) => i < current), current });

describe('DayRoute', () => {
  it('draws a dot per stop on short days', () => {
    const { container, getByText } = render(<DayRoute route={route(4, 1)} />);
    expect(container.querySelector('[data-route="dots"]')).not.toBeNull();
    expect(getByText('Stop 2 of 4')).toBeTruthy();
  });

  it('draws a filled bar on long days instead of hiding the line', () => {
    const { container, getByText } = render(<DayRoute route={route(7, 2)} />);
    const bar = container.querySelector('[data-route="bar"]');
    expect(bar).not.toBeNull();
    expect((bar!.firstElementChild as HTMLElement).style.width).toBe(`${(2 / 6) * 100}%`);
    expect(container.querySelector('[data-route="dots"]')).toBeNull();
    expect(getByText('Stop 3 of 7')).toBeTruthy();
  });

  it('shows only the count for a single stop, and nothing without a plan', () => {
    const one = render(<DayRoute route={route(1, 0)} />);
    expect(one.container.querySelector('[data-route]')).toBeNull();
    expect(one.getByText('Stop 1 of 1')).toBeTruthy();
    expect(render(<DayRoute route={null} />).container.innerHTML).toBe('');
  });
});
