// src/app/explore/page.tsx
import { getFilteredCompanies } from "@/actions/explore.action"; // Action import updated
import ExploreClientWrapper from "@/components/explore/ExploreClientWrapper";
import { Suspense } from "react";
import { COMPANY_CATEGORIES } from "@/lib/constants";

export const metadata = {
  title: "Alternativas Sostenibles | Glooba",
  description: "Descubre alternativas sostenibles en Glooba.",
  keywords: ["sostenibilidad", "alternativas", "ofertas", "Glooba"],
  openGraph: {
    title: "Alternativas Sostenibles | Glooba",
    description: "Descubre alternativas sostenibles en Glooba.",
    url: "https://www.glooba.cl",
    siteName: "Glooba",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "Glooba", url: "https://www.glooba.com" }],
};


function LoadingSkeleton() {
    return (
      <div className="space-y-6">
        {/* Skeleton for Filters */}
        <div className="p-4 mb-6 bg-card border rounded-lg shadow-sm h-[100px] animate-pulse"></div>
        {/* Skeleton for Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => ( // Show fewer skeletons initially
            <div key={i} className="bg-card border rounded-lg shadow-sm h-[250px] animate-pulse"></div>
          ))}
        </div>
      </div>
    );
}

export default async function ExplorePage() {
  // Fetch ONLY the first page initially
  const initialData = await getFilteredCompanies(
      {}, // No initial filters
      { page: 1 } // Fetch page 1
  );

  const allCategories = COMPANY_CATEGORIES;

  return (
    <div>
      {/* Suspense useful while initial page data is fetched */}
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
