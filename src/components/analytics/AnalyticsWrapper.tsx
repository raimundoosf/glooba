'use client';

import dynamic from 'next/dynamic';

// Dynamically import client-side components with no SSR
const GoogleAnalytics = dynamic(
  () => import('@/components/analytics/GoogleAnalytics'),
  { ssr: false }
);

const ClerkAnalytics = dynamic(
  () => import('@/components/analytics/ClerkAnalytics'),
  { ssr: false }
);

export default function AnalyticsWrapper() {
  // Only render in browser
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <>
      <GoogleAnalytics />
      <ClerkAnalytics />
    </>
  );
}
