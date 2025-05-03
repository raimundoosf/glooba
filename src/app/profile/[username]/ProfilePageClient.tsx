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
  LinkIcon,
  MapPinIcon,
  Star,
  X,
} from "lucide-react";
import { useState, useEffect, useTransition, startTransition, useCallback } from "react";
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

// --- Type definitions ---
type UserProfile = NonNullable<Awaited<ReturnType<typeof getProfileByUsername>>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;
// Add type for initial review data passed from server
type InitialReviewData = Omit<PaginatedReviewsResponse, 'reviews' | 'success' | 'error' | 'currentPage' | 'pageSize'> & {
    reviews: ReviewWithAuthor[];
    error?: string;
};

interface ProfilePageClientProps {
  user: UserProfile; // Use updated type name
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  initialReviewData: InitialReviewData; // Pass initial reviews/stats
}

// --- Read-only Star Display Component --- (Moved here or keep in ReviewCard)
function DisplayStars({ rating, count, size = 16 }: { rating: number | null; count?: number; size?: number }) {
    if (rating === null || rating === undefined) return <span className="text-sm text-muted-foreground">No reviews yet</span>;
    const stars = Array(5).fill(0);
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    return (
        <div className="flex items-center space-x-1">
            {stars.map((_, index) => {
                const starValue = index + 1;
                return (
                    <Star
                        key={index}
                        size={size}
                        className={cn(
                            "transition-colors",
                            starValue <= roundedRating ? "text-yellow-400 fill-yellow-400" : // Full star
                            starValue - 0.5 === roundedRating ? "text-yellow-400" : // Half star (outline) - needs custom SVG for partial fill
                            "text-gray-300 dark:text-gray-600" // Empty star
                        )}
                    />
                );
            })}
            {count !== undefined && <span className="ml-2 text-sm text-muted-foreground">({count})</span>}
        </div>
    );
}

