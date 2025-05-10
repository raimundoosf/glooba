/**
 * UploadThing file router configuration.
 * @module uploadthing/core
 */
import { auth } from '@clerk/nextjs/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

/**
 * File router configuration for different types of uploads in the application.
 * @type {FileRouter}
 */
export const ourFileRouter = {
  /**
   * Route for uploading post images
   * - Max file size: 4MB
   * - Max files: 1
   * - Requires authentication
   * - Returns UFS URL for file access
   */
  postImage: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        return { fileUrl: file.ufsUrl };
      } catch (error) {
        console.error('Error in onUploadComplete:', error);
        throw error;
      }
    }),

  /**
   * Route for uploading profile images
   * - Max file size: 4MB
   * - Max files: 1
   * - Requires authentication
   * - Returns URL for client use
   */
  profileImage: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Profile image upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  /**
   * Route for uploading profile background images
   * - Max file size: 8MB (larger than other images)
   * - Max files: 1
   * - Requires authentication
   * - Returns URL for client use
   */
  profileBackground: f({
    image: {
      maxFileSize: '8MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

/**
 * Type definition for our file router configuration.
 * @type {FileRouter}
 */
export type OurFileRouter = typeof ourFileRouter;
