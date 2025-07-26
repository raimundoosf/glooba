/**
 * @file Server actions for user-related functionality including authentication, user data retrieval, and follow management
 */
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

/**
 * Retrieves a user from the database by their Clerk authentication ID.
 * Includes counts for followers, following, and posts.
 * 
 * @param clerkId - The Clerk authentication ID of the user to retrieve
 * @returns The user record with related counts or null if not found
 */
export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Gets the internal database user ID for the currently authenticated user.
 * Uses Clerk authentication to identify the user and looks up their database record.
 * 
 * @throws Error if the user is not found in the database
 * @returns The user's database ID or null if not authenticated
 */
export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let user = await getUserByClerkId(clerkId);

  if (!user) {
    throw new Error('User not found');
  }

  return user.id;
}

/**
 * Fetches random company users that the current user is not already following.
 * Used for suggesting new companies to follow.
 * 
 * @returns Array of company users with basic profile information and follower count.
 * Returns empty array if error occurs or user is not authenticated.
 */
export async function getRandomCompanyUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // get 3 random users that are companies, excluding ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { isCompany: true },
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {

    return [];
  }
}

/**
 * Toggles the follow status between the current user and a target user.
 * If the current user is already following the target, unfollows them.
 * If not already following, creates a follow relationship and notification.
 * 
 * @param targetUserId - The database ID of the user to follow/unfollow
 * @returns Object indicating success status and any error message
 * @throws Error if user tries to follow themselves (handled internally)
 */
export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error('You cannot follow yourself');

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notification.create({
          data: {
            type: 'FOLLOW',
            userId: targetUserId, // user being followed
            creatorId: userId, // user following
          },
        }),
      ]);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.log('Error in toggleFollow', error);
    return { success: false, error: 'Error toggling follow' };
  }
}

/**
 * Increments the profile view count for a given company.
 * Does not increment if the viewer is the company owner.
 *
 * @param companyId - The database ID of the company to update.
 * @returns Object indicating success status and any error message.
 */
export async function incrementProfileView(companyId: string) {
  try {
    const currentUserId = await getDbUserId();

    // Don't increment if the user is viewing their own profile or not logged in
    if (currentUserId === companyId) {
      return {
        success: true,
        message: "View not incremented for own profile or anonymous user.",
      };
    }

    await prisma.user.update({
      where: {
        id: companyId,
      },
      data: {
        profileViews: {
          increment: 1,
        },
      },
    });

    // No need to revalidate paths here as it's a simple counter
    // that doesn't drastically change the UI layout immediately.
    // The updated count will be fetched on the next page load/refresh.
    return { success: true };
  } catch (error) {
    console.error("Error in incrementProfileView", error);
    return { success: false, error: "Error incrementing profile view count" };
  }
}
