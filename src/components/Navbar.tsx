/**
 * Main navigation bar component that combines desktop and mobile versions.
 * @module Navbar
 */
import Link from 'next/link';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import ThemeAwareLogo from './ThemeAwareLogo';

/**
 * Main navigation bar component that displays:
 * - Logo and site title
 * - Desktop navigation bar (for larger screens)
 * - Mobile navigation bar (for smaller screens)
 * @returns {JSX.Element} The main navigation bar component
 */
async function Navbar() {
  return (
    <nav className="sticky top-0 w-full border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <ThemeAwareLogo />
            </Link>
          </div>

          {/* Navigation Sections */}
          <div className="hidden md:flex">
            <DesktopNavbar />
          </div>

          <div className="flex md:hidden">
            <MobileNavbar />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
