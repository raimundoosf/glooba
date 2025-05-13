// src/components/explore/ExplorePostsList.tsx
'use client';

import { getAllPosts, PaginatedPostsResponse, PostWithDetails } from '@/actions/post.action';
import PostCard from '@/components/PostCard';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface ExplorePostsListProps {
  dbUserId: string | null;
  filters?: {
    searchTerm?: string;
    categories?: string[];
    location?: string;
  };
}

/**
 * Component responsible for fetching and displaying a list of all posts
 * using infinite scrolling in the Explore section.
 */
export function ExplorePostsList({ dbUserId, filters = {} }: ExplorePostsListProps) {
  const { ref, inView } = useInView();
  const queryKey = ['allPosts', filters]; // Include filters in query key to trigger refetch when filters change

  const queryClient = useQueryClient();

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: queryKey,
      queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
        const result = await getAllPosts({ 
          ...filters,
          page: pageParam 
        });
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch posts');
        }
        return result; // Contains { posts, currentPage, hasNextPage, pageSize, totalCount, success }
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage: PaginatedPostsResponse) => {
        // Use the data from the last successful fetch
        if (lastPage.success && lastPage.hasNextPage) {
          return lastPage.currentPage + 1;
        }
        return undefined; // No next page
      },
      refetchOnWindowFocus: false, // Optional: prevent refetch on window focus
    });

  // Trigger fetching the next page when the sentinel element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten the pages array into a single list of posts
  const allPosts = data?.pages.flatMap((page: PaginatedPostsResponse) => page.posts) ?? [];

  // Define the callback function to invalidate queries
  const handleActionComplete = () => {
    queryClient.invalidateQueries({ queryKey: queryKey });
  };

  return (
    <div className="space-y-6 md:px-20">
      {status === 'pending' ? (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : status === 'error' ? (
        <div className="text-center text-destructive p-4">
          Error al cargar las publicaciones: {error.message}
        </div>
      ) : (
        <>
          {allPosts.length === 0 && !isFetching ? (
            <p className="text-center text-muted-foreground py-8 px-4">
              No hay publicaciones disponibles por el momento.
            </p>
          ) : (
            allPosts.map((post: PostWithDetails) => (
              <PostCard
                key={post.id}
                post={post}
                dbUserId={dbUserId}
                // Pass the invalidate function as the callback
                onActionComplete={handleActionComplete}
              />
            ))
          )}

          {/* Sentinel element for infinite scroll */}
          <div ref={ref} className="h-10">
            {isFetchingNextPage && (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-center text-muted-foreground py-6">
                Has llegado al final.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
