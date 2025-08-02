/**
 * Desktop navigation bar component with responsive design.
 * @module DesktopNavbar
 */
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { BellIcon, HomeIcon, RssIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import ModeToggle from "./ModeToggle";

/**
 * Desktop navigation bar component that displays:
 * - Mode toggle (light/dark theme)
 * - Home button
 * - Feed button
 * - Notifications button (for authenticated users)
 * - Profile button (for authenticated users)
 * - Sign in button (for non-authenticated users)
 * @returns {JSX.Element} The desktop navigation bar component
 */
async function DesktopNavbar() {
  const user = await currentUser();

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Inicio</span>
        </Link>
      </Button>

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/feed">
          <RssIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Feed</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notificaciones</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href={`/profile/${user.username}`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Perfil</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Iniciar sesión</Button>
        </SignInButton>
      )}

      <Button variant="outline" className="flex items-center gap-2" asChild>
        <Link href="/enroll">
          <span className="hidden lg:inline">¿Eres empresa?</span>
        </Link>
      </Button>
    </div>
  );
}

export default DesktopNavbar;
