import { fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderGoogleButton } from '../features/google';
import { GoogleButton } from './GoogleButton';

vi.mock('../features/google', () => ({ renderGoogleButton: vi.fn() }));
const renderMock = vi.mocked(renderGoogleButton);

const setup = () => {
  const onToken = vi.fn();
  const onUnavailable = vi.fn();
  const utils = render(
    <GoogleButton context="signin" onToken={onToken} onUnavailable={onUnavailable}>
      <a href="/">Continue with Google</a>
    </GoogleButton>,
  );
  return { ...utils, onToken, onUnavailable };
};

describe('GoogleButton', () => {
  beforeEach(() => {
    renderMock.mockReset();
  });

  it('explains why when Google sign-in is unavailable', async () => {
    renderMock.mockRejectedValue(new Error("Google sign-in isn't set up yet. Use email or mobile."));
    const { getByText, onUnavailable } = setup();
    await waitFor(() => {
      fireEvent.click(getByText('Continue with Google'));
      expect(onUnavailable).toHaveBeenLastCalledWith("Google sign-in isn't set up yet. Use email or mobile.");
    });
  });

  it("swaps in Google's button and passes on the ID token", async () => {
    renderMock.mockImplementation(async (_el, o) => o.onToken('id-token'));
    const { queryByText, onToken } = setup();
    await waitFor(() => expect(queryByText('Continue with Google')).toBeNull());
    expect(onToken).toHaveBeenCalledWith('id-token');
    expect(renderMock.mock.calls[0][1]).toMatchObject({ context: 'signin' });
  });
});
