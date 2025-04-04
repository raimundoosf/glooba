// src/app/profile/[username]/ProfilePageClient.tsx
"use client";

import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter, // Import DialogFooter
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
  PlusCircleIcon, // Icon for Add button
  X,
} from "lucide-react";
import { useState, useEffect, useTransition } from "react"; // Import useTransition
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { COMPANY_CATEGORIES } from "@/lib/constants"; // Import the constant

// --- Type definitions ---
type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  // Pass current logged-in user's DB ID for PostCard interactions if needed elsewhere
  // dbUserId: string | null;
}

// --- Component ---
function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  // --- Hooks ---
  const { user: currentUser } = useUser();
  const [isPending, startTransition] = useTransition(); // For form submission

  // --- State ---
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    isCompany: user.isCompany || false,
  });
  // State for categories in the edit dialog
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState(""); // Category selected in the dropdown

  // --- Effects ---
  // Initialize selectedCategories when dialog opens or user data changes
  useEffect(() => {
    if (user?.categories) {
      setSelectedCategories(user.categories);
    }
    // Reset edit form state if user prop changes (e.g., navigating between profiles client-side)
     setEditForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        isCompany: user.isCompany || false,
     });
     setIsFollowing(initialIsFollowing); // Reset following state too

  }, [user, initialIsFollowing]); // Rerun when user or initialIsFollowing changes


  // --- Handlers ---
  const handleEditSubmit = async () => {
    startTransition(async () => {
        const formData = new FormData();

        // Append basic fields
        Object.entries(editForm)
          .filter(([key]) => key !== "isCompany")
          .forEach(([key, value]) => {
            formData.append(key, String(value));
          });
        formData.append("isCompany", editForm.isCompany ? "true" : "false");

        // Append selected categories
        selectedCategories.forEach((category, index) => {
          formData.append(`categories[${index}]`, category);
        });

        const result = await updateProfile(formData);
        if (result.success) {
          setShowEditDialog(false);
          toast.success("Perfil actualizado exitosamente");
          // Optionally trigger a re-fetch or rely on Next.js cache revalidation
        } else {
            toast.error(result.error || "Error al actualizar el perfil");
        }
    });
  };

  // Add the category selected in the dropdown to the list
  const handleAddCategory = () => {
    if (!newCategory) {
      toast.error("Por favor, selecciona una categoría para añadir.");
      return;
    }
    if (selectedCategories.includes(newCategory)) {
      toast.error("Esa categoría ya ha sido añadida.");
      setNewCategory(""); // Reset dropdown
      return;
    }
    // Enforce category limit for company accounts
    if (editForm.isCompany && selectedCategories.length >= 5) {
      toast.error("Las cuentas de empresa solo pueden tener hasta 5 categorías.");
      return;
    }

    setSelectedCategories([...selectedCategories, newCategory]);
    setNewCategory(""); // Reset dropdown after adding
  };

  // Remove a category from the selected list
  const handleRemoveCategory = (categoryToRemove: string) => {
    setSelectedCategories(selectedCategories.filter((category) => category !== categoryToRemove));
  };

  // Toggle follow status
  const handleFollow = async () => {
    if (!currentUser) return; // Should ideally be handled by button state, but double-check

    setIsUpdatingFollow(true); // Indicate loading state for follow button
    try {
      const result = await toggleFollow(user.id); // Assuming toggleFollow handles auth check
      if (result?.success) {
          setIsFollowing(!isFollowing); // Update local state on success
      } else {
          throw new Error(result?.error || "Failed to toggle follow");
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast.error(error.message || "Error al actualizar el estado de seguimiento");
      // Optionally revert optimistic update if needed: setIsFollowing(isFollowing);
    } finally {
      setIsUpdatingFollow(false); // Reset loading state
    }
  };

  // --- Derived State / Constants ---
  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;
  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy", { locale: es }); // Corrected format

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
                      <Button className="w-full" onClick={() => setShowEditDialog(true)}>
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

      {/* Tabs for Posts/Likes */}
      <Tabs defaultValue="posts" className="w-full mt-6">
         <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
             <TabsTrigger
               value="posts"
               className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-6 font-semibold text-muted-foreground"
             >
               <FileTextIcon className="size-4" />
               Publicaciones
             </TabsTrigger>
             <TabsTrigger
               value="likes"
               className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-6 font-semibold text-muted-foreground"
             >
               <HeartIcon className="size-4" />
               Me gusta
             </TabsTrigger>
         </TabsList>

         <TabsContent value="posts" className="mt-6">
           <div className="space-y-6">
             {posts.length > 0 ? (
               posts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} /* Pass necessary props like current user ID */ />)
             ) : (
               <div className="text-center py-8 text-muted-foreground">Aún no hay publicaciones</div>
             )}
           </div>
         </TabsContent>

         <TabsContent value="likes" className="mt-6">
           <div className="space-y-6">
             {likedPosts.length > 0 ? (
               likedPosts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} /* Pass necessary props */ />)
             ) : (
               <div className="text-center py-8 text-muted-foreground">Aún no hay publicaciones que te gusten</div>
             )}
           </div>
         </TabsContent>
       </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[550px]"> {/* Slightly wider */}
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          {/* Use ScrollArea for potentially long content */}
          <ScrollArea className="h-[60vh] max-h-[600px] pr-6"> {/* Added padding-right */}
            <div className="space-y-4 py-4 ">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Biografía</Label>
                <Textarea
                  id="edit-bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Cuéntanos sobre ti"
                />
              </div>
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="¿Dónde te encuentras?"
                />
              </div>
              {/* Website */}
               <div className="space-y-2">
                 <Label htmlFor="edit-website">Sitio Web</Label>
                 <Input
                   id="edit-website"
                   name="website"
                   value={editForm.website}
                   onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                   placeholder="tuwebsite.com"
                 />
               </div>
              {/* Is Company Toggle */}
              <div className="flex items-center justify-between space-x-2 pt-2">
                 <Label htmlFor="isCompany" className="flex flex-col space-y-1">
                    <span>Cuenta Empresa</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                        Activa esto si representas a una empresa u organización.
                    </span>
                 </Label>
                 {/* Simple Checkbox for toggle - replace with ShadCN Switch if preferred */}
                 <input
                   type="checkbox"
                   id="isCompany"
                   className="form-checkbox h-5 w-5 text-primary rounded shadow-none focus:ring-primary" // Basic styling
                   checked={editForm.isCompany}
                   onChange={(e) => {
                     const isCompanyChecked = e.target.checked;
                     setEditForm({ ...editForm, isCompany: isCompanyChecked });
                     // Enforce category limit immediately if switching to company
                     if (isCompanyChecked && selectedCategories.length > 5) {
                       setSelectedCategories(selectedCategories.slice(0, 5));
                       toast.error('Las cuentas de empresa solo pueden seleccionar hasta 5 categorías. Se han eliminado las categorías excedentes.');
                     }
                   }}
                 />
              </div>

              {/* Categories Section */}
              <div className="space-y-2 pt-2">
                <Label>{editForm.isCompany ? 'Categorías de la Empresa (Máx 5)' : 'Categorías de Interés'}</Label>
                {/* Display selected categories as badges */}
                <div className="flex flex-wrap gap-2 mb-3 min-h-[24px]">
                    {selectedCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="flex items-center gap-1">
                            {category}
                            <button
                                type="button"
                                onClick={() => handleRemoveCategory(category)}
                                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                                aria-label={`Quitar ${category}`}
                            >
                                <X className="h-3 w-3"/>
                            </button>
                        </Badge>
                    ))}
                    {selectedCategories.length === 0 && (
                        <p className="text-xs text-muted-foreground">No hay categorías seleccionadas.</p>
                    )}
                </div>

                {/* Add new category dropdown and button */}
                <div className="flex items-center gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    // Use ShadCN styles via className for consistency if desired, or keep basic select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
                    // Disable if category limit reached for companies
                    disabled={editForm.isCompany && selectedCategories.length >= 5}
                  >
                    <option value="">Selecciona una categoría</option>
                    {/* Map over the imported constant */}
                    {COMPANY_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddCategory}
                    // Disable if no category selected or limit reached
                    disabled={!newCategory || (editForm.isCompany && selectedCategories.length >= 5)}
                    aria-label="Añadir categoría seleccionada"
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                  </Button>
                </div>
                {editForm.isCompany && selectedCategories.length >= 5 && (
                    <p className="text-xs text-destructive mt-1">Has alcanzado el límite de 5 categorías para empresas.</p>
                )}
              </div>
            </div>
          </ScrollArea>
          {/* Dialog Footer */}
          <DialogFooter className="mt-4 pt-4 border-t">
             <DialogClose asChild>
                 <Button type="button" variant="outline" disabled={isPending}>
                   Cancelar
                 </Button>
             </DialogClose>
             <Button type="button" onClick={handleEditSubmit} disabled={isPending}>
               {isPending ? "Guardando..." : "Guardar Cambios"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePageClient; // Ensure component is exported
