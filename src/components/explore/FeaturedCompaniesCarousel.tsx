'use client';

import { CompanyCardData } from "@/actions/explore.action";
import { useEffect, useState } from "react";
import FeaturedCompanyCard from "./FeaturedCompanyCard";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface FeaturedCompaniesCarouselProps {
  companies: CompanyCardData[];
  className?: string;
}

export default function FeaturedCompaniesCarousel({ 
  companies, 
  className 
}: FeaturedCompaniesCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-advance the carousel
  useEffect(() => {
    if (!api || isHovered) return;
    
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api, isHovered]);

  if (!companies || companies.length === 0) return null;

  return (
    <div 
      className={cn("w-full relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Carousel 
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-1">
          {companies.map((company) => (
            <CarouselItem key={company.id} className="pl-1 md:basis-1/2 lg:basis-full">
              <FeaturedCompanyCard company={company} />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Indicadores de paginación */}
        {companies.length > 1 && (
          <div className="flex justify-center gap-2 my-2">
            {companies.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  current === index ? "bg-primary w-4" : "bg-muted-foreground/30"
                )}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Ir a la diapositiva ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  );
}
