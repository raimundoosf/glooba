/**
 * Client-side component for managing the feed of posts
 * @module FeedClient
 */
'use client';

import { getPosts, PaginatedPostsResponse, PostWithDetails } from '@/actions/post.action';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, MessageCircleIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { PostSkeleton } from '@/components/skeletons/PostSkeleton';

/**
 * Interface for Clerk user information
 * @interface ClerkUserInfo
 */
interface ClerkUserInfo {
  id: string;
  imageUrl: string;
  firstName: string | null;
  lastName?: string | null;
}

/**
 * Props interface for FeedClient component
 * @interface FeedClientProps
 */
interface FeedClientProps {
  dbUserId: string | null;
  clerkUser: ClerkUserInfo | null;
}

/**
 * Helper component for displaying feed message boxes
 * @param {Object} props - Component props
 * @param {ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title of the message
 * @param {string} props.message - Message content
 * @param {ReactNode} [props.children] - Optional child elements
 * @returns {JSX.Element} The message box component
 */
function FeedMessageBox({
  icon,
  title,
  message,
  children,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-card border rounded-lg mt-6">
      <div className="mb-4 text-muted-foreground">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {children}
    </div>
  );
}

export const FeedClient = ({ dbUserId, clerkUser }: FeedClientProps): JSX.Element => {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
  } = useInfiniteQuery<PaginatedPostsResponse, Error>({
    queryKey: ['feedPosts', dbUserId],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getPosts({ page: pageParam as number });
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch feed posts');
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedPostsResponse) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    enabled: !!dbUserId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleActionComplete = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['feedPosts', dbUserId] });
  };

  const posts = data?.pages.flatMap((page: PaginatedPostsResponse) => page.posts) ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {clerkUser && <CreatePost />}
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl text-center text-red-500">
        Error loading feed: {error?.message ?? 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {clerkUser && <CreatePost />}

      {posts.length > 0 ? (
        posts.map((post: PostWithDetails) => (
          <PostCard
            key={post.id}
            post={post}
            dbUserId={dbUserId}
            onActionComplete={handleActionComplete}
          />
        ))
      ) : (
        !isLoading && clerkUser && (
          <FeedMessageBox
            icon={<MessageCircleIcon className="h-10 w-10" />}
            title="Tu feed está vacío"
            message="Las publicaciones de las organizaciones que sigues aparecerán aquí."
          >
            <Link href="/">
              <Button variant="outline">Explora alternativas sostenibles</Button>
            </Link>
          </FeedMessageBox>
        )
      )}
      {!clerkUser && !isLoading && (
        <FeedMessageBox
        icon={<MessageCircleIcon className="h-10 w-10" />}
        title="Inicia sesión para ver tu feed"
        message="Las publicaciones de las organizaciones que sigues aparecerán aquí."
      >
        <Link href="/">
          <Button variant="outline">Explora alternativas sostenibles</Button>
        </Link>
      </FeedMessageBox>
      )}

      {isFetchingNextPage && <PostSkeleton />}

      {hasNextPage && !isFetchingNextPage && (
        <div ref={ref} style={{ height: '10px' }} />
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-muted-foreground">
          Has llegado al final!
        </p>
      )}

      {error && (
        <div className="flex justify-center py-6 mt-4">
          <p className="text-sm text-destructive">Error al cargar las publicaciones.</p>
        </div>
      )}
    </div>
  );
};
