// src/actions/post.action.ts
"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action"; // Import helper to get current user's DB ID
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client"; // Import Prisma types if needed for complex types

// Define the shape of the post data we want, including nested author/comment/like info
// This helps ensure consistency and type safety
const postInclude = Prisma.validator<Prisma.PostInclude>()({
  author: {
    select: {
      id: true,
      name: true,
      image: true,
      username: true,
      isCompany: true,
    },
  },
  comments: {
    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
          name: true,
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
});

export type PostWithDetails = Prisma.PostGetPayload<{ include: typeof postInclude }>;


// --- CREATE POST (Remains the same) ---
export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not authenticated"); // Throw error if not logged in

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: userId,
      },
    });

    revalidatePath("/"); // Revalidate feed path
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    // Return a more specific error message if possible
    return { success: false, error: error instanceof Error ? error.message : "Failed to create post" };
  }
}

// --- GET POSTS (UPDATED FOR FEED LOGIC) ---
export async function getPosts(): Promise<PostWithDetails[]> {
  try {
    const currentUserId = await getDbUserId();

    // If user is not logged in, return empty feed (or handle as needed)
    if (!currentUserId) {
        console.log("User not logged in, returning empty feed.");
        return [];
    }

    // Find IDs of users the current user follows
    const following = await prisma.follows.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true }, // Select only the ID of the user being followed
    });
    // Extract the IDs into an array
    const followingIds = following.map(f => f.followingId);

    // Fetch posts where the author is the current user OR the author is in the following list
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: currentUserId }, // Posts by the current user
          { authorId: { in: followingIds } } // Posts by users the current user follows
        ]
      },
      orderBy: {
        createdAt: "desc", // Order by most recent
      },
      include: postInclude, // Include author, comments, likes using the defined structure
    });

    console.log(`Fetched ${posts.length} posts for user ${currentUserId}'s feed.`); // Debug log
    return posts;

  } catch (error) {
    console.error("Error fetching feed posts:", error);
    // In a real app, might want to throw or return a specific error state
    return []; // Return empty on error for now
  }
}


// --- TOGGLE LIKE (Remains the same) ---
export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not authenticated");

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      // Like and potentially notify
      await prisma.$transaction([
        prisma.like.create({ data: { userId, postId } }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,
                  creatorId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/"); // Revalidate relevant paths
    revalidatePath(`/profile/[username]`); // Potentially revalidate profile pages too
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle like" };
  }
}

// --- CREATE COMMENT (Remains the same) ---
export async function createComment(postId: string, content: string) {
 try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not authenticated");
    if (!content?.trim()) throw new Error("Comment content cannot be empty");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: { content, authorId: userId, postId },
      });
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }
      return [newComment];
    });

    revalidatePath("/");
    revalidatePath(`/post/${postId}`); // Revalidate specific post page if exists
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create comment" };
  }
}

// --- DELETE POST (Remains the same) ---
export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not authenticated");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Unauthorized to delete this post");

    await prisma.post.delete({ where: { id: postId } });

    revalidatePath("/");
    revalidatePath(`/profile/[username]`); // Revalidate user's profile
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete post" };
  }
}
