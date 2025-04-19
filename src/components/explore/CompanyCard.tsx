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

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-200 hover:shadow-lg border dark:border-neutral-800">
      {/* Header: Avatar, Name, Username */}
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        {/* Left: Avatar + Text */}
        <div className="flex items-start gap-3 flex-shrink min-w-0">
          <Link href={`/profile/${company.username}`} aria-label={`Ver perfil de ${company.name || company.username}`}>
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={company.image || undefined} alt="" />
              <AvatarFallback>{fallbackName}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col min-w-0 mt-1">
            <Link href={`/profile/${company.username}`}>
              <CardTitle className="text-base font-semibold hover:underline leading-tight break-words">
                {company.name || company.username}
              </CardTitle>
            </Link>
            <CardDescription className="text-sm text-muted-foreground truncate">
              @{company.username}
            </CardDescription>
          </div>
        </div>

        {/* Right: Follow Button */}
        <div className="flex-shrink-0 mt-1">
          {!isOwnProfile && (
            isSignedIn ? (
              <Button
                variant={isFollowingOptimistic ? "outline" : "secondary"}
                size="icon"
                onClick={handleFollowToggle}
                disabled={isPending}
                className="h-8 w-8 rounded-full border"
                aria-label={followButtonTooltip}
              >
                {followButtonIcon}
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full border"
                  aria-label={`Seguir a @${company.username}`}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </SignInButton>
            )
          )}
        </div>
      </CardHeader>

      {/* Content: Stats, Bio, Location, Categories */}
      <CardContent className="flex-grow space-y-3 pt-0 pb-4 text-sm">
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
      </CardContent>
    </Card>
  );
}