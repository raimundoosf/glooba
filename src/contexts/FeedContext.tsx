// src/contexts/FeedContext.tsx
'use client';

import { createContext, useContext } from 'react';

interface FeedContextType {
  refreshFeed: () => Promise<void>; // Function to trigger a refresh
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const useFeedContext = () => {
  const context = useContext(FeedContext);
  if (context === undefined) {
    // This error is expected if used outside the provider, which is fine for CreatePost/PostCard
    // as they might be rendered elsewhere too. We'll handle the null case in those components.
    // console.warn("useFeedContext must be used within a FeedProvider");
    return null; // Return null instead of throwing error
  }
  return context;
};

// Provider component will be part of FeedClient
export { FeedContext }; // Export context directly for Provider usage
