// src/app/profile/[username]/ProfilePageClient.tsx
"use client";

import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import { getCompanyReviewsAndStats, ReviewWithAuthor, PaginatedReviewsResponse } from "@/actions/review.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  ImageIcon, // Add ImageIcon
  LinkIcon,
  MapPinIcon,
  Star,
  X,
} from "lucide-react";
import { useState, useEffect, useTransition, startTransition, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COMPANY_CATEGORIES } from "@/lib/constants";
import { MultiSelectCategories } from "@/components/MultiSelectCategories";
import { Badge } from "@/components/ui/badge";
// Import Review Components
import { LeaveReviewForm } from "@/components/reviews/LeaveReviewForm";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Separator } from "@/components/ui/separator"; // Import Separator
import { cn } from "@/lib/utils";
import { generateReactHelpers } from "@uploadthing/react"; // Keep for useUploadThing
import type { OurFileRouter } from "@/app/api/uploadthing/core"; // Import router type
import { DisplayStars } from '@/components/reviews/DisplayStars';

// --- Type definitions ---
interface UserProfile {
  id: string;
  clerkId: string;
  username: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  isCompany: boolean;
  createdAt: Date;
  categories: string[];
  backgroundImage: string | null; // Explicitly add backgroundImage
  followers: { followerId: string }[]; // The select returns the list, not just count
  _count: { // Explicitly add _count
    posts: number;
    followers: number;
    following: number;
  };
}

type Posts = Awaited<ReturnType<typeof getUserPosts>>;
// Add type for initial review data passed from server
interface InitialReviewData {
  reviews: ReviewWithAuthor[];
  error?: string;
  totalCount: number;
  averageRating: number | null;
  hasNextPage: boolean;
  userHasReviewed: boolean;
}

interface ProfilePageClientProps {
  user: UserProfile; // Use updated type name
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  initialReviewData: InitialReviewData; // Pass initial reviews/stats
}

// Define the type for the edit form data
interface ProfileEditFormData {
  name: string;
  bio: string;
  location: string;
  website: string;
  isCompany: boolean;
}

// --- Uploadthing Setup ---
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

