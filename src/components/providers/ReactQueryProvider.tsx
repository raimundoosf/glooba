// src/components/providers/ReactQueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * Provides the React Query client to the application.
 * Ensures that the client is only created once per application instance.
 *
 * @param {{ children: ReactNode }} props - Component props containing the children elements.
 * @returns {JSX.Element} The QueryClientProvider wrapping the children.
 */
export function ReactQueryProvider({ children }: { children: ReactNode }): JSX.Element {
  // useState ensures the QueryClient is only created once
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default options for queries if needed
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false, // Optional: disable refetch on window focus
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
