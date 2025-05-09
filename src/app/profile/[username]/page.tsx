// src/app/profile/[username]/page.tsx

import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from '@/actions/profile.action';
import { notFound } from 'next/navigation';
import ProfilePageClient from './ProfilePageClient';
import { getCompanyReviewsAndStats } from '@/actions/review.action';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Revisa el perfil de ${user.username}.`,
  };
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);

  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing, reviewData] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
    getCompanyReviewsAndStats({ companyId: user.id }), // Fetch reviews and stats
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
