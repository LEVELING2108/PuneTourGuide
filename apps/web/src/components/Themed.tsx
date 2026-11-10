import type { ComponentType, ReactNode } from 'react';
import { useTheme } from '../stores/theme';
import type { ViewProps, ViewValues } from '../views/types';

type Props = {
  classic: ComponentType<ViewProps>;
  deccan: ComponentType<ViewProps>;
  v: ViewValues;
};

/** Renders the Classic or Deccan view of a screen with the same values. */
export function Themed({ classic: Classic, deccan: Deccan, v }: Props) {
  const theme = useTheme();
  return theme === 'deccan' ? <Deccan v={v} /> : <Classic v={v} />;
}

/** Deccan-only decorations (zari border, skyline, Marathi kicker, stamps). */
export function DeccanOnly({ children }: { children: ReactNode }) {
  return useTheme() === 'deccan' ? <>{children}</> : null;
}
