'use client';

/**
 * Component that displays a welcome message for new users.
 * On non-large screens, it appears as a modal that can be dismissed.
 * @module WelcomeMessage
 */
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Link from 'next/link';
import { Info, Users, CircleCheckBig, Handshake, X, MousePointerClick } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Component that displays a welcome card with:
 * - Welcome message in Spanish
 * - Description about the platform's purpose
 * - "Learn More" button linking to about page
 * 
 * On non-large screens, it appears as a modal that can be dismissed.
 * On large screens, it appears as a card.
 * 
 * @returns {JSX.Element} The welcome message component
 */
export default function WelcomeMessage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Check screen size on mount and on resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint in Tailwind
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Show modal on non-large screens when component mounts
  useEffect(() => {
    if (!isLargeScreen) {
      // Check if user has dismissed the welcome message before
      const hasDismissed = localStorage.getItem('hasDismissedWelcome');
      if (!hasDismissed) {
        setIsOpen(true);
      }
    }
  }, [isLargeScreen]);

  const handleClose = () => {
    setIsOpen(false);
    // Remember that user has dismissed the welcome message
    localStorage.setItem('hasDismissedWelcome', 'true');
  };

  const welcomeContent = (
    <>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-primary">¡Bienvenido/a a Glooba!</h2>
        <p className="text-muted-foreground">
          Encuentra alternativas sostenibles de empresas y organizaciones.
        </p>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CircleCheckBig className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <span className="text-sm">Buscador de alternativas sostenibles verificadas.</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Handshake className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-sm">Productos, servicios y descuentos de empresas comprometidas.</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Users className="h-6 w-6 text-purple-500 flex-shrink-0" />
            <span className="text-sm">Sigue a empresas locales y deja tu reseña.</span>
          </div>
        </div>
        
        <Button asChild className="w-full mt-4">
          <Link href="/about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Conocer más sobre Glooba</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={handleClose}
          asChild
        >
          <Link href="/" className="flex items-center justify-center gap-2">
            <MousePointerClick className="h-4 w-4" />
            <span>Probar demo</span>
          </Link>
        </Button>
      </div>
    </>
  );

  // On large screens, show as a card
  if (isLargeScreen) {
    return (
      <Card className="mb-8">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-3xl font-bold text-primary">¡Bienvenido/a a Glooba!</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            <div className="space-y-2 mt-1">
              <p className="text-lg">
                Encuentra iniciativas sostenibles de empresas y organizaciones.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <div className="group flex items-center gap-2 p-1.5 rounded bg-muted/50 hover:bg-muted/70 transition-colors">
                  <CircleCheckBig className="h-5 w-5 text-blue-500 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Alternativas verificadas</span>
                </div>
                <div className="group flex items-center gap-2 p-1.5 rounded bg-muted/50 hover:bg-muted-70 transition-colors">
                  <Handshake className="h-5 w-5 text-green-500 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Actores locales</span>
                </div>
                <div className="group flex items-center gap-2 p-1.5 rounded bg-muted/50 hover:bg-muted-70 transition-colors">
                  <Users className="h-5 w-5 text-purple-500 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Evaluación colaborativa</span>
                </div>
                <Link
                  href="/about"
                  className="group flex items-center gap-2 p-1.5 rounded bg-muted/50 hover:bg-muted-70 transition-colors"
                >
                  <Info className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" />
                  <span className="font-medium">¡Conoce más!</span>
                </Link>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // On non-large screens, show as a modal
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden rounded-lg sm:rounded-lg">
        <div className="p-6">
          {welcomeContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
