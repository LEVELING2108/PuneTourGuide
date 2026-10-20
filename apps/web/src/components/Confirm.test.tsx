import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useConfirm } from './Confirm';

describe('useConfirm', () => {
  it('resolves true on confirm and false on cancel or Escape', async () => {
    const { result } = renderHook(() => useConfirm());
    const ask = () => result.current.ask({ title: 'Did you visit Sinhagad Fort?', confirm: 'Yes, I visited' });

    let answer!: Promise<boolean>;
    act(() => {
      answer = ask();
    });
    const first = render(<>{result.current.sheet}</>);
    expect(first.getByRole('dialog', { name: 'Did you visit Sinhagad Fort?' })).toBeInTheDocument();
    expect(document.activeElement).toBe(first.getByRole('button', { name: 'Yes, I visited' }));
    act(() => fireEvent.click(first.getByRole('button', { name: 'Yes, I visited' })));
    await expect(answer).resolves.toBe(true);
    first.unmount();

    act(() => {
      answer = ask();
    });
    const second = render(<>{result.current.sheet}</>);
    act(() => fireEvent.click(second.getByRole('button', { name: 'Cancel' })));
    await expect(answer).resolves.toBe(false);
    second.unmount();

    act(() => {
      answer = ask();
    });
    render(<>{result.current.sheet}</>);
    act(() => fireEvent.keyDown(window, { key: 'Escape' }));
    await expect(answer).resolves.toBe(false);
  });
});
