/**
 * Theme provider component that manages the application's theme settings.
 * @module ThemeProvider
 */
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

/**
 * Props interface for the ThemeProvider component
 * @interface ThemeProviderProps
 */
export interface ThemeProviderProps extends React.ComponentProps<typeof NextThemesProvider> {}

/**
 * Component that wraps the application with theme provider functionality.
 * @param {ThemeProviderProps} props - Component props
 * @returns {JSX.Element} The theme provider component
 */
export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
