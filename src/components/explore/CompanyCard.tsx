/**
 * Component that displays company information in a card format with interactive follow functionality.
 * @module CompanyCard
 */
"use client";

/**
 * Imports and dependencies for the CompanyCard component.
 */
import { CompanyCardData } from "@/actions/explore.action";
import { toggleFollow } from "@/actions/user.action";
import { DisplayStars } from "@/components/reviews/DisplayStars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  BellPlus,
  BellRing,
  Eye, // Import Eye icon
  Loader2,
  MapPin,
} from "lucide-react";
import { getCategoryIcon, getCategoryColor } from "@/lib/constants";
import Link from "next/link";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

/**
 * Props interface for the CompanyCard component.
 * @interface CompanyCardProps
 */
interface CompanyCardProps {
  company: CompanyCardData;
  dbUserId: string | null;
}

/**
 * Main component that renders a company information card with follow/unfollow functionality.
 * @param {CompanyCardProps} props - Component props
 * @returns {JSX.Element} The company card component
 */
export default function CompanyCard({ company, dbUserId }: CompanyCardProps) {
  const { user: loggedInUser, isSignedIn } = useUser();
  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(
    company.isFollowing
  );
  const [isPending, startTransition] = useTransition();

  /**
   * Generates a fallback name for the company avatar.
   * @returns {string} First letter of company name or username
   */
  const fallbackName = (company.name || company.username || "?")
    .charAt(0)
    .toUpperCase();

  /**
   * Handles follow/unfollow toggling with optimistic updates.
   */
  const handleFollowToggle = () => {
    // Use dbUserId passed down AND check Clerk's isSignedIn
    if (!dbUserId || !isSignedIn || isPending) {
      if (!isSignedIn && !dbUserId) {
        // If definitely not signed in, prompt login instead of just returning
        // Find the sign-in button and click it programmatically or show a toast
        // For simplicity now, just return, but ideally prompt login.
        // Maybe find the SignInButton and trigger click?
        console.warn("User not signed in, cannot follow."); // Log warning
        toast.error("Debes iniciar sesión para seguir a una organización."); // User feedback
      }
      return;
    }

    const originalState = isFollowingOptimistic;
    setIsFollowingOptimistic(!originalState);

    startTransition(async () => {
      try {
        const result = await toggleFollow(company.id);
        if (result === undefined)
          throw new Error("Authentication error or invalid response.");
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

  // Determine if the logged-in user is viewing their own profile card
  const isOwnProfile =
    isSignedIn && loggedInUser?.publicMetadata?.dbId === company.id;

  // TODO: Consider disabling follow/unfollow for own profile in the UI
  // Currently, the backend handles this, but we might want to prevent the UI interaction as well

  /**
   * Generates dynamic tooltip text for the follow button based on follow state.
   * Shows appropriate action text for the button hover state.
   *
   * @returns {string} Tooltip text indicating follow/unfollow action
   */
  const followButtonTooltip = isFollowingOptimistic
    ? `Dejar de seguir a @${company.username}`
    : `Seguir a @${company.username}`;

  /**
   * Generates dynamic icon for the follow button based on interaction state.
   * Shows loading spinner during API calls, or appropriate follow/unfollow icon.
   *
   * @returns {JSX.Element} The appropriate icon element based on current state
   */
  const followButtonIcon = isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" /> // Loading spinner
  ) : isFollowingOptimistic ? (
    <BellRing className="h-4 w-4" /> // Icon for "Following"
  ) : (
    <BellPlus className="h-4 w-4" /> // Icon for "Not Following"
  );

  /**
   * Uses the company's custom background image if available.
   * Falls back to a default background handled by the bg-muted class if not provided.
   *
   * @see Default is specified in the CSS class applied to the background container
   */
  const backgroundImage = company.backgroundImage;

  return (
    // Card container: Relative positioning for absolute children, full height,
    // overflow hidden, shadow transition, border, dark mode border adjustment.
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-200 hover:shadow-lg dark:border-neutral-800 relative border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
      {/* Background Image Section */}
      <Link href={`/profile/${company.username}`} className="block">
        <div
          className="relative w-full h-28 bg-cover bg-center bg-muted" // Reduced height slightly
          style={{
            backgroundImage: backgroundImage
              ? `url('${backgroundImage}')`
              : undefined,
          }} // Only apply style if image exists
        >
          {/* Avatar - Positioned absolutely to overlap background and content */}
          {/* Adjusted position relative to reduced background height */}
          <Link
            href={`/profile/${company.username}`}
            aria-label={`Ver perfil de ${company.name || company.username}`}
            className="absolute -bottom-6 left-4 z-10 block" // Adjusted -bottom
          >
            <Avatar className="h-14 w-14 border-2 border-background bg-background shadow-md">
              <AvatarImage
                src={company.image || undefined}
                alt={`${company.name || company.username}'s avatar`}
              />
              <AvatarFallback>{fallbackName}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
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
              className="h-7 rounded-full border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent bg-card/80 hover:bg-card backdrop-blur-sm px-3 text-xs inline-flex items-center" // Adjusted height, padding, and text size
              aria-label={followButtonTooltip}
            >
              {followButtonIcon}
              <span className="ml-1">
                {" "}
                {/* Added span for text with margin */}
                {isFollowingOptimistic ? "Siguiendo" : "Recibir novedades"}
              </span>
            </Button>
          ) : (
            // Button for guests (Sign In to Follow)
            <SignInButton mode="modal">
              <Button
                variant="secondary"
                size="sm" // Small size
                className="h-7 rounded-full border bg-card/80 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent hover:bg-card backdrop-blur-sm px-3 text-xs inline-flex items-center" // Adjusted height, padding, and text size
                aria-label={`Seguir a @${company.username}`}
              >
                <BellPlus className="h-3.5 w-3.5" />{" "}
                {/* Slightly smaller icon */}
                <span className="ml-1">Recibir novedades</span>{" "}
                {/* Added span for "Seguir" text */}
              </Button>
            </SignInButton>
          )}
        </div>
      )}
      {/* Content Area Below Background Image */}
      {/* Add padding-top to make space for the overlapping avatar */}
      {/* Adjusted padding-top and overall vertical space */}
      <div className="flex flex-col flex-grow p-4 pt-8 space-y-2">
        {" "}
        {/* Adjusted pt and added space-y for main content blocks */}
        {/* Name and Username/Location */}
        {/* Flex container for Name and the Username/Location row below it */}
        <div className="flex flex-col">
          {/* Name */}
          <Link
            href={`/profile/${company.username}`}
            className="outline-none focus-visible:underline"
          >
            <CardTitle className="text-base font-bold hover:underline leading-snug break-words">
              {" "}
              {/* Reduced text size slightly, adjusted leading */}
              {company.name || company.username}
            </CardTitle>
          </Link>

          {/* Username and Location Row - Tighter spacing */}
          {/* Use flex to put username and location side by side */}
          {(company.username || company.location) && ( // Only show this row if either username or location exists
            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
              {" "}
              {/* Reduced text size, added small top margin */}
              {/* Username */}
              {company.username && (
                <CardDescription className="truncate p-0 m-0 inline">
                  {" "}
                  {/* Use inline and remove default padding/margin */}@
                  {company.username}
                </CardDescription>
              )}
              {/* Add a separator and Location if location exists and username is also present */}
              {company.username && company.location && (
                <span className="mx-1">•</span>
              )}
              {/* Location */}
              {company.location && (
                <div className="flex items-center truncate">
                  {" "}
                  {/* Flex for icon and location text */}
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />{" "}
                  {/* Smaller icon */}
                  <span className="truncate">{company.location}</span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Rest of the Content - Now managed by parent space-y-2 */}
        <CardContent className="flex-grow space-y-2 text-sm p-0">
          {" "}
          {/* space-y-2 for spacing between items within CardContent */}
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
              <Eye className="h-3 w-3 mr-1" /> {/* Eye icon */}
              <span>
                {company.profileViews.toLocaleString()} visita
                {company.profileViews !== 1 ? "s" : ""}
              </span>
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
            <div className="flex flex-wrap gap-1 pt-1">
              {company.categories.slice(0, 3).map((category) => {
                const Icon = getCategoryIcon(category);
                const iconColor = getCategoryColor(category);

                return (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="font-normal text-xs py-0.5 px-1.5 flex items-center gap-1"
                  >
                    <Icon className={`h-3 w-3 ${iconColor}`} />
                    <span>{category}</span>
                  </Badge>
                );
              })}
              {company.categories.length > 3 && (
                <Badge
                  variant="outline"
                  className="font-normal text-xs py-0.5 px-1.5 text-muted-foreground"
                >
                  +{company.categories.length - 3} más
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        {/* End Rest of the Content */}
      </div>{" "}
      {/* End Content Area */}
    </Card>
  );
}
