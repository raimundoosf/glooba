/**
 * UploadThing API route handler.
 * @module uploadthing/route
 */
import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from './core';

/**
 * Route handler for UploadThing API.
 * Provides GET and POST endpoints for:
 * - File upload initialization
 * - File upload completion
 * - File URL retrieval
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
