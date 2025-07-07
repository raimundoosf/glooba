# Google Analytics 4 with Clerk Integration

This guide explains how to set up Google Analytics 4 (GA4) with Clerk user tracking in your Next.js application.

## Prerequisites

1. A Google Analytics 4 property set up in your Google Analytics account
2. The GA4 Measurement ID (starts with 'G-' or 'UA-')

## Setup Instructions

1. **Add your GA4 Measurement ID**
   - Create or edit the `.env.local` file in your project root
   - Add your GA4 Measurement ID:
     ```
     NEXT_PUBLIC_GA_MEASUREMENT_ID=YOUR_GA_MEASUREMENT_ID
     ```
   - Replace `YOUR_GA_MEASUREMENT_ID` with your actual GA4 Measurement ID

2. **Verify the Integration**
   - Start your development server: `npm run dev`
   - Open your app in a browser
   - Open the browser's developer tools (F12)
   - Go to the "Network" tab and filter by "collect" or "gtag"
   - You should see requests being made to Google Analytics

## How It Works

- **Page Views**: Automatically tracked on route changes
- **User Identification**: When a user signs in with Clerk, their user ID is sent to GA4
- **Custom Events**: Use the `event` function from `@/lib/analytics` to track custom events

## Available Functions

```typescript
// Track a pageview
import { pageview } from '@/lib/analytics';
pageview('/some-page');

// Track a custom event
import { event } from '@/lib/analytics';
event('event_name', {
  category: 'engagement',
  label: 'button_click',
  value: 1
});

// Identify a user (automatically called on sign-in)
import { identifyUser } from '@/lib/analytics';
identifyUser('user123', {
  email: 'user@example.com',
  name: 'John Doe'
});
```

## Troubleshooting

- **No data in GA4?** It can take up to 24-48 hours for data to appear in your GA4 dashboard
- **Events not firing?** Check the browser console for errors
- **User identification not working?** Ensure the user is properly signed in with Clerk

## Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Clerk Documentation](https://clerk.dev/docs)
- [Next.js Analytics](https://nextjs.org/analytics)
