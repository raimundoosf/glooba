/**
 * Theme toggle button component that switches between light and dark modes.
 * @module ModeToggle
 */
'use client';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

/**
 * Theme toggle button that:
 * - Displays a sun icon in dark mode
 * - Displays a moon icon in light mode
 * - Animates the transition between modes
 * - Provides accessibility with screen reader text
 * @returns {JSX.Element} The theme toggle button component
 */
export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
