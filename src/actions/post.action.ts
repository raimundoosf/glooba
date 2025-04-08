// src/actions/post.action.ts
"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// --- Constants ---
const FEED_PAGE_SIZE = 2; // Number of posts per page for the feed

// --- Types ---
const postInclude = Prisma.validator<Prisma.PostInclude>()({
  author: {
    select: { id: true, name: true, image: true, username: true, isCompany: true },
  },
  comments: {
    include: {
      author: { select: { id: true, username: true, image: true, name: true, isCompany: true } },
    },
    orderBy: { createdAt: "asc" },
  },
  likes: { select: { userId: true } },
  _count: { select: { likes: true, comments: true } },
});

export type PostWithDetails = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}

// Define the structured return type for getPosts
export interface PaginatedPostsResponse {
    success: boolean;
    error?: string;
    posts: PostWithDetails[];
    totalCount: number; // Keep total count
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
}

// --- GET POSTS (UPDATED FOR PAGINATION, FEED LOGIC, ERROR HANDLING) ---
export async function getPosts(
    pagination: PaginationOptions = {}
): Promise<PaginatedPostsResponse> {
  try {
    const currentUserId = await getDbUserId();

    // Return empty but successful for logged-out users
    if (!currentUserId) {
        return { success: true, posts: [], totalCount: 0, currentPage: 1, pageSize: FEED_PAGE_SIZE, hasNextPage: false };
    }

    const { page = 1, pageSize = FEED_PAGE_SIZE } = pagination;
    const currentPage = Math.max(1, Math.floor(page));
    const currentPageSize = Math.max(1, Math.floor(pageSize));

    const following = await prisma.follows.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
    });
    const followingIds = following.map(f => f.followingId);

    const whereClause: Prisma.PostWhereInput = {
        OR: [ { authorId: currentUserId }, { authorId: { in: followingIds } } ]
    };

    // Use transaction for count and findMany
    const [totalCount, posts] = await prisma.$transaction([
        prisma.post.count({ where: whereClause }),
        prisma.post.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: postInclude,
            skip: (currentPage - 1) * currentPageSize,
            take: currentPageSize,
        })
    ]);

    const hasNextPage = (currentPage * currentPageSize) < totalCount;

    return { success: true, posts, totalCount, currentPage, pageSize: currentPageSize, hasNextPage };

  } catch (error: unknown) {
    console.error("Error fetching feed posts:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Return error state
    return { success: false, error: `Failed to fetch feed: ${errorMessage}`, posts: [], totalCount: 0, currentPage: 1, pageSize: FEED_PAGE_SIZE, hasNextPage: false };
  }
}


// --- CREATE POST ---
// Keep revalidatePath, return created post data
export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not authenticated");
    // Include relations when creating to return full data if needed immediately (optional)
    const post = await prisma.post.create({
        data: { content, image, authorId: userId },
        include: postInclude // Include relations in the returned post
    });
    revalidatePath("/"); // Keep for cache invalidation
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create post" };
  }
}

// --- DELETE POST ---
// Keep revalidatePath
export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not authenticated");
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Unauthorized to delete this post");
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/"); // Keep for cache invalidation
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete post" };
  }
}

// --- TOGGLE LIKE ---
// Keep revalidatePath
export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not authenticated");
    const existingLike = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (!post) throw new Error("Post not found");

    if (existingLike) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
    } else {
      await prisma.$transaction([
        prisma.like.create({ data: { userId, postId } }),
        ...(post.authorId !== userId ? [prisma.notification.create({ data: { type: "LIKE", userId: post.authorId, creatorId: userId, postId } })] : []),
      ]);
    }
    revalidatePath("/");
    revalidatePath(`/profile/[username]`);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle like" };
  }
}

// --- CREATE COMMENT ---
// Keep revalidatePath
export async function createComment(postId: string, content: string) {
 try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not authenticated");
    if (!content?.trim()) throw new Error("Comment content cannot be empty");
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({ data: { content, authorId: userId, postId } });
      if (post.authorId !== userId) {
        await tx.notification.create({ data: { type: "COMMENT", userId: post.authorId, creatorId: userId, postId, commentId: newComment.id } });
      }
      return [newComment];
    });
    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create comment" };
  }
}
