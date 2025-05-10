/**
 * Follow button component for following/unfollowing users.
 * @module FollowButton
 */
'use client';

import { toggleFollow } from '@/actions/user.action';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';

/**
 * Props interface for the FollowButton component
 * @interface FollowButtonProps
 */
interface FollowButtonProps {
  userId: string;
}

/**
 * Follow button component that handles follow/unfollow actions.
 * @param {FollowButtonProps} props - Component props
 * @returns {JSX.Element} The follow button component
 */
function FollowButton({ userId }: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles follow/unfollow action with loading state and toast notifications.
   */
  const handleFollow = async () => {
    setIsLoading(true);

    try {
      await toggleFollow(userId);
      toast.success('Usuario seguido con éxito');
    } catch (error) {
      toast.error('Error al seguir al usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={'sm'}
      variant={'secondary'}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : 'Seguir'}
    </Button>
  );
}

export default FollowButton;
