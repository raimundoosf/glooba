// src/components/explore/CompanyResults.tsx
'use client';

import { CompanyCardData } from '@/actions/explore.action';
import { Loader2 } from 'lucide-react'; // ShadCN loader icon
import CompanyCard from './CompanyCard';

interface CompanyResultsProps {
  companies: CompanyCardData[];
  isLoading: boolean;
}

export default function CompanyResults({ companies, isLoading }: CompanyResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando Organizaciones...</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-card border rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Ups! No se encontraron Organizaciones</h3>
        <p className="text-muted-foreground">
          Intenta ajustar tus filtros o vuelve a intentarlo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
