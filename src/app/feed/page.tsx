import { getPosts, PaginatedPostsResponse } from '@/actions/post.action';
import { getDbUserId } from '@/actions/user.action';
import { Suspense } from 'react';
import WhoToFollow from '@/components/WhoToFollow';
import FeedClient from '@/components/feed/FeedClient';
import { currentUser } from '@clerk/nextjs/server';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Feed | Glooba',
  description: 'La red social de alternativas sostenibles.',
  keywords: ['sostenibilidad', 'alternativas', 'ofertas', 'Glooba'],
};

/**
 * Loading skeleton component that shows a placeholder while feed data is being fetched
 * @returns {JSX.Element} The loading skeleton component
 */
function FeedLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton for CreatePost */}
      <div className="bg-card p-4 rounded-lg border shadow-sm mb-6 h-[120px] animate-pulse"></div>
      {/* Skeleton for PostCards */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-card border rounded-lg shadow-sm h-[170px] animate-pulse"></div>
      ))}
      <div className="flex justify-center py-6 mt-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );
}

/**
 * Server component that fetches initial feed data and renders the FeedClient component
 * @returns {JSX.Element} The feed content component with initial data
 */
async function FeedContent() {
  const [user, dbUserId] = await Promise.all([currentUser(), getDbUserId()]);

  let initialFeedData: PaginatedPostsResponse;
  try {
    initialFeedData = await getPosts({ page: 1 });
  } catch {
    initialFeedData = {
      success: false,
      error: 'Could not connect to fetch feed data.',
      posts: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
      hasNextPage: false,
    };
  }

  // Pass necessary user info (or null if not logged in) to FeedClient
  const clerkUser = user
    ? {
        // Pass only necessary fields to client
        id: user.id,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
      }
    : null;

  return (
    <>
      {/* FeedClient now handles CreatePost rendering internally */}
      <FeedClient
        initialPosts={initialFeedData.posts}
        initialHasNextPage={initialFeedData.hasNextPage}
        dbUserId={dbUserId} // Pass DB ID for PostCard interactions
        initialError={initialFeedData.error}
        clerkUser={clerkUser} // Pass Clerk user info
      />
    </>
  );
}

/**
 * Main feed page component that organizes the layout with feed content and sidebar
 * @returns {JSX.Element} The feed page component with grid layout
 */
export default function FeedPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        <Suspense fallback={<FeedLoadingSkeleton />}>
          {/* ts-expect-error Server Component is async */}
          <FeedContent />
        </Suspense>
      </div>
      <div className="hidden lg:block lg:col-span-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
        <WhoToFollow />
      </div>
    </div>
  );
}
