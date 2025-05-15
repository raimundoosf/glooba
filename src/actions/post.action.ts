// src/actions/post.action.ts
'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getDbUserId } from './user.action';

// --- Constants ---
const FEED_PAGE_SIZE = 2; // Number of posts per page for the feed
const EXPLORE_POSTS_PAGE_SIZE = 2; // Number of posts per page for the explore posts view

// --- Types ---
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
    orderBy: { createdAt: 'asc' },
  },
  likes: { select: { userId: true } },
  _count: { select: { likes: true, comments: true } },
});

export type PostWithDetails = Prisma.PostGetPayload<{
  include: typeof postInclude;
}>;

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


/**
 * Fetches the feed posts for the current user, taking into account
 * posts from the user themselves and those they follow.
 *
 * @param pagination - Optional pagination options
 * @returns A promise resolving to a PaginatedPostsResponse object
 *          containing the posts, total count, current page, page size,
 *          and a boolean indicating whether there are more pages
 */
export async function getPosts(
  pagination: PaginationOptions = {}
): Promise<PaginatedPostsResponse> {
  try {
    const currentUserId = await getDbUserId();

    // Return empty but successful for logged-out users
    if (!currentUserId) {
      return {
        success: true,
        posts: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: FEED_PAGE_SIZE,
        hasNextPage: false,
      };
    }

    const { page = 1, pageSize = FEED_PAGE_SIZE } = pagination;
    const currentPage = Math.max(1, Math.floor(page));
    const currentPageSize = Math.max(1, Math.floor(pageSize));

    const following = await prisma.follows.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    const whereClause: Prisma.PostWhereInput = {
      OR: [{ authorId: currentUserId }, { authorId: { in: followingIds } }],
    };

    // Use transaction for count and findMany
    const [totalCount, posts] = await prisma.$transaction([
      prisma.post.count({ where: whereClause }),
      prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: postInclude,
        skip: (currentPage - 1) * currentPageSize,
        take: currentPageSize,
      }),
    ]);

    const hasNextPage = currentPage * currentPageSize < totalCount;

    return {
      success: true,
      posts,
      totalCount,
      currentPage,
      pageSize: currentPageSize,
      hasNextPage,
    };
  } catch (error: unknown) {
    console.error('Error fetching feed posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Return error state
    return {
      success: false,
      error: `Failed to fetch feed: ${errorMessage}`,
      posts: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: FEED_PAGE_SIZE,
      hasNextPage: false,
    };
  }
}


/**
 * Sort options for posts
 */
import { SortOption } from './explore.action';

/**
 * Interface for post filters
 */
export interface PostFilters {
  searchTerm?: string;
  categories?: string[];
  location?: string;
  sortBy?: SortOption;
}

/**
 * Fetches all posts for the explore view, paginated and filtered.
 *
 * @param filters - Filter options including searchTerm, categories, and location
 * @param pagination - Optional pagination options (page, pageSize)
 * @returns A promise resolving to a PaginatedPostsResponse object
 */
