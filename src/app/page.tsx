// src/app/page.tsx
import { getFilteredCompanies, PaginatedCompaniesResponse } from '@/actions/explore.action'; // Import type
import ExploreClientWrapper from '@/components/explore/ExploreClientWrapper';
import WelcomeMessage from '@/components/WelcomeMessage';
import { COMPANY_CATEGORIES } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server'; // Import currentUser
import { Suspense } from 'react';

export const metadata = {
  title: 'Explora Alternativas Sostenibles | Glooba',
  description:
    'Descubre y conecta con empresas sostenibles en Glooba, la red social de la sostenibilidad.', // Enhanced description
  keywords: ['sostenibilidad', 'empresas sostenibles', 'red social', 'ecológico', 'Glooba'],
  openGraph: {
    title: 'Explora Alternativas Sostenibles | Glooba',
    description: 'Descubre y conecta con empresas sostenibles en Glooba.',
    url: 'https://www.glooba.cl', // Replace with your actual URL
    siteName: 'Glooba',
    // Add an image URL for social sharing previews
    // images: [ { url: 'https://www.glooba.cl/og-image.png' } ],
    type: 'website',
  },
  robots: { index: true, follow: true },
  authors: [{ name: 'Glooba', url: 'https://www.glooba.cl' }], // Replace with your actual URL
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton for Filters */}
      <div className="p-4 mb-6 bg-card border rounded-lg shadow-sm h-[100px] animate-pulse"></div>
      {/* Skeleton for Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card border rounded-lg shadow-sm h-[250px] animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Fetch user status
  const user = await currentUser();

  // Fetch initial company data for the explore section
  // Wrapped in try/catch for better error handling on initial load
  let initialData: PaginatedCompaniesResponse;
  try {
    initialData = await getFilteredCompanies(
      {}, // No initial filters
      { page: 1 } // Fetch page 1
    );
    // Handle potential error returned from the action itself
    if (!initialData.success) {
      console.error('Error fetching initial companies:', initialData.error);
      // Set defaults or throw error depending on desired behavior
      initialData = {
        success: false,
        error: initialData.error,
        companies: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 12,
        hasNextPage: false,
      };
    }
  } catch (error) {
    console.error('Critical error fetching initial companies:', error);
    initialData = {
      success: false,
      error: 'Could not load companies.',
      companies: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 12,
      hasNextPage: false,
    };
  }

  const allCategories = COMPANY_CATEGORIES;

  return (
    <div>
      {!user && <WelcomeMessage />}

      <Suspense fallback={<LoadingSkeleton />}>
        <ExploreClientWrapper
          initialCompanies={initialData.companies} // Pass first page results
          initialTotalCount={initialData.totalCount} // Pass total count
          initialHasNextPage={initialData.hasNextPage} // Pass hasNextPage
          allCategories={allCategories}
        />
      </Suspense>
    </div>
  );
}
