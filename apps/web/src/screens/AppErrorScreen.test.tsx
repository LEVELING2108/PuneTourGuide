import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '../i18n';
import AppErrorScreen from './AppErrorScreen';

const renderCrash = (err: Error) => {
  function Boom(): never {
    throw err;
  }
  return render(<RouterProvider router={createMemoryRouter([{ path: '/', element: <Boom />, errorElement: <AppErrorScreen /> }])} />);
};

describe('AppErrorScreen', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => undefined));

  it('keeps the 112 call one tap away when a screen crashes', () => {
    renderCrash(new Error('kaboom'));
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Emergency? Call 112' })).toHaveAttribute('href', 'tel:112');
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });

  it('explains a stale build after a deploy', () => {
    renderCrash(new TypeError('Failed to fetch dynamically imported module: /assets/Plan-abc.js'));
    expect(screen.getByText('A new version of the app is ready. Reload to continue.')).toBeInTheDocument();
  });
});
