/**
 * Global middleware configuration for authentication and route protection.
 * Uses Clerk for authentication and protects specific routes.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Matcher for protected routes that require authentication.
 * Currently protects the notifications route and any subroutes.
 */
const isProtectedRoute = createRouteMatcher(['/notifications(.*)']);

/**
 * Middleware function that handles authentication for protected routes.
 * @param auth - Clerk authentication object
 * @param req - Incoming request object
 * @returns Promise<void>
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

/**
 * Middleware configuration object that defines which routes should be processed.
 * @property matcher - Array of route patterns to match against
 */
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
