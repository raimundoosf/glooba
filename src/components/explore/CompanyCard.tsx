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
import { useUser, SignInButton } from "@clerk/nextjs"; // Import useUser and SignInButton

interface CompanyCardProps {
  company: CompanyCardData; // Includes isFollowing boolean
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const { user: loggedInUser, isSignedIn } = useUser(); // Get Clerk user status and user object
  const fallbackName = company.name ? company.name.charAt(0).toUpperCase() : company.username.charAt(0).toUpperCase();

  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(company.isFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollowToggle = async () => {
    // This handler should only be callable if the user is signed in,
    // but double-check just in case. The primary check is in the JSX.
    if (!isSignedIn || isPending) return;

    const originalState = isFollowingOptimistic;
    setIsFollowingOptimistic(!originalState);

    startTransition(async () => {
      try {
        const result = await toggleFollow(company.id);
        if (result === undefined) {
            console.warn("toggleFollow returned undefined, likely server auth issue.");
            toast.error("Could not follow/unfollow. Please ensure you are logged in.");
            setIsFollowingOptimistic(originalState);
            return;
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

  // Determine if the card represents the currently logged-in user's profile
  // Use clerkId for comparison if available on both user objects
  const isOwnProfile = isSignedIn && loggedInUser?.id === company.clerkId;

  return (
    <Card className="flex flex-col h-full transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        {/* Avatar and Info */}
        <div className="flex flex-grow items-center gap-4">
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
        </div>

        {/* Follow Button Area - Conditionally render based on login status and profile ownership */}
        {!isOwnProfile && ( // Only show button if it's not the user's own profile
            <>
                {isSignedIn ? (
                    // Logged-in: Render the interactive follow/unfollow button
                    <Button
                        variant={isFollowingOptimistic ? "outline" : "default"}
                        size="icon" // Make button icon-sized
                        onClick={handleFollowToggle}
                        disabled={isPending}
                        className="flex-shrink-0 h-8 w-8 rounded-full" // Style as a small circle/icon button
                        aria-label={isFollowingOptimistic ? `Dejar de seguir a ${company.username}` : `Seguir a ${company.username}`}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isFollowingOptimistic ? (
                            <UserCheck className="h-4 w-4" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}
                    </Button>
                ) : (
                    // Logged-out: Render SignInButton wrapping a visually similar "Follow" button
                    <SignInButton mode="modal">
                        <Button
                            variant="default"
                            size="icon" // Match size
                            className="flex-shrink-0 h-8 w-8 rounded-full" // Match style
                            aria-label={`Seguir a ${company.username}`}
                        >
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </SignInButton>
                )}
            </>
        )}
      </CardHeader>

      <CardContent className="flex-grow space-y-3 pt-2">
        {/* ... (Bio, Location, Categories remain the same) ... */}
         {company.bio && ( <p className="text-sm text-muted-foreground line-clamp-3">{company.bio}</p> )}
         {company.location && ( <div className="flex items-center text-sm text-muted-foreground"><MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" /><span>{company.location}</span></div> )}
         {company.categories && company.categories.length > 0 && ( <div className="flex flex-wrap gap-1 pt-1">{company.categories.slice(0, 3).map((category) => (<Badge key={category} variant="secondary">{category}</Badge>))}{company.categories.length > 3 && (<Badge variant="outline">+{company.categories.length - 3}</Badge>)}</div> )}
      </CardContent>
    </Card>
  );
}

