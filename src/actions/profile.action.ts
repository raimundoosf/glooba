"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";

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
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

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
            createdAt: "asc",
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
        createdAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
}

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
            createdAt: "asc",
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
        createdAt: "desc",
      },
    });

    return likedPosts;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
  }
}

export async function updateProfile(data: ProfileUpdateData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

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
      return { success: true, message: "No changes provided." };
    }

    const user = await prisma.user.update({
      where: { clerkId },
      data: updateData,
    });

    revalidatePath(`/profile/${username}`);
    revalidatePath("/profile");

    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

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
    console.error("Error checking follow status:", error);
    return false;
  }
}
