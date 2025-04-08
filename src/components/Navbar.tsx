// src/components/Navbar.tsx
import Link from "next/link";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

async function Navbar() {
  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title Section */}
          <div className="flex items-center">
            {/* Wrap icon and text in a flex container */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary font-mono tracking-wider">
              <img src="/favicon.ico" alt="Glooba icon" className="h-6 w-6" />
              <span>Glooba</span> {/* Keep the text */}
            </Link>
          </div>

          {/* Desktop and Mobile Nav Links */}
          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
