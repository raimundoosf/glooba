// src/components/explore/CompanyCard.tsx
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompanyCardData } from "@/actions/explore.action";
import { toggleFollow } from "@/actions/user.action";
import { DisplayStars } from "@/components/reviews/DisplayStars";
import { useUser, SignInButton } from "@clerk/nextjs";
import { MapPin, Users, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

interface CompanyCardProps {
  company: CompanyCardData;
}

/**
 * Renders a card displaying company information, including name, stats, bio,
 * and options to follow/unfollow.
 * @param {CompanyCardProps} props - The component props.
 * @param {CompanyCardData} props.company - The company data to display.
 * @returns {JSX.Element} The rendered company card component.
 */
export default function CompanyCard({ company }: CompanyCardProps) {
  const { user: loggedInUser, isSignedIn } = useUser();
  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(company.isFollowing);
  const [isPending, startTransition] = useTransition();

  const fallbackName = (company.name || company.username || "?").charAt(0).toUpperCase();

  const handleFollowToggle = () => {
    if (!isSignedIn || isPending) return;
    const originalState = isFollowingOptimistic;
    setIsFollowingOptimistic(!originalState);
    startTransition(async () => {
      try {
        const result = await toggleFollow(company.id);
        if (result === undefined) {
          throw new Error("Authentication error or invalid response.");
        }
        if (!result.success) {
          setIsFollowingOptimistic(originalState);
          toast.error(result.error || "Failed to update follow status.");
        }
      } catch (error) {
        console.error("Follow toggle error:", error);
        setIsFollowingOptimistic(originalState);
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  const isOwnProfile = isSignedIn && loggedInUser?.publicMetadata?.dbId === company.id;

  const followButtonTooltip = isFollowingOptimistic
    ? `Dejar de seguir a @${company.username}`
    : `Seguir a @${company.username}`;
  const followButtonIcon = isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : isFollowingOptimistic ? (
    <UserCheck className="h-4 w-4" />
  ) : (
    <UserPlus className="h-4 w-4" />
  );

  // Use company background or a default fallback
  const backgroundImage = company.backgroundImage;

  return (
    // Make Card relative to position children absolutely
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-200 hover:shadow-lg border dark:border-neutral-800 relative">
      {/* Background Image Section */}
      <div
        className="relative w-full h-32 bg-cover bg-center bg-muted"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        {/* Optional: Dark overlay for contrast */}
        {/* <div className="absolute inset-0 bg-black opacity-20"></div> */}

        {/* Avatar - Positioned absolutely */}
        <Link
          href={`/profile/${company.username}`}
          aria-label={`Ver perfil de ${company.name || company.username}`}
          className="absolute -bottom-8 left-4 z-10" // Added z-index
        >
          <Avatar className="h-16 w-16 border-2 border-background bg-background shadow-md"> {/* Use background color for border cutout */}
            <AvatarImage src={company.image || undefined} alt="" />
            <AvatarFallback>{fallbackName}</AvatarFallback>
          </Avatar>
        </Link>

        {/* Follow Button - Positioned absolutely */}
        {!isOwnProfile && (
          <div className="absolute top-3 right-3 z-10"> {/* Keep z-index */}
            {isSignedIn ? (
              // Modified Button to include text
              <Button
                variant={isFollowingOptimistic ? "outline" : "secondary"}
                size="sm" // Changed size to "sm" to better accommodate text and icon
                onClick={handleFollowToggle}
                disabled={isPending}
                className="h-8 rounded-full border bg-card/80 hover:bg-card backdrop-blur-sm pr-3" // Added padding-right
                aria-label={followButtonTooltip}
              >
                {followButtonIcon}
                <span className="ml-1"> {/* Added span for text with margin */}
                  {isFollowingOptimistic ? "Dejar de seguir" : "Seguir"}
                </span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="secondary"
                  size="sm" // Changed size to "sm"
                  className="h-8 rounded-full border bg-card/80 hover:bg-card backdrop-blur-sm pr-3" // Added padding-right
                  aria-label={`Seguir a @${company.username}`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="ml-1">Seguir</span> {/* Added span for "Seguir" text */}
                </Button>
              </SignInButton>
            )}
          </div>
        )}
      </div>

      {/* Content Area Below Background */}
      {/* Add padding-top to make space for the overlapping avatar */}
      <div className="flex flex-col flex-grow p-4 pt-10"> {/* Adjusted padding-top */}
        {/* Name and Username */}
        <div className="flex flex-col mb-3">
          <Link href={`/profile/${company.username}`}>
            <CardTitle className="text-lg font-bold hover:underline leading-tight break-words">
              {company.name || company.username}
            </CardTitle>
          </Link>
          <CardDescription className="text-sm text-muted-foreground truncate">
            @{company.username}
          </CardDescription>
        </div>

        {/* Rest of the Content */}
        <CardContent className="flex-grow space-y-3 text-sm p-0"> {/* Removed CardContent padding */}
          {/* Stats Row: Reviews & Followers */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <DisplayStars
              rating={company.averageRating}
              count={company.reviewCount}
              size={14}
              className="flex-shrink-0"
            />
            <div className="flex items-center flex-shrink-0">
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>{company.followerCount.toLocaleString()} seguidor{company.followerCount !== 1 ? 'es' : ''}</span>
            </div>
          </div>

          {/* Bio */}
          {company.bio && (
            <p className="text-muted-foreground line-clamp-3 leading-snug">
              {company.bio}
            </p>
          )}

          {/* Location */}
          {company.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{company.location}</span>
            </div>
          )}

          {/* Categories */}
          {company.categories && company.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {company.categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="secondary" className="font-normal">
                  {category}
                </Badge>
              ))}
              {company.categories.length > 3 && (
                <Badge variant="outline" className="font-normal">
                  +{company.categories.length - 3} más
                </Badge>
              )}
            </div>
          )}
        </CardContent>{/* End Rest of the Content */}
      </div> {/* End Content Area */}
    </Card>
  );
}