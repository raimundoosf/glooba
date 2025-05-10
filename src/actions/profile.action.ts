'use server';

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getDbUserId } from './user.action';

interface ProfileUpdateData {
  username: string;
  name?: string;
  bio?: string;
  isCompany?: boolean;
  location?: string;
  website?: string;
  categories?: string[];
  imageUrl?: string | null;
  backgroundImage?: string | null;
}

/**
 * Retrieves a user profile by their username.
 * Includes counts for followers, following, and posts.
 * Includes the current logged-in user as a follower if applicable.
 * 
 * @param username - The username to retrieve the profile for
 * @returns The user record with related counts or null if not found
 * @throws {Error} Failed to fetch profile
 */
export async function getProfileByUsername(username: string) {
  try {
    const { userId: currentClerkId } = await auth(); // Get current logged-in user's Clerk ID

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        clerkId: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        isCompany: true,
        createdAt: true,
        categories: true,
        backgroundImage: true, // Corrected: Select background image
        followers: {
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return user;
  } catch (error) {

    throw new Error('Failed to fetch profile');
  }
}

/**
 * Retrieves a list of posts authored by a specific user.
 * 
 * Each post includes details about the author, comments, and likes.
 * The comments are ordered by creation date in ascending order,
 * while the posts themselves are ordered by creation date in descending order.
 * 
 * @param userId - The ID of the user whose posts are to be retrieved.
 * @returns A promise that resolves to an array of posts with associated details.
 * @throws An error if the posts cannot be fetched.
 */

export async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isCompany: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                isCompany: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw new Error('Failed to fetch user posts');
  }
}

/**
 * Fetches all posts that a user has liked.
 * @param userId The ID of the user to fetch liked posts for
 * @returns A promise that resolves to an array of posts that the user has liked
 * @throws {Error} Failed to fetch liked posts
 */
export async function getUserLikedPosts(userId: string) {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isCompany: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                isCompany: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likedPosts;
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    throw new Error('Failed to fetch liked posts');
  }
}

/**
 * Updates the profile of the currently authenticated user.
 *
 * @param data - An object containing profile fields to update.
 *   - username: The username to update the profile for.
 *   - name: The new name for the user (optional).
 *   - bio: The new bio for the user (optional).
 *   - isCompany: Indicates if the user is a company (optional).
 *   - location: The new location for the user (optional).
 *   - website: The new website URL for the user (optional).
 *   - categories: An array of categories the user is associated with (optional).
 *   - imageUrl: The new profile image URL (optional, null to remove).
 *   - backgroundImage: The new background image URL (optional, null to remove).
 * @returns A promise that resolves to an object indicating success or failure.
 *   - success: A boolean indicating if the update was successful.
 *   - user: The updated user data (only on success).
 *   - error: An error message (only on failure).
 * @throws An error if authentication fails or if the update process encounters an issue.
 */

export async function updateProfile(data: ProfileUpdateData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error('Unauthorized');

    const {
      username,
      name,
      bio,
      isCompany,
      location,
      website,
      categories,
      imageUrl,
      backgroundImage,
    } = data;

    const updateData: {
      name?: string;
      bio?: string;
      isCompany?: boolean;
      location?: string;
      website?: string;
      categories?: any;
      image?: string | null;
      backgroundImage?: string | null;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (isCompany !== undefined) updateData.isCompany = isCompany;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (categories !== undefined) updateData.categories = categories;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (backgroundImage !== undefined) updateData.backgroundImage = backgroundImage;

    if (Object.keys(updateData).length === 0) {
      return { success: true, message: 'No changes provided.' };
    }

    const user = await prisma.user.update({
      where: { clerkId },
      data: updateData,
    });

    revalidatePath(`/profile/${username}`);
    revalidatePath('/profile');

    return { success: true, user };
  } catch (error) {
    console.error('Error updating profile:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return { success: false, error: message };
  }
}

/**
 * Checks if the current user is following the given user ID.
 * Returns true if the follow relationship exists, false otherwise.
 * @param userId The ID of the user to check the follow status for.
 * @returns A boolean indicating whether the current user is following the given user.
 * @throws An error if the database query fails.
 */
export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}
