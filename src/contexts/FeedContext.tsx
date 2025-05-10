/**
 * Context for managing feed refresh functionality
 * @module FeedContext
 */
'use client';

import { createContext, useContext } from 'react';

/**
 * Interface defining the feed context type
 * @interface FeedContextType
 * @property {() => Promise<void>} refreshFeed - Function to trigger feed refresh
 */
interface FeedContextType {
  refreshFeed: () => Promise<void>;
}

/**
 * Context object for managing feed refresh functionality
 */
const FeedContext = createContext<FeedContextType | undefined>(undefined);

/**
 * Hook to access the feed context
 * @returns {FeedContextType | null} The feed context or null if not available
 */
export const useFeedContext = () => {
  const context = useContext(FeedContext);
  if (context === undefined) {
    return null;
  }
  return context;
};

/**
 * Feed context provider and consumer
 */
export { FeedContext };
