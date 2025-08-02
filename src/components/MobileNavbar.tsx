/**
 * Mobile navigation bar component with responsive design.
 * @module MobileNavbar
 */
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SignInButton, useAuth, useClerk, useUser } from '@clerk/nextjs';
import {
  BellIcon,
  FileText,
  HomeIcon,
  InfoIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  RssIcon,
  Shield,
  SunIcon,
  UserIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Mobile navigation bar component that displays:
 * - Theme toggle button
 * - Menu button that opens a sidebar with navigation links
 * - Navigation links include:
 *   - Home
 *   - Feed
 *   - Notifications (for authenticated users)
 *   - Profile (for authenticated users)
 *   - Sign in button (for non-authenticated users)
 *   - Sign out button (for authenticated users)
 * @returns {JSX.Element} The mobile navigation bar component
 */
function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleCloseMenu = () => setShowMobileMenu(false);

  useEffect(() => {
    if (isSignedIn) handleCloseMenu();
  }, [isSignedIn]);

  const MenuLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Button variant="ghost" className="flex items-center gap-3 justify-start w-full" asChild>
      <Link href={href} onClick={handleCloseMenu}>
        <Icon className="w-4 h-4" />
        {label}
      </Link>
    </Button>
  );

  return (
    <div className="flex md:hidden items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="mr-2"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Cambiar tema</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menú</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col space-y-4 mt-6">
            <MenuLink href="/" icon={HomeIcon} label="Inicio" />
            <MenuLink href="/feed" icon={RssIcon} label="Feed" />
            <MenuLink href="/about" icon={InfoIcon} label="Nosotros" />

            {isSignedIn ? (
              <>
                <MenuLink href="/notifications" icon={BellIcon} label="Notificaciones" />
                <MenuLink href={`/profile/${user?.username}`} icon={UserIcon} label="Perfil" />
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 justify-start w-full"
                  onClick={async () => {
                    handleCloseMenu();
                    await signOut();
                  }}
                >
                  <LogOutIcon className="w-4 h-4" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="w-full">
                  Iniciar sesión
                </Button>
              </SignInButton>
            )}

            <Link href="/enroll">
              <Button variant="outline" className="w-full">
                ¿Eres empresa?
              </Button>
            </Link>
            
            <div className="pt-4 mt-4 border-t">
              <p className="text-xs text-muted-foreground px-2 mb-2">Legal</p>
              <MenuLink href="/terms" icon={FileText} label="Términos de Servicio" />
              <MenuLink href="/privacy" icon={Shield} label="Política de Privacidad" />
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
