/**
 * Client-side component for managing the feed of posts
 * @module FeedClient
 */
'use client';

import { getPosts, PostWithDetails } from '@/actions/post.action';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { FeedContext } from '@/contexts/FeedContext';
import { AlertTriangle, Loader2, MessageCircleIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useCallback, useEffect, useRef, useState, useTransition } from 'react';

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
  initialPosts: PostWithDetails[];
  initialHasNextPage: boolean;
  dbUserId: string | null;
  initialError?: string;
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

export default function FeedClient({
  initialPosts,
  initialHasNextPage,
  dbUserId,
  initialError,
  clerkUser,
}: FeedClientProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || isRefreshing || !hasNextPage || error) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const result = await getPosts({ page: nextPage });
      if (result.success) {
        setPosts((prev) => [...prev, ...result.posts]);
        setHasNextPage(result.hasNextPage);
        setCurrentPage(result.currentPage);
        setError(null);
      } else {
        setError(result.error || 'Error al cargar más publicaciones.');
        setHasNextPage(false);
      }
    } catch {
      setError('Ocurrió un error inesperado al cargar más publicaciones.');
      setHasNextPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isRefreshing, hasNextPage, currentPage, error]);

  const refreshFeed = useCallback(async () => {
    startRefreshTransition(async () => {
      setError(null);
      try {
        const result = await getPosts({ page: 1 });
        if (result.success) {
          setPosts(result.posts);
          setCurrentPage(1);
          setHasNextPage(result.hasNextPage);
        } else {
          setError(result.error || 'Error al refrescar el feed.');
          setPosts([]);
          setHasNextPage(false);
        }
      } catch {
        setError('Ocurrió un error inesperado al refrescar el feed.');
        setPosts([]);
        setHasNextPage(false);
      }
    });
  }, [startRefreshTransition]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore && !isRefreshing && !error) {
          loadMorePosts();
        }
      },
      { rootMargin: '200px' }
    );
    const currentRef = loadMoreRef.current;
    if (currentRef) observerRef.current.observe(currentRef);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, isLoadingMore, isRefreshing, loadMorePosts, error]);

  const contextValue = { refreshFeed };

  // --- Render Logic ---
  const isCurrentlyLoading = isLoadingMore || isRefreshing;

  return (
    <FeedContext.Provider value={contextValue}>
      {/* Render CreatePost INSIDE the provider if user is logged in */}
      {clerkUser && <CreatePost />}

      {/* *** REMOVED Refresh Indicator *** */}
      {/* {isRefreshing && (
        <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/></div>
      )} */}

      {/* Initial Error State */}
      {error && posts.length === 0 && !isRefreshing && (
        <FeedMessageBox
          icon={<AlertTriangle className="h-10 w-10" />}
          title="Error al cargar el feed"
          message={error}
        >
          <Button onClick={refreshFeed} variant="destructive" size="sm" disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Inténtalo de nuevo
          </Button>
        </FeedMessageBox>
      )}

      {/* Empty State */}
      {!error && posts.length === 0 && !isRefreshing && !isLoadingMore && (
        <FeedMessageBox
          icon={<MessageCircleIcon className="h-10 w-10" />}
          title="Tu feed está vacio"
          message="Las publicaciones de las organizaciones que sigues aparecerán aquí."
        >
          <Link href="/">
            <Button variant="outline">Explora alternativas sostenibles</Button>
          </Link>
        </FeedMessageBox>
      )}

      {/* Render Posts */}
      {/* Add margin-top only if CreatePost is not rendered or if refreshing */}
      <div className={`space-y-6 ${!clerkUser || isRefreshing ? 'mt-6' : ''}`}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} dbUserId={dbUserId} />
        ))}
      </div>

      {/* Sentinel Element & Loading/End Indicator */}
      {hasNextPage && <div ref={loadMoreRef} style={{ height: '50px' }} />}
      <div className="flex justify-center py-6 mt-4">
        {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        {!hasNextPage && !isLoadingMore && !isRefreshing && posts.length > 0 && (
          <p className="text-sm text-muted-foreground">Has llegado al final!</p>
        )}
        {error && !isLoadingMore && !isRefreshing && posts.length > 0 && (
          <p className="text-sm text-destructive">Error al cargar más publicaciones.</p>
        )}
      </div>
    </FeedContext.Provider>
  );
}
