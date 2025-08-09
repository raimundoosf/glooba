'use client';

import { CompanyCardData } from "@/actions/explore.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryIcon } from "@/lib/constants";
import { MapPin } from "lucide-react";
import Link from "next/link";

interface FeaturedCompanyCardProps {
  company: CompanyCardData;
}

export default function FeaturedCompanyCard({ company }: FeaturedCompanyCardProps) {
  return (
    <Link href={`/profile/${company.username}`} className="block h-full">
      <Card className="h-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors duration-200 group">
        {/* Imagen de fondo */}
        {company.backgroundImage ? (
          <div 
            className="h-24 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${company.backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200" />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-r from-primary/5 to-primary/10" />
        )}
        
        <CardContent className="p-2 relative">
          {/* Avatar superpuesto */}
          <div className="absolute -top-6 right-4">
            <Avatar className="h-12 w-12 border-2 border-background bg-background">
              <AvatarImage src={company.image || undefined} alt={company.name || 'Empresa'} />
              <AvatarFallback className="bg-primary/10">
                {company.name ? company.name.charAt(0).toUpperCase() : 'E'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Contenido principal */}
          <div className="">
            <h3 className="font-semibold text-lg line-clamp-1">{company.name || 'Empresa sin nombre'}</h3>
            
            {company.location && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span className="line-clamp-1">{company.location}</span>
              </div>
            )}
            
            {company.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3 min-h-[2.5rem]">
                {company.bio}
              </p>
            )}
            
            {company.categories && company.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {company.categories.slice(0, 2).map((category, index) => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs px-1 py-0 flex items-center gap-1"
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      {category}
                    </Badge>
                  );
                })}
                {company.categories.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0 flex items-center gap-1">
                    +{company.categories.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
