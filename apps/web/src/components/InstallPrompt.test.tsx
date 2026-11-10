import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstallPrompt } from './InstallPrompt';

describe('InstallPrompt', () => {
  it('stays hidden unless the old icon sent the person here', () => {
    render(<InstallPrompt asked={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('asks to install again, with how-to steps when the browser has no install dialog', () => {
    render(<InstallPrompt asked />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Install Pune Explorer again')).toBeTruthy();
    expect(screen.getByText(/app\.puneexplorer\.dev/)).toBeTruthy();
    expect(screen.getByText(/Add to Home/)).toBeTruthy();
  });
});
