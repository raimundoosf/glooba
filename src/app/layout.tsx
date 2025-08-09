/**
 * Root layout component for the application.
 * @module layout
 */
import Navbar from "@/components/Navbar";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { esES } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import AnalyticsWrapper from "@/components/analytics/AnalyticsWrapper";

/**
 * Geist Sans font configuration for the application.
 * @type {Font}
 * @property {string} src - Path to the font file
 * @property {string} variable - CSS variable name
 * @property {string} weight - Font weight range
 */
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

/**
 * Geist Mono font configuration for the application.
 * @type {Font}
 * @property {string} src - Path to the font file
 * @property {string} variable - CSS variable name
 * @property {string} weight - Font weight range
 */
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

/**
 * Application metadata configuration.
 * @type {Metadata}
 * @property {string} title - Application title
 * @property {string} description - Application description
 */
export const metadata: Metadata = {
  title: "Glooba",
  description: "The social network of sustainability",
};

/**
 * Root layout component that provides:
 * - Clerk authentication provider with Spanish localization
 * - Theme provider with system theme support
 * - Custom fonts (Geist Sans and Mono)
 * - Layout structure with:
 *   - Navbar at the top
 *   - Sidebar on the left (desktop only)
 *   - Main content area
 *   - Toaster notifications
 * @param {Readonly<{ children: React.ReactNode }>} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The root layout component
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <div className="min-h-screen">
                <Navbar />

                <main className="py-8">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="hidden lg:block lg:col-span-3">
                        <Sidebar />
                      </div>
                      <div className="lg:col-span-9">{children}</div>
                    </div>
                  </div>
                </main>
              </div>
              <Toaster />
              <AnalyticsWrapper />
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
