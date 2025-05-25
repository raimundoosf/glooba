'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { identifyUser } from '@/lib/analytics';

export default function ClerkAnalytics() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Identify the user in Google Analytics
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        created_at: user.createdAt?.toISOString(),
        last_sign_in: user.lastSignInAt?.toISOString(),
      });
    }
  }, [isSignedIn, user]);

  return null;
}
