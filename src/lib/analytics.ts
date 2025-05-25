// Google Analytics 4 Measurement ID
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: Record<string, any>[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

export const pageview = (url: string) => {
  if (typeof window.gtag === 'undefined' || !GA_MEASUREMENT_ID) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });};

export const event = (action: string, params: Record<string, any>) => {
  if (typeof window.gtag === 'undefined' || !GA_MEASUREMENT_ID) return;
  
  window.gtag('event', action, params);
};

// Analytics component will be handled by the Vercel Analytics script
// This is a no-op component to maintain compatibility
export const Analytics = () => null;

// Clerk user identification
export const identifyUser = (userId: string, userProperties: Record<string, any> = {}) => {
  if (typeof window.gtag === 'undefined' || !GA_MEASUREMENT_ID) return;
  
  window.gtag('set', 'user_properties', userProperties);
  event('identify', { user_id: userId });
};
