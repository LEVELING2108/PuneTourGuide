import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlanDay } from '../api/itinerary';
import { usePlan } from '../features/places';
import { defaultDayId } from '../features/plan';
import { usePlanStore } from '../stores/plan';
import { DayPickerSheet, useDayPicker } from './DayPicker';

vi.mock('../features/places', () => ({ usePlan: vi.fn() }));

const day = (id: number, n: number, date: string, stops = 0) =>
  ({ id, day: n, label: `Day ${n}`, date, weekday: n === 1 ? 'Monday' : 'Tuesday', stops: Array(stops).fill({}) }) as PlanDay;
const days = [day(11, 1, '2000-01-03', 2), day(12, 2, '2000-01-04')];

describe('DayPicker', () => {
  beforeEach(() => {
    vi.mocked(usePlan).mockReturnValue({ data: days, isLoading: false, isError: false } as unknown as ReturnType<typeof usePlan>);
    usePlanStore.setState({ dayId: null });
  });

  it('starts on the remembered day, else today, else Day 1', () => {
    expect(defaultDayId(days, 12)).toBe(12);
    expect(defaultDayId(days, null)).toBe(11);
    expect(defaultDayId(days, 99)).toBe(11);
    expect(defaultDayId([], null)).toBeUndefined();
  });

  it('lists each day with its stops and focuses the remembered one', () => {
    usePlanStore.setState({ dayId: 12 });
    const onPick = vi.fn();
    const { getByRole } = render(<DayPickerSheet title="Add to which day?" detail="Shaniwar Wada" onPick={onPick} />);
    const day2 = getByRole('button', { name: /Day 2 · Tuesday/ });
    expect(day2).toHaveTextContent('Nothing planned yet');
    expect(getByRole('button', { name: /Day 1 · Monday/ })).toHaveTextContent('2 stops');
    expect(document.activeElement).toBe(day2);
    fireEvent.click(day2);
    expect(onPick).toHaveBeenCalledWith(12);
  });

  it('cancels with Escape, the backdrop or Cancel', () => {
    const onPick = vi.fn();
    const { getByRole, getByText } = render(<DayPickerSheet title="Add to which day?" onPick={onPick} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(getByText('Cancel'));
    fireEvent.click(getByRole('dialog').parentElement!);
    expect(onPick).toHaveBeenCalledTimes(3);
    expect(onPick).toHaveBeenNthCalledWith(1, null);
  });

  it('resolves the pick and remembers it for the Plan tab', async () => {
    const { result } = renderHook(() => useDayPicker());
    let answer!: Promise<number | null>;
    act(() => {
      answer = result.current.ask('Add to which day?');
    });
    const { getByRole } = render(<>{result.current.sheet}</>);
    act(() => fireEvent.click(getByRole('button', { name: /Day 2/ })));
    await expect(answer).resolves.toBe(12);
    expect(usePlanStore.getState().dayId).toBe(12);
  });
});
