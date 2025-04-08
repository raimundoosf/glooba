// src/app/feed/page.tsx
import { Suspense } from 'react';
import { getPosts, PaginatedPostsResponse } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
// Remove CreatePost import here, it will be rendered inside FeedClient
import WhoToFollow from "@/components/WhoToFollow";
import FeedClient from '@/components/feed/FeedClient';
import { currentUser, User } from "@clerk/nextjs/server"; // Import User type
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';


export const metadata = {
    title: "Feed | Glooba",
    description: "La red social de alternativas sostenibles.",
    keywords: ["sostenibilidad", "alternativas", "ofertas", "Glooba"],
}

// --- Loading Skeleton ---
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

// --- Server Component Logic for Initial Data ---
async function FeedContent() {
    // Fetch Clerk user and DB user ID in parallel
    const [user, dbUserId] = await Promise.all([
        currentUser(),
        getDbUserId()
    ]);

    // Fetch initial page data server-side
    let initialFeedData: PaginatedPostsResponse;
    try {
        initialFeedData = await getPosts({ page: 1 });
    } catch (e) {
        console.error("Critical error fetching initial feed:", e);
        initialFeedData = {
             success: false,
             error: "Could not connect to fetch feed data.",
             posts: [], totalCount: 0, currentPage: 1, pageSize: 10, hasNextPage: false
         };
    }

    // Pass necessary user info (or null if not logged in) to FeedClient
    const clerkUser = user ? { // Pass only necessary fields to client
        id: user.id,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
    } : null;

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


// --- Page Component ---
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
