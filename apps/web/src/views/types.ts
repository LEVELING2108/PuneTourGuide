import type { ReactNode } from 'react';

/** Values a screen hook hands to its view (the mockups' renderVals()). */
export type ViewValues = Record<string, any> & { underlay?: ReactNode };

export type ViewProps = { v: ViewValues };
