"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader, // CardHeader is imported but not used, can be removed if not needed elsewhere
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

  // Get the first letter for the avatar fallback
  const fallbackName = (company.name || company.username || "?").charAt(0).toUpperCase();

  // Handler for toggling follow status
  const handleFollowToggle = () => {
    // Prevent action if not signed in or if a transition is already pending
    if (!isSignedIn || isPending) return;

    // Optimistically update the UI
    const originalState = isFollowingOptimistic;
    setIsFollowingOptimistic(!originalState);

    // Start the background transition for the API call
    startTransition(async () => {
      try {
        const result = await toggleFollow(company.id);
        // Handle potential authentication errors or invalid responses
        if (result === undefined) {
          throw new Error("Authentication error or invalid response.");
        }
        // If the API call failed, revert the optimistic update and show an error
        if (!result.success) {
          setIsFollowingOptimistic(originalState); // Revert on error
          toast.error(result.error || "Failed to update follow status.");
        }
        // Success is handled by the refetching mechanism elsewhere if applicable,
        // or the optimistic update remains if the API call was successful.
      } catch (error) {
        console.error("Follow toggle error:", error);
        setIsFollowingOptimistic(originalState); // Revert on error
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  // Determine if the logged-in user is viewing their own profile card
  const isOwnProfile = isSignedIn && loggedInUser?.publicMetadata?.dbId === company.id;

  // Tooltip text for the follow button
  const followButtonTooltip = isFollowingOptimistic
    ? `Dejar de seguir a @${company.username}`
    : `Seguir a @${company.username}`;

  // Icon displayed in the follow button based on state
  const followButtonIcon = isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" /> // Loading spinner
  ) : isFollowingOptimistic ? (
    <UserCheck className="h-4 w-4" /> // Icon for "Following"
  ) : (
    <UserPlus className="h-4 w-4" /> // Icon for "Not Following"
  );

  // Use company background image or a default fallback (handled by bg-muted class)
  const backgroundImage = company.backgroundImage;

  return (
    // Card container: Relative positioning for absolute children, full height,
    // overflow hidden, shadow transition, border, dark mode border adjustment.
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-200 hover:shadow-lg border dark:border-neutral-800 relative">
      {/* Background Image Section */}
      <div
        className="relative w-full h-28 bg-cover bg-center bg-muted" // Reduced height slightly
        style={{ backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined }} // Only apply style if image exists
      >
        {/* Avatar - Positioned absolutely to overlap background and content */}
        {/* Adjusted position relative to reduced background height */}
        <Link
          href={`/profile/${company.username}`}
          aria-label={`Ver perfil de ${company.name || company.username}`}
          className="absolute -bottom-6 left-4 z-10 block" // Adjusted -bottom
        >
          {/* Slightly reduced avatar size */}
          <Avatar className="h-14 w-14 border-2 border-background bg-background shadow-md"> {/* Use background color for border "cutout" effect */}
            <AvatarImage src={company.image || undefined} alt={`${company.name || company.username}'s avatar`} /> {/* Added alt text */}
            <AvatarFallback>{fallbackName}</AvatarFallback>
          </Avatar>
        </Link>

        {/* Follow Button - Positioned absolutely in the top-right corner */}
        {!isOwnProfile && (
          <div className="absolute top-3 right-3 z-10">
            {isSignedIn ? (
              // Button for signed-in users (Follow/Unfollow)
              <Button
                variant={isFollowingOptimistic ? "outline" : "secondary"}
                size="sm" // Small size
                onClick={handleFollowToggle}
                disabled={isPending}
                className="h-7 rounded-full border bg-card/80 hover:bg-card backdrop-blur-sm px-3 text-xs inline-flex items-center" // Adjusted height, padding, and text size
                aria-label={followButtonTooltip}
              >
                {followButtonIcon}
                <span className="ml-1"> {/* Added span for text with margin */}
                  {isFollowingOptimistic ? "Siguiendo" : "Seguir"}
                </span>
              </Button>
            ) : (
              // Button for guests (Sign In to Follow)
              <SignInButton mode="modal">
                <Button
                  variant="secondary"
                  size="sm" // Small size
                  className="h-7 rounded-full border bg-card/80 hover:bg-card backdrop-blur-sm px-3 text-xs inline-flex items-center" // Adjusted height, padding, and text size
                  aria-label={`Seguir a @${company.username}`}
                >
                  <UserPlus className="h-3.5 w-3.5" /> {/* Slightly smaller icon */}
                  <span className="ml-1">Seguir</span> {/* Added span for "Seguir" text */}
                </Button>
              </SignInButton>
            )}
          </div>
        )}
      </div>

      {/* Content Area Below Background Image */}
      {/* Add padding-top to make space for the overlapping avatar */}
      {/* Adjusted padding-top and overall vertical space */}
      <div className="flex flex-col flex-grow p-4 pt-8 space-y-2"> {/* Adjusted pt and added space-y for main content blocks */}

        {/* Name and Username/Location */}
        {/* Flex container for Name and the Username/Location row below it */}
        <div className="flex flex-col">
          {/* Name */}
          <Link href={`/profile/${company.username}`} className="outline-none focus-visible:underline">
            <CardTitle className="text-base font-bold hover:underline leading-snug break-words"> {/* Reduced text size slightly, adjusted leading */}
              {company.name || company.username}
            </CardTitle>
          </Link>

          {/* Username and Location Row - Tighter spacing */}
          {/* Use flex to put username and location side by side */}
          {(company.username || company.location) && ( // Only show this row if either username or location exists
            <div className="flex items-center text-xs text-muted-foreground mt-0.5"> {/* Reduced text size, added small top margin */}
                {/* Username */}
                {company.username && (
                    <CardDescription className="truncate p-0 m-0 inline"> {/* Use inline and remove default padding/margin */}
                      @{company.username}
                    </CardDescription>
                )}
                {/* Add a separator and Location if location exists and username is also present */}
                {company.username && company.location && (
                    <span className="mx-1">•</span> 
                )}
                {/* Location */}
                {company.location && (
                    <div className="flex items-center truncate"> {/* Flex for icon and location text */}
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" /> {/* Smaller icon */}
                        <span className="truncate">{company.location}</span>
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Rest of the Content - Now managed by parent space-y-2 */}
        <CardContent className="flex-grow space-y-2 text-sm p-0"> {/* space-y-2 for spacing between items within CardContent */}

          {/* Stats Row: Reviews & Followers */}
          {/* No need for pt here due to parent space-y */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <DisplayStars
              rating={company.averageRating}
              count={company.reviewCount}
              size={12} // Slightly smaller stars
              className="flex-shrink-0"
            />
            <div className="flex items-center flex-shrink-0">
              <Users className="h-3 w-3 mr-1" /> {/* Smaller icon */}
              <span>{company.followerCount.toLocaleString()} seguidor{company.followerCount !== 1 ? 'es' : ''}</span>
            </div>
          </div>

          {/* Bio - Uncomment and style if needed */}
          {/* {company.bio && (
            <p className="text-muted-foreground line-clamp-2 leading-snug text-xs"> // Reduced line-clamp and text size
              {company.bio}
            </p>
          )} */}

          {/* Categories */}
          {company.categories && company.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1"> {/* Slightly reduced gap, pt for space */}
              {company.categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="secondary" className="font-normal text-xs py-0 px-1.5"> {/* Smaller badge text and padding */}
                  {category}
                </Badge>
              ))}
              {company.categories.length > 3 && (
                <Badge variant="outline" className="font-normal text-xs py-0 px-1.5 text-muted-foreground"> {/* Styled count badge */}
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