/**
 * Client-side component for the profile page
 * @module ProfilePageClient
 */
"use client";

import { getUserPosts, updateProfile } from "@/actions/profile.action";
import {
  getCompanyReviewsAndStats,
  ReviewWithAuthor,
} from "@/actions/review.action";
import { incrementProfileView, toggleFollow } from "@/actions/user.action";
import { updateUserScope } from "@/actions/scope.action";
import { MultiSelectCategories } from "@/components/MultiSelectCategories";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_CATEGORIES } from "@/lib/constants";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BellIcon,
  BellOffIcon,
  BellPlus,
  BellPlusIcon,
  BellRing,
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  ImageIcon,
  LinkIcon,
  MapPinIcon,
  Star,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { DisplayStars } from "@/components/reviews/DisplayStars";
import { LeaveReviewForm } from "@/components/reviews/LeaveReviewForm";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { generateReactHelpers } from "@uploadthing/react";
import { ScopeType, Region, Commune } from "@prisma/client"; // Nuevas importaciones de tipos
import { useRouter } from "next/navigation"; // <<< IMPORTAR useRouter

/**
 * Interface defining the user profile type
 * @interface UserProfile
 */
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
  backgroundImage: string | null;
  CompanyServiceArea: {
    scope: ScopeType;
    regionId: string | null;
    communeId: string | null;
  }[];
  followers: { followerId: string }[];
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

/**
 * Type for posts data
 * @type {Posts}
 */
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

/**
 * Interface for initial review data
 * @interface InitialReviewData
 */
interface InitialReviewData {
  reviews: ReviewWithAuthor[];
  error?: string;
  totalCount: number;
  averageRating: number | null;
  hasNextPage: boolean;
  userHasReviewed: boolean;
}

/**
 * Props interface for ProfilePageClient component
 * @interface ProfilePageClientProps
 */
interface ProfilePageClientProps {
  user: UserProfile;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  initialReviewData: InitialReviewData;
}

/**
 * Interface for profile edit form data
 * @interface ProfileEditFormData
 */
interface ProfileEditFormData {
  name: string;
  bio: string;
  location: string;
  website: string;
  isCompany: boolean;
}

/**
 * Uploadthing setup for file uploads
 */
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

/**
 * Main profile page client component
 * @param {ProfilePageClientProps} props - Component props
 * @returns {JSX.Element} The profile page component with tabs for posts, likes, and reviews
 */