export async function getAllPosts(
  filters: PostFilters & PaginationOptions = {}
): Promise<PaginatedPostsResponse> {
  try {
    const {
      searchTerm,
      categories,
      location,
      sortBy = 'newest',
      page = 1,
      pageSize = EXPLORE_POSTS_PAGE_SIZE
    } = filters;

    const currentPage = Math.max(1, Math.floor(page));
    const currentPageSize = Math.max(1, Math.floor(pageSize));

    // Build the where clause based on filters
    const conditions: Prisma.PostWhereInput[] = [];

    if (searchTerm) {
      conditions.push({
        OR: [
          { content: { contains: searchTerm, mode: 'insensitive' as const } },
          { author: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
          { author: { username: { contains: searchTerm, mode: 'insensitive' as const } } }
        ]
      });
    }

    if (categories?.length) {
      // Filter posts where the author has any of the selected categories
      // Using hasSome to check if any of the selected categories are in the user's categories array
      conditions.push({
        author: {
          categories: {
            hasSome: categories
          }
        }
      });
    }

    if (location) {
      conditions.push({
        author: {
          location: { contains: location, mode: 'insensitive' as const }
        }
      });
    }

    const whereClause: Prisma.PostWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    // Define the orderBy clause based on sortBy parameter
    const orderBy: Prisma.PostOrderByWithRelationInput = (() => {
      switch (sortBy) {
        case 'name_asc':
          return { author: { name: 'asc' } };
        case 'name_desc':
          return { author: { name: 'desc' } };
        case 'rating_desc':
          return { author: { reviewsReceived: { _count: 'desc' } } };
        case 'reviews_desc':
          return { author: { reviewsReceived: { _count: 'desc' } } };
        case 'followers_desc':
          return { author: { followers: { _count: 'desc' } } };
        case 'newest':
        default:
          return { createdAt: 'desc' };
      }
    })();

    const [totalCount, posts] = await prisma.$transaction([
      prisma.post.count({ where: whereClause }), // Count all posts
      prisma.post.findMany({
        where: whereClause, // Find all posts
        orderBy, // Apply sorting based on sortBy parameter
        include: postInclude, // Include author, comments, likes count, etc.
        skip: (currentPage - 1) * currentPageSize,
        take: currentPageSize,
      }),
    ]);

    const hasNextPage = currentPage * currentPageSize < totalCount;

    // Note: PostCard determines like status based on dbUserId and the full post.likes array
    return {
      success: true,
      posts, // Already includes the necessary details via postInclude
      totalCount,
      currentPage,
      pageSize: currentPageSize,
      hasNextPage,
    };
  } catch (error: unknown) {
    console.error('Error fetching all posts for explore:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      success: false,
      error: `Failed to fetch posts: ${errorMessage}`,
      posts: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: EXPLORE_POSTS_PAGE_SIZE,
      hasNextPage: false,
    };
  }
}


/**
 * Create a new post and return the newly created post data.
 *
 * Requires the user to be authenticated.
 *
 * @param content - The content of the post (text).
 * @param image - The image URL of the post (optional).
 * @returns An object with `success` and `post` keys or `error` key.
 */
export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error('User not authenticated');
    // Include relations when creating to return full data if needed immediately (optional)
    const post = await prisma.post.create({
      data: { content, image, authorId: userId },
      include: postInclude, // Include relations in the returned post
    });
    revalidatePath('/'); // Keep for cache invalidation
    return { success: true, post };
  } catch (error) {
    console.error('Failed to create post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create post',
    };
  }
}


/**
 * Delete a post by its ID.
 *
 * Requires the user to be authenticated and the owner of the post.
 *
 * @param postId - The ID of the post to delete.
 * @returns An object with `success` and `error` keys.
 */
export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error('User not authenticated');
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Unauthorized to delete this post');
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath('/'); // Keep for cache invalidation
    return { success: true };
  } catch (error) {
    console.error('Failed to delete post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete post',
    };
  }
}


/**
 * Toggles the like status for a given post by the current user.
 * If the post is already liked by the user, it removes the like.
 * If not liked, it adds a like and sends a notification to the post author
 * if the author is not the user performing the action.
 *
 * @param postId - The ID of the post to like or unlike.
 * @returns An object indicating the success status and any error message.
 * @throws Error if the user is not authenticated or the post is not found.
 */
export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error('User not authenticated');
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new Error('Post not found');

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      await prisma.$transaction([
        prisma.like.create({ data: { userId, postId } }),
        ...(post.authorId !== userId
          ? [
            prisma.notification.create({
              data: {
                type: 'LIKE',
                userId: post.authorId,
                creatorId: userId,
                postId,
              },
            }),
          ]
          : []),
      ]);
    }
    revalidatePath('/');
    revalidatePath(`/profile/[username]`);
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle like',
    };
  }
}


/**
 * Create a new comment on a post and return the newly created comment data.
 *
 * Requires the user to be authenticated.
 *
 * @param postId - The ID of the post to comment on.
 * @param content - The content of the comment.
 * @returns An object with `success` and `comment` keys or `error` key.
 * @throws Error if the user is not authenticated, if the post is not found,
 * or if the comment content is empty.
 */

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error('User not authenticated');
    if (!content?.trim()) throw new Error('Comment content cannot be empty');
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new Error('Post not found');

    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: { content, authorId: userId, postId },
      });
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: 'COMMENT',
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }
      return [newComment];
    });
    revalidatePath('/');
    revalidatePath(`/post/${postId}`);
    return { success: true, comment };
  } catch (error) {
    console.error('Failed to create comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comment',
    };
  }
}
