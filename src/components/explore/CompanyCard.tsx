// src/components/explore/CompanyCard.tsx
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompanyCardData } from "@/actions/explore.action"; // Import the type
import { MapPin, Users } from "lucide-react";

interface CompanyCardProps {
  company: CompanyCardData;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const fallbackName = company.name ? company.name.charAt(0).toUpperCase() : company.username.charAt(0).toUpperCase();

  return (
    <Card className="flex flex-col h-full transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Link href={`/profile/${company.username}`} className="flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={company.image || undefined} alt={`${company.name || company.username}'s profile picture`} />
            <AvatarFallback>{fallbackName}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-grow min-w-0">
          <Link href={`/profile/${company.username}`}>
            <CardTitle className="text-lg font-semibold truncate hover:underline">
                {company.name || company.username}
            </CardTitle>
          </Link>
          <CardDescription className="text-sm text-muted-foreground truncate">
            @{company.username}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-2">
        {company.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {company.bio}
          </p>
        )}
        {company.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span>{company.location}</span>
          </div>
        )}
        {company.categories && company.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {company.categories.slice(0, 3).map((category) => ( // Show max 3 categories
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
            {company.categories.length > 3 && (
                <Badge variant="outline">+{company.categories.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1.5" />
          <span>{company._count.followers} Seguidores</span>
          {/* Add more footer info if needed, like website link */}
        </div>
      </CardFooter>
    </Card>
  );
}
