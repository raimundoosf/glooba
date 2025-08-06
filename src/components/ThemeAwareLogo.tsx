'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeAwareLogo() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Evita hidratación no coincidente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <img 
        src="/glooba.png" 
        alt="Glooba logo" 
        className="h-8" 
      />
    );
  }

  return (
    <img 
      src={resolvedTheme === 'dark' ? '/glooba-whiteText.png' : '/glooba.png'} 
      alt="Glooba logo" 
      className="h-8" 
    />
  );
}