// --- Component ---
function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
  initialReviewData, // Receive initial review data
}: ProfilePageClientProps) {
  // --- Hooks ---

  const { user: currentUser, isSignedIn, isLoaded: isClerkLoaded } = useUser(); // Make sure isLoaded is destructured
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null); // State for the new profile picture file
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null); // State for image preview URL
  const [isEditPending, startEditTransition] = useTransition();
  const [isFollowPending, startFollowTransition] = useTransition(); // Separate transition for follow
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false); // State for follow button loading
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Declare dialog state
  // State for review data - might need update after submission
  const [reviewStats, setReviewStats] = useState({
      averageRating: initialReviewData.averageRating,
      totalCount: initialReviewData.totalCount,
      userHasReviewed: initialReviewData.userHasReviewed,
  });
  // State to trigger refresh of reviews list
  const [reviewListVersion, setReviewListVersion] = useState(0);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    isCompany: false,
  });
  // State ONLY for the selected categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // --- Effects ---

  // Update form when user data changes (e.g., after initial load or update)
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        isCompany: user.isCompany || false,
      });
      setSelectedCategories(user.categories || []);
      // Reset profile picture state when dialog opens or user changes
      setNewProfilePic(null);
      setProfilePicPreview(null);
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
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        isCompany: user.isCompany || false,
     });
     setIsFollowing(initialIsFollowing);
  }, [user, initialIsFollowing]);

  // --- Handlers ---
  const handleEditSubmit = () => {
      if (!isOwner || !isClerkLoaded || !currentUser) return; // Added Clerk checks

      startEditTransition(async () => {
          let clerkUpdatePromise: Promise<any> | null = null;
          let profileUpdatePromise: Promise<any> | null = null;
          const toastId = toast.loading("Guardando cambios...");

          try {
              // 1. Update profile picture in Clerk if a new one is selected
              if (newProfilePic) {
                  clerkUpdatePromise = currentUser.setProfileImage({ file: newProfilePic })
                      .then(() => {
                          toast.success("Foto de perfil actualizada.", { id: toastId });
                          setNewProfilePic(null);
                          setProfilePicPreview(null);
                          // Clerk's currentUser object should update automatically,
                          // making currentUser.imageUrl available below.
                      })
                      .catch((error) => {
                          console.error("Error updating profile picture in Clerk:", error);
                          toast.error("Error al actualizar la foto de perfil.", { id: toastId });
                          throw error;
                      });
              } else {
                  clerkUpdatePromise = Promise.resolve();
              }

              // 2. Wait for Clerk update to finish
              await clerkUpdatePromise;

              // --- IMPORTANT: currentUser object should now have the updated imageUrl if Clerk update happened ---

              // 3. Prepare data object for database update (no more FormData)
              const profileDataToUpdate: { // Define type inline or import if defined elsewhere
                  name?: string;
                  bio?: string;
                  isCompany?: boolean;
                  location?: string;
                  website?: string;
                  categories?: string[];
                  imageUrl?: string | null;
              } = {
                  ...editForm,
                  categories: selectedCategories,
                  // Include the potentially updated image URL from Clerk's user object
                  imageUrl: currentUser.imageUrl,
              };

              // 4. Update profile details in the database via server action
              profileUpdatePromise = updateProfile(profileDataToUpdate) // Pass the object
                 .then((result) => {
                     if (result.error) {
                         console.error("Database update error:", result.error);
                         // Use existing toast ID only if Clerk didn't update, otherwise show new toast
                         if (!newProfilePic) {
                             toast.error(`Error al guardar: ${result.error}`, { id: toastId });
                         } else {
                             toast.error(`Error al guardar detalles del perfil: ${result.error}`); // New toast for DB error
                         }
                         throw new Error(result.error); // Throw to indicate failure
                     } else {
                         // Success message depends on whether Clerk was also updated
                         if (!newProfilePic) {
                             toast.success("Perfil actualizado con éxito.", { id: toastId });
                         } else {
                             toast.success("Detalles del perfil guardados."); // Clerk already showed success for image
                         }
                         setIsEditDialogOpen(false); // Close dialog on success
                     }
                 })
                 .catch((error) => {
                     console.error("Error in profile update process:", error);
                      if (!document.querySelector(`[data-toast-id="${toastId}"]`)) {
                          toast.error("Ocurrió un error inesperado al guardar.");
                      }
                 });

              await profileUpdatePromise; // Wait for the database update to complete

          } catch (error) {
              console.error("Overall error during profile update:", error);
               if (document.querySelector(`[data-toast-id="${toastId}"]`)) {
                    toast.dismiss(toastId);
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
    setIsUpdatingFollow(true);
      try {
      const result = await toggleFollow(user.id);
      if (result?.success) {
          setIsFollowing(!isFollowing);
      } else {
          throw new Error(result?.error || "Failed to toggle follow");
          }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast.error(error.message || "Error al actualizar el estado de seguimiento");
    } finally {
      setIsUpdatingFollow(false);
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

  // Callback function to refresh reviews after submission
  const handleReviewSubmitted = useCallback(async () => {
    console.log("Review submitted, refreshing reviews...");
    // Option 1: Increment key to force remount/refetch of ReviewsSection
    setReviewListVersion(prev => prev + 1);
    // Option 2: Fetch stats again here and update reviewStats state
    // This avoids remounting the list but requires fetching stats again
    try {
        const updatedStats = await getCompanyReviewsAndStats({ companyId: user.id });
        if (updatedStats.success) {
            setReviewStats({
                averageRating: updatedStats.averageRating,
                totalCount: updatedStats.totalCount,
                userHasReviewed: updatedStats.userHasReviewed,
            });
        }
    } catch (e) { console.error("Failed to refresh review stats", e); }
  }, [user.id]); // Dependency on user.id

  const isOwner = currentUser?.id === user.clerkId; // Declare isOwner variable
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
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar, Name, Username, Verified Badge */}
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">
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
                         <DisplayStars rating={reviewStats.averageRating} count={reviewStats.totalCount} size={18} />
                    </div>
                 )}

                {/* Bio */}
                 <p className="mt-2 text-sm">{user.bio}</p>

                {/* Profile Stats */}
                <div className="w-full mt-6">
                  <div className="grid grid-cols-3 gap-4"> {/* Always 3 columns */}
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">{user._count.following.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Siguiendo</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">{user._count.followers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Seguidores</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="font-semibold">{user._count.posts.toLocaleString()}</div>
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
                        disabled={isUpdatingFollow}
                        variant={isFollowing ? "outline" : "default"}
                      >
                        {isUpdatingFollow ? "Actualizando..." : (isFollowing ? "Dejar de seguir" : "Seguir")}
                      </Button>
                    )}
                </div>


                 {/* Location, Website, Joined Date */}
                <div className="w-full mt-6 space-y-2 text-sm text-left"> {/* Align left */}
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
              </div>
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
                 {isSignedIn && !isOwnProfile && (
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
                     key={reviewListVersion} // Force remount/refetch when version changes
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
          <ScrollArea className="h-[60vh] max-h-[600px] pr-6">
            <div className="space-y-4 py-4">
               {/* Profile Picture Upload */}
               <div className="space-y-2">
                  <Label htmlFor="profile-picture">Foto de Perfil</Label>
                  {/* Image Preview */}
                  {(profilePicPreview || currentUser?.imageUrl) && (
                      <Avatar className="h-20 w-20 mb-2">
                          <AvatarImage src={profilePicPreview || currentUser?.imageUrl || undefined} alt="Previsualización"/>
                          <AvatarFallback>{editForm.name ? editForm.name.charAt(0).toUpperCase() : "?"}</AvatarFallback>
                      </Avatar>
                  )}
                  <Input
                     id="profile-picture"
                     type="file"
                     accept="image/png, image/jpeg, image/webp, image/gif" // Specify acceptable types
                     onChange={handleFileChange}
                     className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" // Basic styling
                     disabled={isEditPending || !isClerkLoaded}
                   />
                   <p className="text-xs text-muted-foreground">Sube un archivo JPG, PNG, WEBP o GIF (máx 5MB).</p>
                </div>
              
                {/* Rest of the form fields... */}
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input id="edit-name" name="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Tu nombre" disabled={isEditPending}/>
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
                   className="form-checkbox h-5 w-5 text-primary rounded shadow-none focus:ring-primary"
                   checked={editForm.isCompany}
                   disabled={isEditPending}
                   onChange={(e) => {
                     const isCompanyChecked = e.target.checked;
                     setEditForm({ ...editForm, isCompany: isCompanyChecked });
                     // Enforce category limit immediately if switching to company
                     if (isCompanyChecked && selectedCategories.length > 5) {
                       // Slice the array AND update state
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
                {/* MultiSelect Component (Simplified Version) */}
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
                        {/* Optional Label */}
                        {/* <Label className="text-xs text-muted-foreground mb-2 block">Seleccionadas:</Label> */}
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((category) => (
                                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                                    <span>{category}</span> {/* Wrap text in span */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCategory(category)} // Call remove handler
                                        className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 focus:outline-none focus:ring-1 focus:ring-destructive" // Added focus style
                                        aria-label={`Quitar ${category}`}
                                        disabled={isEditPending} // Disable remove button while submitting
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
             <Button type="button" onClick={handleEditSubmit} disabled={isEditPending || !isClerkLoaded}> {/* Also disable if clerk not loaded */}
               {isEditPending ? "Guardando..." : "Guardar Cambios"}
             </Button>
           </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePageClient;
