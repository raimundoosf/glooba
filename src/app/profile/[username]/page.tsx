import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from '@/actions/profile.action';
import { getCompanyReviewsAndStats } from '@/actions/review.action';
import { notFound } from 'next/navigation';
import ProfilePageClient from './ProfilePageClient';

/**
 * Generates metadata for the profile page based on user data
 * @param params The route parameters containing the username
 * @returns Object with title and description for the page
 */
export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Revisa el perfil de ${user.username}.`,
  };
}

/**
 * Server component that fetches all necessary data for the profile page
 * @param params The route parameters containing the username
 * @returns {JSX.Element} The profile page component with all necessary data
 */
async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);

  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing, reviewData] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
    getCompanyReviewsAndStats({ companyId: user.id }),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
      initialReviewData={{
        reviews: reviewData.reviews,
        averageRating: reviewData.averageRating,
        totalCount: reviewData.totalCount,
        userHasReviewed: reviewData.userHasReviewed,
        hasNextPage: reviewData.hasNextPage,
      }}
    />
  );
}

export default ProfilePageServer;
