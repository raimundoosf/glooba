/**
 * UploadThing configuration and components.
 * @module uploadthing
 */
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { generateUploadButton, generateUploadDropzone } from '@uploadthing/react';

/**
 * Custom UploadButton component configured with our file router.
 * @type {React.ComponentType}
 */
export const UploadButton = generateUploadButton<OurFileRouter>();

/**
 * Custom UploadDropzone component configured with our file router.
 * @type {React.ComponentType}
 */
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
