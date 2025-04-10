// src/components/explore/CompanyCard.tsx
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompanyCardData } from "@/actions/explore.action";
import { MapPin, Users, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/actions/user.action";
import toast from "react-hot-toast";
import { useUser, SignInButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils"; // Import cn if not already imported

interface CompanyCardProps {
  company: CompanyCardData; // Includes isFollowing boolean
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const { user: loggedInUser, isSignedIn } = useUser();
  const fallbackName = company.name ? company.name.charAt(0).toUpperCase() : company.username.charAt(0).toUpperCase();

  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(company.isFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollowToggle = async () => {
    if (!isSignedIn || isPending) return;
    const originalState = isFollowingOptimistic;
    setIsFollowingOptimistic(!originalState);
    startTransition(async () => {
        try {
            const result = await toggleFollow(company.id);
            if (result === undefined) {
                console.warn("toggleFollow returned undefined, likely server auth issue.");
                toast.error("Could not follow/unfollow. Please ensure you are logged in.");
                setIsFollowingOptimistic(originalState); return;
            }
            if (!result.success) {
                setIsFollowingOptimistic(originalState);
                toast.error(result.error || "Failed to update follow status.");
            }
        } catch (error) {
            setIsFollowingOptimistic(originalState);
            toast.error("An error occurred while trying to follow/unfollow.");
            console.error("Follow toggle error:", error);
        }
    });
  };

  const isOwnProfile = isSignedIn && loggedInUser?.id === company.clerkId;

  // Common classes for size and shape
  const commonButtonClasses = "flex-shrink-0 h-8 w-8 rounded-full border border-neutral-300";

  return (
    <Card className="flex flex-col h-full transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        {/* Left Section (Avatar + Text) */}
        <div className="flex items-center gap-3 flex-shrink min-w-0">
          <Link href={`/profile/${company.username}`} className="flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={company.image || undefined} alt={`${company.name || company.username}'s profile picture`} />
              <AvatarFallback>{fallbackName}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col min-w-0">
            <Link href={`/profile/${company.username}`} className="min-w-0">
              <CardTitle className="text-lg font-semibold hover:underline break-words">
                {company.name || company.username}
              </CardTitle>
            </Link>
            <CardDescription className="text-sm text-muted-foreground truncate">
              @{company.username}
            </CardDescription>
          </div>
        </div>

        {/* Follow Button Area */}
        <div className="flex-shrink-0">
            {!isOwnProfile && (
                <>
                    {isSignedIn ? (
                        // Logged-in: Use conditional variant
                        <Button
                            variant={isFollowingOptimistic ? "outline" : "secondary"} // Use theme-aware variants
                            size="icon"
                            onClick={handleFollowToggle}
                            disabled={isPending}
                            className={commonButtonClasses} // Apply common size/shape
                            aria-label={isFollowingOptimistic ? `Dejar de seguir a ${company.username}` : `Seguir a ${company.username}`}
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isFollowingOptimistic ? (
                                <UserCheck className="h-4 w-4" /> // Icon color adapts to variant
                            ) : (
                                <UserPlus className="h-4 w-4" /> // Icon color adapts to variant
                            )}
                        </Button>
                    ) : (
                        // Logged-out: Use secondary variant for "Follow" look
                        <SignInButton mode="modal">
                            <Button
                                variant="secondary" // Use secondary variant
                                size="icon"
                                className={commonButtonClasses} // Apply common size/shape
                                aria-label={`Seguir a ${company.username}`}
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </SignInButton>
                    )}
                </>
            )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-3 pt-2">
         {/* ... Bio, Location, Categories ... */}
         {company.bio && ( <p className="text-sm text-muted-foreground line-clamp-3">{company.bio}</p> )}
         {company.location && ( <div className="flex items-center text-sm text-muted-foreground"><MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" /><span>{company.location}</span></div> )}
         {company.categories && company.categories.length > 0 && ( <div className="flex flex-wrap gap-1 pt-1">{company.categories.slice(0, 3).map((category) => (<Badge key={category} variant="secondary">{category}</Badge>))}{company.categories.length > 3 && (<Badge variant="outline">+{company.categories.length - 3}</Badge>)}</div> )}
      </CardContent>
    </Card>
  );
}