// --- Component ---
function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
  initialReviewData, // Receive initial review data
}: ProfilePageClientProps) {
  // --- Hooks ---
  const { user: currentUser, isLoaded: isClerkLoaded } = useUser(); // Make sure isLoaded is destructured
  const { startUpload, isUploading } = useUploadThing("profileBackground"); // Hook for background uploads
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for profile pic input
  const backgroundInputRef = useRef<HTMLInputElement>(null); // Ref for background input
  const [isEditPending, startEditTransition] = useTransition();
  const [isFollowingState, setIsFollowingState] = useState<boolean>(initialIsFollowing);
  const [isFollowPending, startFollowTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null); // State for the new profile picture file
  const [newBackgroundUrl, setNewBackgroundUrl] = useState<string | null>(user.backgroundImage); // State for background image URL
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(user.image); // Initialize with current image

  const [editForm, setEditForm] = useState<ProfileEditFormData>({
    name: user.name ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
    website: user.website ?? "",
    isCompany: user.isCompany ?? false,
  });
  // State ONLY for the selected categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>(user.categories ?? []);

  // --- Effects ---
  // Update form when user data changes (e.g., after initial load or update)
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        website: user.website ?? "",
        isCompany: user.isCompany ?? false,
      });
      setSelectedCategories(user.categories ?? []);
      // Reset profile picture state when dialog opens or user changes
      setNewProfilePic(null);
      setProfilePicPreview(user.image); // Reset preview to current user image
      setNewBackgroundUrl(user.backgroundImage); // Reset background preview as well
    }
  }, [user, isEditDialogOpen]); // Rerun when dialog opens
  
  // Effect to create blob URL for preview when newProfilePic changes
  useEffect(() => {
    if (newProfilePic) {
      const objectUrl = URL.createObjectURL(newProfilePic);
      setProfilePicPreview(objectUrl);
  
      // Free memory when the component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setProfilePicPreview(null); // Clear preview if no file selected
    }
  }, [newProfilePic]);

  useEffect(() => {
    // Initialize state when user data changes
    if (user?.categories) {
      setSelectedCategories(user.categories.sort());
    } else {
        setSelectedCategories([]);
    }
     setEditForm({
        name: user.name ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        website: user.website ?? "",
        isCompany: user.isCompany ?? false,
     });
     setIsFollowingState(initialIsFollowing);
  }, [user, initialIsFollowing]);

  // --- Handlers ---
  const handleEditSubmit = async () => {
    if (!currentUser) return;

    const toastId = toast.loading("Guardando cambios...");
    let newImageUrl: string | undefined | null = currentUser.imageUrl; // Start with current URL

    startEditTransition(async () => { // Wrap in transition
      try {
        // 1. Update profile picture with Clerk if a new one is selected
        if (newProfilePic) {
          try {
            // This updates Clerk's user object internally
            await currentUser.setProfileImage({
              file: newProfilePic,
            });
            // Refetch or access the updated user object to get the new URL
            // Assuming Clerk updates the currentUser object in place or provides a new one:
            // It's safer to potentially refetch the user or rely on the structure
            // returned by Clerk's methods if they provide the updated user state.
            // For now, let's assume currentUser object is updated.
            await currentUser.reload(); // Explicitly reload the user data from Clerk
            newImageUrl = currentUser.imageUrl; // Get the *new* URL after update
            setNewProfilePic(null); // Clear the preview state
            toast.success("Imagen de perfil actualizada.", { id: toastId }); // Immediate feedback for image
          } catch (clerkError: any) {
            console.error("Clerk update error:", clerkError);
            toast.error(`Error al actualizar imagen: ${clerkError.errors?.[0]?.message || clerkError.message || 'Error desconocido'}`, { id: toastId });
            return; // Stop if Clerk update fails
          }
        }

        // 2. Prepare data for database update (using the potentially new image URL)
        const profileDataToUpdate: {
          username: string;
          bio?: string;
          website?: string;
          categories?: string[];
          imageUrl?: string | null; // Ensure this uses the latest URL
          backgroundImage?: string | null; // Corrected: Add background image URL
        } = {
          username: user.username, // Add username from the user prop
          ...editForm,
          categories: selectedCategories,
          imageUrl: newImageUrl, // Use the URL obtained after potential Clerk update
          backgroundImage: newBackgroundUrl, // Corrected: Add the new background URL
        };

        // 3. Update profile details in the database via server action
        const result = await updateProfile(profileDataToUpdate);

        if (result.error) {
          console.error("Database update error:", result.error);
          toast.error(`Error al guardar detalles: ${result.error}`);
        } else {
          toast.success("Perfil actualizado con éxito.", { id: toastId });
          setIsEditDialogOpen(false); // Close dialog on success
        }
      } catch (error: any) {
        // Catch any unexpected errors during the process
        console.error("Profile update failed:", error);
        if (toastId) {
           toast.error(`Error inesperado: ${error.message || 'Ocurrió un problema'}`, { id: toastId });
        } else {
           toast.error(`Error inesperado: ${error.message || 'Ocurrió un problema'}`);
        }
      }
    });
  };

  // Update selected categories state from MultiSelect component
  const handleCategoriesChange = (newSelection: string[]) => {
     if (editForm.isCompany && newSelection.length > 5) {
         toast.error('Las cuentas de empresa solo pueden seleccionar hasta 5 categorías.');
         if (newSelection.length > selectedCategories.length) return; // Prevent adding if over limit
     }
     setSelectedCategories(newSelection);
  };

  // Handle removing a category via its badge
  const handleRemoveCategory = (categoryToRemove: string) => {
      setSelectedCategories(prev => prev.filter(cat => cat !== categoryToRemove));
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    setIsFollowingState(!isFollowingState);
      try {
      const result = await toggleFollow(user.id);
      if (result?.success) {
          setIsFollowingState(!isFollowingState);
      } else {
          throw new Error(result?.error || "Failed to toggle follow");
          }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast.error(error.message || "Error al actualizar el estado de seguimiento");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          // Basic validation (optional: add size/type checks)
          if (file.size > 5 * 1024 * 1024) { // Example: 5MB limit
              toast.error("La imagen no puede superar los 5MB.");
              setNewProfilePic(null);
              setProfilePicPreview(null);
              event.target.value = ''; // Reset file input
              return;
          }
          if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
              toast.error("Tipo de archivo no válido. Sube JPG, PNG, WEBP o GIF.");
              setNewProfilePic(null);
              setProfilePicPreview(null);
               event.target.value = ''; // Reset file input
              return;
          }
          setNewProfilePic(file);
      } else {
          setNewProfilePic(null);
      }
    };

  // Handler for Background Image Selection using Uploadthing
  const handleBackgroundFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation (optional: add size/type checks)
    if (file.size > 8 * 1024 * 1024) { // Example: 8MB limit for background
      toast.error("La imagen de portada no puede superar los 8MB.");
      event.target.value = ''; // Reset file input
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error("Tipo de archivo no válido para portada. Sube JPG, PNG, WEBP o GIF.");
       event.target.value = ''; // Reset file input
      return;
    }

    const toastId = toast.loading("Subiendo imagen de portada...");
    try {
      // Use the 'profileBackground' endpoint defined in your core.ts
      const res = await startUpload([file]); // Endpoint is inferred from hook initialization
      if (res && res.length > 0) {
        setNewBackgroundUrl(res[0].url); // Update state with the new URL
        toast.success("Imagen de portada actualizada.", { id: toastId });
      } else {
        throw new Error("La carga no devolvió una URL.");
      }
    } catch (error: any) {
      console.error("Background upload error:", error);
      toast.error(`Error al subir portada: ${error.message || 'Error desconocido'}`, { id: toastId });
    } finally {
       event.target.value = ''; // Reset file input value regardless of outcome
    }
  };

  // Callback function to refresh reviews after submission
  const handleReviewSubmitted = useCallback(async () => {
    console.log("Review submitted, refreshing reviews...");
    // Option 1: Increment key to force remount/refetch of ReviewsSection
    // Option 2: Fetch stats again here and update reviewStats state
    // This avoids remounting the list but requires fetching stats again
    try {
        const updatedStats = await getCompanyReviewsAndStats({ companyId: user.id });
        if (updatedStats.success) {
            // Update reviewStats state
        }
    } catch (e) { console.error("Failed to refresh review stats", e); }
  }, [user.id]); // Dependency on user.id

  const isOwner = isClerkLoaded && currentUser?.id === user.clerkId; // Declare isOwner variable
  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;
  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy", { locale: es });

  // --- Render ---
  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header Card */}
      <div className="grid grid-cols-1 gap-6">
      <div className="w-full max-w-lg mx-auto">
        <Card className="bg-card overflow-hidden"> {/* Added overflow-hidden */}
          {/* Removed pt-6, added relative positioning context and bottom padding */}
          <CardContent className="px-4 py-6 relative"> 

            {/* 1. Background Image Area - Positioned absolutely */}
            <div className="absolute inset-x-0 top-0 h-32 bg-muted"> {/* Container with fixed height & fallback bg */}
              {user.backgroundImage ? (
                <img
                  src={user.backgroundImage}
                  alt={`${user.name ?? user.username}'s background`}
                  className="w-full h-full object-cover" // Covers the area
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="h-12 w-12 text-gray-500" /> {/* Centered placeholder */}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center text-center pt-20"> {/* Adjusted top padding */}

              <Avatar className="w-24 h-24 -mt-12 border-4 border-card relative z-10"> {/* Added negative margin, border, relative, z-index */}
                <AvatarImage src={user.image ?? "/avatar.png"} alt={`${user.name ?? user.username}'s profile`} />
                 <AvatarFallback>
                   {user.name ? user.name.substring(0, 2) : user.username.substring(0, 2)}
                 </AvatarFallback>
              </Avatar>

              {/* --- REST OF THE ORIGINAL LAYOUT --- */}
              {/* Ensure spacing below avatar is sufficient, original mt-4 might be fine */}

              {/* Name, Username, Verified Badge */}
              <h1 className="mt-4 text-2xl font-bold"> {/* Kept original mt-4 */}
                {user.name ?? user.username}
              </h1>
              <p className="text-muted-foreground">
                @{user.username}
                {user.isCompany && (
                  <svg className="ml-1.5 inline-flex items-center" width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.02975 3.3437C10.9834 2.88543 13.0166 2.88543 14.9703 3.3437C17.7916 4.00549 19.9945 6.20842 20.6563 9.02975C21.1146 10.9834 21.1146 13.0166 20.6563 14.9703C19.9945 17.7916 17.7916 19.9945 14.9703 20.6563C13.0166 21.1146 10.9834 21.1146 9.02975 20.6563C6.20842 19.9945 4.0055 17.7916 3.3437 14.9703C2.88543 13.0166 2.88543 10.9834 3.3437 9.02974C4.0055 6.20841 6.20842 4.00549 9.02975 3.3437ZM15.0524 10.4773C15.2689 10.2454 15.2563 9.88195 15.0244 9.6655C14.7925 9.44906 14.4291 9.46159 14.2126 9.6935L11.2678 12.8487L9.77358 11.3545C9.54927 11.1302 9.1856 11.1302 8.9613 11.3545C8.73699 11.5788 8.73699 11.9425 8.9613 12.1668L10.8759 14.0814C10.986 14.1915 11.1362 14.2522 11.2919 14.2495C11.4477 14.2468 11.5956 14.181 11.7019 14.0671L15.0524 10.4773Z" fill="#1281ff"/></svg>
                )}
              </p>

                {/* Display Average Rating for Companies */}
                {user.isCompany && (
                    <div className="mt-3 flex items-center gap-2">
                         <DisplayStars rating={initialReviewData.averageRating} count={initialReviewData.totalCount} size={18} />
                    </div>
                 )}

              {/* Bio */}
              <p className="mt-2 text-sm">{user.bio}</p>

              {/* Profile Stats */}
              <div className="w-full mt-6">
                <div className="grid grid-cols-3 gap-4"> {/* Always 3 columns */}
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">{user._count?.following?.toLocaleString() ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Siguiendo</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">{user._count?.followers?.toLocaleString() ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Seguidores</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">{user._count?.posts?.toLocaleString() ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Publicaciones</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Follow/Edit) */}
              <div className="w-full mt-4">
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full">Seguir</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button className="w-full" onClick={() => setIsEditDialogOpen(true)}>
                    <EditIcon className="size-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleFollow}
                    disabled={isFollowPending}
                    variant={isFollowingState ? "outline" : "default"}
                  >
                    {isFollowPending ? "Actualizando..." : (isFollowingState ? "Dejar de seguir" : "Seguir")}
                  </Button>
                )}
              </div>

              {/* Location, Website, Joined Date */}
              <div className="w-full mt-6 space-y-2 text-sm text-left"> {/* Kept original text-left */}
                {user.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPinIcon className="size-4 mr-2 flex-shrink-0" />
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center text-muted-foreground">
                    <LinkIcon className="size-4 mr-2 flex-shrink-0" />
                    <a
                      href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                      className="hover:underline truncate" // Add truncate
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-muted-foreground">
                  <CalendarIcon className="size-4 mr-2 flex-shrink-0" />
                  Se unió en {formattedDate}
                </div>
              </div>
              {/* --- END OF ORIGINAL LAYOUT SECTION --- */}

            </div> {/* End flex-col container */}
          </CardContent>
        </Card>
      </div>
    </div>      


      {/* Tabs for Posts/Likes/Reviews */}
      <Tabs defaultValue="posts" className="w-full mt-6">
         <TabsList className="w-full flex justify-center border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex-1 flex items-center justify-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-6 font-semibold text-muted-foreground"
            >
              <FileTextIcon className="size-4" />
              Publicaciones
            </TabsTrigger>
            {!user.isCompany && (
            <TabsTrigger
              value="likes"
              className="flex-1 flex items-center justify-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-6 font-semibold text-muted-foreground"
            >
              <HeartIcon className="size-4" />
              Me gusta
            </TabsTrigger>
            )}
            {/* Reviews Tab (only for companies) */}
            {user.isCompany && (
            <TabsTrigger value="reviews" 
              className="flex-1 flex items-center justify-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-6 font-semibold text-muted-foreground">
              <Star className="size-4" /> 
              Reseñas 
            </TabsTrigger>
            )}
         </TabsList>

         {/* Posts Content */}
         <TabsContent value="posts" className="mt-6">
           <div className="space-y-6">
             {posts.length > 0 ? (
               posts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
             ) : (
               <div className="text-center py-8 text-muted-foreground">Aún no hay publicaciones</div>
             )}
           </div>
         </TabsContent>

         {/* Likes Content */}
         <TabsContent value="likes" className="mt-6">
           <div className="space-y-6">
             {likedPosts.length > 0 ? (
               likedPosts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
             ) : (
               <div className="text-center py-8 text-muted-foreground">Aún no hay publicaciones que te gusten</div>
             )}
           </div>
         </TabsContent>

         {/* Reviews Content (only for companies) */}
         {user.isCompany && (
             <TabsContent value="reviews" className="mt-6 space-y-6">
                 {/* Leave Review Form (Show if logged in, not own profile, maybe haven't reviewed yet) */}
                 {isClerkLoaded && !!currentUser && !isOwnProfile && (
                    <LeaveReviewForm
                        companyId={user.id}
                        companyUsername={user.username}
                        onReviewSubmitted={handleReviewSubmitted}
                        // Pass initial review data if implementing edit
                        // isEditing={reviewStats.userHasReviewed}
                        // initialRating={...}
                        // initialContent={...}
                    />
                 )}
                 <ReviewsSection
                     key={0} // Force remount/refetch when version changes
                     companyId={user.id}
                     initialReviews={initialReviewData.reviews}
                     initialHasNextPage={initialReviewData.hasNextPage}
                     initialTotalCount={initialReviewData.totalCount}
                     initialAverageRating={initialReviewData.averageRating}
                     initialUserHasReviewed={initialReviewData.userHasReviewed}
                     initialError={initialReviewData.error}
                 />
             </TabsContent>
         )}
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            {/* Use max-h instead of fixed h for better adaptability */}
            <ScrollArea className="max-h-[70vh] pr-6">
              <div className="space-y-6 py-4"> {/* Increased default spacing */}

                {/* Combined Image Preview Area */}
                <div className="relative mb-12 h-28 rounded-lg"> {/* Container: relative, height allows overlap, margin-bottom */}
                  {/* Background Upload Trigger & Preview Layer */}
                  <Label 
                    htmlFor="background-upload-input" 
                    className="absolute inset-x-0 top-0 h-32 bg-muted rounded-md overflow-hidden border cursor-pointer group" 
                  > 
                    {newBackgroundUrl? (
                      <img
                        src={newBackgroundUrl}
                        alt="Previsualización Portada"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-gray-500" />
                      </div>
                    )}
                    {/* Background Edit Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                       <EditIcon className="h-6 w-6 text-white" /> 
                    </div>
                  </Label>
                  {/* Hidden Background File Input */}
                  <input 
                    ref={backgroundInputRef}
                    id="background-upload-input"
                    type="file"
                    accept="image/jpeg, image/png, image/webp, image/gif"
                    onChange={handleBackgroundFileChange}
                    className="hidden"
                    disabled={isEditPending || isUploading} // Disable if uploading background
                  />

                  {/* Profile Picture Upload Trigger & Preview Layer */}
                  {/* Positioned over the background, centered */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 z-10">
                    <Label 
                      htmlFor="profile-picture-upload"
                      className="block relative cursor-pointer group"
                    >
                      <Avatar className="h-20 w-20 border-4 border-background rounded-full"> {/* Border matches dialog bg */}
                        <AvatarImage src={profilePicPreview || currentUser?.imageUrl || undefined} alt="Previsualización Perfil" /> 
                        <AvatarFallback>{editForm.name ? editForm.name.charAt(0).toUpperCase() : "?"}</AvatarFallback> 
                      </Avatar> 
                      {/* Profile Picture Edit Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         <EditIcon className="h-5 w-5 text-white" />
                      </div>
                    </Label>
                    {/* Hidden Profile Pic File Input (ensure ID matches Label's htmlFor) */}
                    <input
                      ref={fileInputRef}
                      id="profile-picture-upload"
                      type="file"
                      accept="image/jpeg, image/png, image/webp, image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isEditPending}
                    />
                  </div>
                </div>

                {/* Text fields remain below the combined image area */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label> 
                  <Input 
                    id="name" 
                    name="name" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                    placeholder="Tu nombre" 
                    disabled={isEditPending}
                  />
                </div>
                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="edit-bio">Biografía</Label>
                  <Textarea id="edit-bio" name="bio" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="min-h-[100px]" placeholder="Cuéntanos sobre ti" disabled={isEditPending}/>
                </div>
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Ubicación</Label>
                  <Input id="edit-location" name="location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="¿Dónde te encuentras?" disabled={isEditPending}/>
                </div>
                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Sitio Web</Label>
                  <Input id="edit-website" name="website" value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} placeholder="tuwebsite.com" disabled={isEditPending}/>
                </div>
                {/* Is Company Toggle */}
                <div className="flex items-center justify-between space-x-2 pt-2">
                  <Label htmlFor="isCompany" className="flex flex-col space-y-1">
                    <span>Cuenta Empresa</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">Activa esto si representas a una empresa u organización.</span>
                  </Label>
                  <input
                    type="checkbox"
                    id="isCompany"
                    className="form-checkbox h-5 w-5 text-primary rounded shadow-none focus:ring-primary focus:ring-offset-0" // Adjusted focus ring
                    checked={editForm.isCompany}
                    disabled={isEditPending}
                    onChange={(e) => {
                      const isCompanyChecked = e.target.checked;
                      setEditForm({ ...editForm, isCompany: isCompanyChecked });
                      // Enforce category limit immediately if switching to company
                      if (isCompanyChecked && selectedCategories.length > 5) {
                        const limitedCategories = selectedCategories.slice(0, 5);
                        setSelectedCategories(limitedCategories);
                        toast.error('Las cuentas de empresa solo pueden seleccionar hasta 5 categorías. Se han eliminado las categorías excedentes.');
                      }
                    }}
                  />
                </div>

                {/* Categories Section */}
                <div className="space-y-2 pt-2">
                  <Label>{editForm.isCompany ? 'Categorías de la Empresa' : 'Categorías de Interés'}</Label>
                  {/* Ensure MultiSelectCategories component is correctly imported and used */}
                  <MultiSelectCategories
                      allCategories={COMPANY_CATEGORIES}
                      selectedCategories={selectedCategories}
                      onChange={handleCategoriesChange}
                      placeholder="Selecciona categorías..."
                      maxSelection={editForm.isCompany ? 5 : undefined}
                      disabled={isEditPending}
                  />

                  {/* === Section for Selected Category Badges === */}
                  {selectedCategories.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed">
                          <div className="flex flex-wrap gap-2">
                              {selectedCategories.map((category) => (
                                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                                      <span>{category}</span>
                                      <button
                                          type="button"
                                          onClick={() => handleRemoveCategory(category)}
                                          className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 focus:outline-none focus:ring-1 focus:ring-destructive"
                                          aria-label={`Quitar ${category}`}
                                          disabled={isEditPending}
                                      >
                                          <X className="h-3 w-3"/>
                                      </button>
                                  </Badge>
                              ))}
                      </div>
                      </div>
                  )}
                  {/* === End Selected Category Badges Section === */}

                  {/* Informational text about the limit */}
                  {editForm.isCompany && (
                       <p className="text-xs text-muted-foreground pt-1">Puedes seleccionar hasta 5 categorías.</p>
                  )}
                </div>

              </div>
            </ScrollArea>
            <DialogFooter className="mt-4 pt-4 border-t">
              <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isEditPending}>
                    Cancelar
                  </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleEditSubmit}
                // Consider adding || isUploading for profile pic if that state exists
                disabled={isEditPending || !isClerkLoaded || isUploading}
              >
                {isEditPending || isUploading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}

export default ProfilePageClient;