function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
  initialReviewData,
}: ProfilePageClientProps) {
  const router = useRouter();
  const { user: currentUser, isLoaded: isClerkLoaded } = useUser();
  const { startUpload, isUploading } = useUploadThing("profileBackground");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [isEditPending, startEditTransition] = useTransition();
  const [isFollowingState, setIsFollowingState] =
    useState<boolean>(initialIsFollowing);
  const [isFollowPending, startFollowTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [newBackgroundUrl, setNewBackgroundUrl] = useState<string | null>(
    user.backgroundImage
  );
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    user.image
  );

  // --- Geographic Scope ---
  const [scope, setScope] = useState<ScopeType | null>(() => {
    // Initialize scope from user's service area if it exists
    return user.CompanyServiceArea.length > 0
      ? user.CompanyServiceArea[0].scope
      : null;
  });
  const [allRegions, setAllRegions] = useState<Region[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [communesForSelectedRegions, setCommunesForSelectedRegions] = useState<
    Commune[]
  >([]);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([]);

  const [editForm, setEditForm] = useState<ProfileEditFormData>({
    name: user.name ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
    website: user.website ?? "",
    isCompany: user.isCompany ?? false,
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    user.categories ?? []
  );

  const viewIncremented = useRef(false);

  // Increment profile view count on component mount for company profiles
  useEffect(() => {
    if (user.isCompany && !viewIncremented.current) {
      incrementProfileView(user.id);
      viewIncremented.current = true;
    }
  }, [user.id, user.isCompany]);

  // --- Geographic Scope ---
  useEffect(() => {
    // Fetch regions
    const fetchRegions = async () => {
      try {
        const res = await fetch("/api/regions");
        if (!res.ok) throw new Error("Failed to fetch regions");
        const data = await res.json();
        setAllRegions(data);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar las regiones.");
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    // Fetch communes when user selects regions in 'COMMUNE' mode
    if (scope !== "COMMUNE" || selectedRegions.length === 0) {
      setCommunesForSelectedRegions([]);
      return;
    }

    const fetchCommunes = async () => {
      try {
        const promises = selectedRegions.map((regionId) =>
          fetch(`/api/regions/${regionId}/communes`).then((res) => res.json())
        );
        const results = await Promise.all(promises);
        setCommunesForSelectedRegions(results.flat());
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar las comunas.");
      }
    };
    fetchCommunes();
  }, [selectedRegions, scope]);

  // Update form when user data changes or dialog opens/closes
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
      setNewProfilePic(null);
      setProfilePicPreview(user.image);
      setNewBackgroundUrl(user.backgroundImage);

      // Initialize scope based on user's service areas
      const serviceAreas = user.CompanyServiceArea ?? [];
      if (serviceAreas.length > 0) {
        const firstArea = serviceAreas[0];
        setScope(firstArea.scope);

        if (firstArea.scope === "REGION") {
          setSelectedRegions(
            serviceAreas
              .map((area) => area.regionId)
              .filter(Boolean) as string[]
          );
          setSelectedCommunes([]); // Clear communes if scope is regional
        } else if (firstArea.scope === "COMMUNE") {
          const communeIds = serviceAreas
            .map((area) => area.communeId)
            .filter(Boolean) as string[];
          const regionIds = serviceAreas
            .map((area) => area.regionId)
            .filter(Boolean) as string[];

          setSelectedCommunes(communeIds);
          // Pre-select unique regions to which the saved communes belong
          setSelectedRegions([...new Set(regionIds)]);
        } else {
          // Clear selections if scope is National
          setSelectedRegions([]);
          setSelectedCommunes([]);
        }
      } else {
        // Clear scope and selections if no service areas
        setScope(null);
        setSelectedRegions([]);
        setSelectedCommunes([]);
      }
    }
  }, [user, isEditDialogOpen]);

  // Create blob URL for preview when newProfilePic changes
  useEffect(() => {
    if (newProfilePic) {
      const objectUrl = URL.createObjectURL(newProfilePic);
      setProfilePicPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setProfilePicPreview(null);
    }
  }, [newProfilePic]);

  // Initialize state when user data changes
  useEffect(() => {
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

  const handleEditSubmit = () => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para editar tu perfil.");
      return;
    }

    const toastId = toast.loading("Guardando cambios...");

    startEditTransition(async () => {
      try {
        let profileImageUrl = currentUser.imageUrl;

        // 1. Update profile picture via Clerk if a new one is selected
        if (newProfilePic) {
          try {
            await currentUser.setProfileImage({
              file: newProfilePic,
            });
            await currentUser.reload(); // Reload user data to get the new URL
            profileImageUrl = currentUser.imageUrl; // Get the new URL from Clerk
            setNewProfilePic(null); // Clear the preview state
          } catch (clerkError: any) {
            console.error(
              "Error al actualizar la imagen en Clerk:",
              clerkError
            );
            throw new Error(
              `Error al actualizar imagen: ${clerkError.errors?.[0]?.message || clerkError.message}`
            );
          }
        }

        // 2. Upload new background image if available
        let backgroundImageUrl = user.backgroundImage;
        if (newBackgroundUrl && newBackgroundUrl !== user.backgroundImage) {
          const backgroundFile = await fetch(newBackgroundUrl)
            .then((res) => res.blob())
            .then(
              (blob) =>
                new File([blob], "background.jpg", { type: "image/jpeg" })
            );

          const uploaded = await startUpload([backgroundFile]);
          if (uploaded && uploaded[0]) {
            backgroundImageUrl = uploaded[0].url;
          }
        }

        // 3. Prepare data for database update
        const profileDataToUpdate = {
          ...editForm,
          username: user.username,
          categories: selectedCategories,
          imageUrl: profileImageUrl,
          backgroundImage: backgroundImageUrl,
        };

        // 4. Update profile details in our database
        const dbResult = await updateProfile(profileDataToUpdate);
        if (dbResult.error) {
          throw new Error(`Error al guardar detalles: ${dbResult.error}`);
        }

        // 5. Update company scope if applicable
        if (editForm.isCompany) {
          if (scope === null) {
            await updateUserScope({
              companyId: user.id,
              scope: "COUNTRY",
              regions: [],
              communes: [],
            });
          } else {
            await updateUserScope({
              companyId: user.id,
              scope: scope,
              regions: scope === "REGION" ? selectedRegions : [],
              communes: scope === "COMMUNE" ? selectedCommunes : [],
            });
          }
        }

        toast.success("Perfil actualizado con éxito!", { id: toastId });
        router.refresh();
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error("Error al guardar el perfil:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Ocurrió un error desconocido.",
          { id: toastId }
        );
      }
    });
  };

  const handleCategoriesChange = (newSelection: string[]) => {
    if (editForm.isCompany && newSelection.length > 5) {
      toast.error(
        "Las cuentas de empresa solo pueden seleccionar hasta 5 categorías."
      );
      if (newSelection.length > selectedCategories.length) return;
    }
    setSelectedCategories(newSelection);
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setSelectedCategories((prev) =>
      prev.filter((cat) => cat !== categoryToRemove)
    );
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para seguir a un usuario.");
      return;
    }
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
      toast.error(
        error.message || "Error al actualizar el estado de seguimiento"
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional: add size/type checks)
      if (file.size > 5 * 1024 * 1024) {
        // Example: 5MB limit
        toast.error("La imagen no puede superar los 5MB.");
        setNewProfilePic(null);
        setProfilePicPreview(null);
        event.target.value = ""; // Reset file input
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        )
      ) {
        toast.error("Tipo de archivo no válido. Sube JPG, PNG, WEBP o GIF.");
        setNewProfilePic(null);
        setProfilePicPreview(null);
        event.target.value = ""; // Reset file input
        return;
      }
      setNewProfilePic(file);
    } else {
      setNewProfilePic(null);
    }
  };

  // Handler for Background Image Selection using Uploadthing
  const handleBackgroundFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation (optional: add size/type checks)
    if (file.size > 8 * 1024 * 1024) {
      // Example: 8MB limit for background
      toast.error("La imagen de portada no puede superar los 8MB.");
      event.target.value = ""; // Reset file input
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type
      )
    ) {
      toast.error(
        "Tipo de archivo no válido para portada. Sube JPG, PNG, WEBP o GIF."
      );
      event.target.value = ""; // Reset file input
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
      toast.error(
        `Error al subir portada: ${error.message || "Error desconocido"}`,
        {
          id: toastId,
        }
      );
    } finally {
      event.target.value = ""; // Reset file input value regardless of outcome
    }
  };

  // Callback function to refresh reviews after submission
  const handleReviewSubmitted = useCallback(async () => {
    console.log("Review submitted, refreshing reviews...");
    // Option 1: Increment key to force remount/refetch of ReviewsSection
    // Option 2: Fetch stats again here and update reviewStats state
    // This avoids remounting the list but requires fetching stats again
    try {
      const updatedStats = await getCompanyReviewsAndStats({
        companyId: user.id,
      });
      if (updatedStats.success) {
        // Update reviewStats state
      }
    } catch (e) {
      console.error("Failed to refresh review stats", e);
    }
  }, [user.id]); // Dependency on user.id

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;
  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy", {
    locale: es,
  });

  // --- Render ---
  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header Card */}
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
            {" "}
            {/* Added overflow-hidden */}
            {/* Removed pt-6, added relative positioning context and bottom padding */}
            <CardContent className="px-4 py-6 relative">
              {/* 1. Background Image Area - Positioned absolutely */}
              <div className="absolute inset-x-0 top-0 h-32 bg-muted">
                {" "}
                {/* Container with fixed height & fallback bg */}
                {user.backgroundImage ? (
                  <img
                    src={user.backgroundImage}
                    alt={`${user.name ?? user.username}'s background`}
                    className="w-full h-full object-cover" // Covers the area
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="h-12 w-12 text-gray-500" />{" "}
                    {/* Centered placeholder */}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center text-center pt-20">
                {" "}
                {/* Adjusted top padding */}
                <Avatar className="w-24 h-24 -mt-12 border-4 border-card relative z-10">
                  {" "}
                  {/* Added negative margin, border, relative, z-index */}
                  <AvatarImage
                    src={user.image ?? "/avatar.png"}
                    alt={`${user.name ?? user.username}'s profile`}
                  />
                  <AvatarFallback>
                    {user.name
                      ? user.name.substring(0, 2)
                      : user.username.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {/* --- REST OF THE ORIGINAL LAYOUT --- */}
                {/* Ensure spacing below avatar is sufficient, original mt-4 might be fine */}
                {/* Name, Username, Verified Badge */}
                <h1 className="mt-4 text-2xl font-bold">
                  {" "}
                  {/* Kept original mt-4 */}
                  {user.name ?? user.username}
                </h1>
                <p className="text-muted-foreground">
                  @{user.username}
                  {user.isCompany && (
                    <svg
                      className="ml-1.5 inline-flex items-center"
                      width="18px"
                      height="18px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.02975 3.3437C10.9834 2.88543 13.0166 2.88543 14.9703 3.3437C17.7916 4.00549 19.9945 6.20842 20.6563 9.02975C21.1146 10.9834 21.1146 13.0166 20.6563 14.9703C19.9945 17.7916 17.7916 19.9945 14.9703 20.6563C13.0166 21.1146 10.9834 21.1146 9.02975 20.6563C6.20842 19.9945 4.0055 17.7916 3.3437 14.9703C2.88543 13.0166 2.88543 10.9834 3.3437 9.02974C4.0055 6.20841 6.20842 4.00549 9.02975 3.3437ZM15.0524 10.4773C15.2689 10.2454 15.2563 9.88195 15.0244 9.6655C14.7925 9.44906 14.4291 9.46159 14.2126 9.6935L11.2678 12.8487L9.77358 11.3545C9.54927 11.1302 9.1856 11.1302 8.9613 11.3545C8.73699 11.5788 8.73699 11.9425 8.9613 12.1668L10.8759 14.0814C10.986 14.1915 11.1362 14.2522 11.2919 14.2495C11.4477 14.2468 11.5956 14.181 11.7019 14.0671L15.0524 10.4773Z"
                        fill="#1281ff"
                      />
                    </svg>
                  )}
                </p>
                {/* Display Average Rating for Companies */}
                {user.isCompany && (
                  <div className="mt-3 flex items-center gap-2">
                    <DisplayStars
                      rating={initialReviewData.averageRating}
                      count={initialReviewData.totalCount}
                      size={18}
                    />
                  </div>
                )}
                {/* Bio */}
                <p className="mt-2 text-sm">{user.bio}</p>
                {/* Action Buttons (Follow/Edit) */}
                <div className="w-full mt-4">
                  {!currentUser ? (
                    <SignInButton mode="modal">
                      <Button className="w-full">
                        <BellPlus className="size-4 mr-2" /> Recibir novedades
                      </Button>
                    </SignInButton>
                  ) : isOwnProfile ? (
                    <Button
                      className="w-full"
                      onClick={() => setIsEditDialogOpen(true)}
                    >
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
                      <>
                        {isFollowingState ? (
                          <BellRing className="size-4 mr-2" />
                        ) : (
                          <BellPlus className="size-4 mr-2" />
                        )}
                        {isFollowPending
                          ? "Actualizando..."
                          : isFollowingState
                            ? "Siguiendo"
                            : "Recibir novedades"}
                      </>
                    </Button>
                  )}
                </div>
                {/* Location, Website, Joined Date */}
                <div className="w-full mt-6 space-y-2 text-sm text-left">
                  {" "}
                  {/* Kept original text-left */}
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
                        href={
                          user.website.startsWith("http")
                            ? user.website
                            : `https://${user.website}`
                        }
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
              </div>{" "}
              {/* End flex-col container */}
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
            <TabsTrigger
              value="reviews"
              className="flex-1 flex items-center justify-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-6 font-semibold text-muted-foreground"
            >
              <Star className="size-4" />
              Reseñas
            </TabsTrigger>
          )}
        </TabsList>

        {/* Posts Content */}
        <TabsContent value="posts" className="mt-6">
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  dbUserId={currentUser?.id ?? null}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aún no hay publicaciones
              </div>
            )}
          </div>
        </TabsContent>

        {/* Likes Content */}
        <TabsContent value="likes" className="mt-6">
          <div className="space-y-6">
            {likedPosts.length > 0 ? (
              likedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  dbUserId={currentUser?.id ?? null}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aún no hay publicaciones que te gusten
              </div>
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
            <div className="space-y-6 py-4">
              {" "}
              {/* Increased default spacing */}
              {/* Combined Image Preview Area */}
              <div className="relative mb-12 h-28 rounded-lg">
                {" "}
                {/* Container: relative, height allows overlap, margin-bottom */}
                {/* Background Upload Trigger & Preview Layer */}
                <Label
                  htmlFor="background-upload-input"
                  className="absolute inset-x-0 top-0 h-32 bg-muted rounded-md overflow-hidden border cursor-pointer group"
                >
                  {newBackgroundUrl ? (
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
                    <Avatar className="h-20 w-20 border-4 border-background rounded-full">
                      {" "}
                      {/* Border matches dialog bg */}
                      <AvatarImage
                        src={
                          profilePicPreview ||
                          currentUser?.imageUrl ||
                          undefined
                        }
                        alt="Previsualización Perfil"
                      />
                      <AvatarFallback>
                        {editForm.name
                          ? editForm.name.charAt(0).toUpperCase()
                          : "?"}
                      </AvatarFallback>
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Tu nombre"
                  disabled={isEditPending}
                />
              </div>
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Biografía</Label>
                <Textarea
                  id="edit-bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className="min-h-[100px]"
                  placeholder="Cuéntanos sobre ti"
                  disabled={isEditPending}
                />
              </div>
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  placeholder="¿Dónde te encuentras?"
                  disabled={isEditPending}
                />
              </div>
              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="edit-website">Sitio Web</Label>
                <Input
                  id="edit-website"
                  name="website"
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  placeholder="tuwebsite.com"
                  disabled={isEditPending}
                />
              </div>
              <div className="space-y-2 pt-2">
                <Label>
                  {editForm.isCompany
                    ? "Categorías de la Empresa"
                    : "Categorías de Interés"}
                </Label>
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
                        <Badge
                          key={category}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <span>{category}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(category)}
                            className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 focus:outline-none focus:ring-1 focus:ring-destructive"
                            aria-label={`Quitar ${category}`}
                            disabled={isEditPending}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* === End Selected Category Badges Section === */}

                {/* Informational text about the limit */}
                {editForm.isCompany && (
                  <p className="text-xs text-muted-foreground pt-1">
                    Puedes seleccionar hasta 5 categorías.
                  </p>
                )}
              </div>
              {/* --- Geographical Scope Section --- */}
              {editForm.isCompany && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Alcance Geográfico</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-6">
                      <Label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="scope"
                          value="COUNTRY"
                          checked={scope === "COUNTRY"}
                          onChange={() => setScope("COUNTRY")}
                        />
                        <span>Nacional</span>
                      </Label>
                      <Label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="scope"
                          value="REGION"
                          checked={scope === "REGION"}
                          onChange={() => setScope("REGION")}
                        />
                        <span>Regional</span>
                      </Label>
                      <Label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="scope"
                          value="COMMUNE"
                          checked={scope === "COMMUNE"}
                          onChange={() => setScope("COMMUNE")}
                        />
                        <span>Comunal</span>
                      </Label>
                    </div>
                    {scope === null && (
                      <p className="text-sm text-muted-foreground">
                        No se ha especificado un alcance geográfico
                      </p>
                    )}
                  </div>

                  {scope === "REGION" && (
                    <div className="space-y-2">
                      <Label>Selecciona Regiones</Label>
                      <ScrollArea className="h-40 w-full rounded-md border p-2">
                        {allRegions.map((region) => (
                          <div
                            key={region.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`region-${region.id}`}
                              checked={selectedRegions.includes(region.id)}
                              onChange={(e) => {
                                setSelectedRegions((prev) =>
                                  e.target.checked
                                    ? [...prev, region.id]
                                    : prev.filter((id) => id !== region.id)
                                );
                              }}
                            />
                            <label htmlFor={`region-${region.id}`}>
                              {region.name}
                            </label>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}

                  {scope === "COMMUNE" && (
                    <div className="flex space-x-4">
                      <div className="w-1/2 space-y-2">
                        <Label>1. Selecciona Regiones</Label>
                        <ScrollArea className="h-40 w-full rounded-md border p-2">
                          {allRegions.map((region) => (
                            <div
                              key={region.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={`commune-region-${region.id}`}
                                checked={selectedRegions.includes(region.id)}
                                onChange={(e) => {
                                  setSelectedRegions((prev) =>
                                    e.target.checked
                                      ? [...prev, region.id]
                                      : prev.filter((id) => id !== region.id)
                                  );
                                }}
                              />
                              <label htmlFor={`commune-region-${region.id}`}>
                                {region.name}
                              </label>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                      <div className="w-1/2 space-y-2">
                        <Label>2. Selecciona Comunas</Label>
                        <ScrollArea className="h-40 w-full rounded-md border p-2">
                          {communesForSelectedRegions.length > 0 ? (
                            communesForSelectedRegions.map((commune) => (
                              <div
                                key={commune.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  id={`commune-${commune.id}`}
                                  checked={selectedCommunes.includes(
                                    commune.id
                                  )}
                                  onChange={(e) => {
                                    setSelectedCommunes((prev) =>
                                      e.target.checked
                                        ? [...prev, commune.id]
                                        : prev.filter((id) => id !== commune.id)
                                    );
                                  }}
                                />
                                <label htmlFor={`commune-${commune.id}`}>
                                  {commune.name}
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Selecciona una o más regiones para ver las
                              comunas.
                            </p>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              {isEditPending || isUploading
                ? "Guardando..."
                : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePageClient;
