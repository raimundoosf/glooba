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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    isCompany: user.isCompany || false,
  });

  
  useEffect(() => {
    if (showEditDialog && user?.categories) {
      setSelectedCategories(user.categories);
    }
  }, [showEditDialog, user?.categories]);

  const handleEditSubmit = async () => {
    const formData = new FormData();

    Object.entries(editForm)
      .filter(([key]) => key !== "isCompany") // Filter out isCompany
      .forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    formData.append("isCompany", editForm.isCompany ? "true" : "false");

    selectedCategories.forEach((category, index) => {
      formData.append(`categories[${index}]`, category);
    });

    const result = await updateProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast.success("Perfil actualizado exitosamente");
    }
  };
  
  const handleRemoveCategory = (categoryToRemove: string) => {
    setSelectedCategories(selectedCategories.filter((category) => category !== categoryToRemove));
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Error al actualizar el estado de seguimiento");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy", { locale: es });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">
                  {user.name ?? user.username}
                </h1>
                <p className="text-muted-foreground">
                  @{user.username}
                  {user.isCompany && (
                    <svg className="ml-2 inline-flex items-center " width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.02975 3.3437C10.9834 2.88543 13.0166 2.88543 14.9703 3.3437C17.7916 4.00549 19.9945 6.20842 20.6563 9.02975C21.1146 10.9834 21.1146 13.0166 20.6563 14.9703C19.9945 17.7916 17.7916 19.9945 14.9703 20.6563C13.0166 21.1146 10.9834 21.1146 9.02975 20.6563C6.20842 19.9945 4.0055 17.7916 3.3437 14.9703C2.88543 13.0166 2.88543 10.9834 3.3437 9.02974C4.0055 6.20841 6.20842 4.00549 9.02975 3.3437ZM15.0524 10.4773C15.2689 10.2454 15.2563 9.88195 15.0244 9.6655C14.7925 9.44906 14.4291 9.46159 14.2126 9.6935L11.2678 12.8487L9.77358 11.3545C9.54927 11.1302 9.1856 11.1302 8.9613 11.3545C8.73699 11.5788 8.73699 11.9425 8.9613 12.1668L10.8759 14.0814C10.986 14.1915 11.1362 14.2522 11.2919 14.2495C11.4477 14.2468 11.5956 14.181 11.7019 14.0671L15.0524 10.4773Z" fill="#1281ff "/>
                    </svg>
                  )}
                </p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {/* BOTONES DE "SEGUIR Y EDITAR PERFIL" */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full mt-4">Seguir</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button className="w-full mt-4" onClick={() => setShowEditDialog(true)}>
                    <EditIcon className="size-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-4"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? "Dejar de seguir" : "Seguir"}
                  </Button>
                )}

                {/* UBICACIÓN Y SITIO WEB */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http") ? user.website : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Se unió en {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Publicaciones
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Me gusta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">Aún no hay publicaciones</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">Aún no hay publicaciones que te gusten</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="space-y-2">
                <Label>Biografía</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Cuéntanos sobre ti"
                />
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="¿Dónde te encuentras?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isCompany">Cuenta Empresa</Label>
                <label className="switch">
                <input
                  type="checkbox"
                  id="isCompany"
                  checked={editForm.isCompany}
                  onChange={(e) => {
                    const isCompanyChecked = e.target.checked;
                    setEditForm({ ...editForm, isCompany: isCompanyChecked });
                    if (isCompanyChecked && selectedCategories.length > 5) {
                      setSelectedCategories(selectedCategories.slice(0, 5));
                      toast.error('Las cuentas de empresa solo pueden seleccionar hasta 5 categorías. Se han eliminado las categorías excedentes.')
                    }
                  }}
                />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="space-y-2">
                <Label>{editForm.isCompany ? 'Categorías de la Empresa' : 'Categorías de Interés'}</Label>
                <div className="flex items-center">

                  {!isAddingCategory ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingCategory(true)}>
                      + Añadir Categoría
                    </Button>
                  ) : (
                    <>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mr-2"
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="Textil">Textil</option>
                        <option value="Limpieza">Limpieza</option>
                        <option value="Deportes">Deportes</option>
                        <option value="Gestión de residuos">Gestión de residuos</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Alimentos">Alimentos</option>
                        <option value="Mascotas">Mascotas</option>
                        <option value="Muebles y decoración">Muebles y decoración</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Moda y Accesorios">Moda y Accesorios</option>
                        <option value="Cosmética e higiene personal">Cosmética e higiene personal</option>
                        <option value="Neumáticos">Neumáticos</option>
                        <option value="Repuestos">Repuestos</option>
                        <option value="Arquitectura, construcción y diseño">Arquitectura, construcción y diseño</option>
                        <option value="Producto sostenible">Producto sostenible</option>
                        <option value="Ferias">Ferias</option>
                        <option value="Outdoor">Outdoor</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Paisajismo">Paisajismo</option>
                        <option value="Solar Fotovoltáica">Solar Fotovoltáica</option>
                        <option value="Cocina">Cocina</option>
                        <option value="Terraza y aire libre">Terraza y aire libre</option>
                      </select>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          if (newCategory && !selectedCategories.includes(newCategory)) {
                            if (editForm.isCompany) {
                              if (selectedCategories.length < 5) {
                                setSelectedCategories([...selectedCategories, newCategory]);
                                setNewCategory("");
                                setIsAddingCategory(false);
                              } else {
                                toast.error('Las cuentas de empresa solo pueden seleccionar hasta 5 categorías.');
                              }
                            } else {
                              setSelectedCategories([...selectedCategories, newCategory]);
                              setNewCategory("");
                              setIsAddingCategory(false);
                            }
                          }
                        }}
                      >
                        Añadir
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="ml-2" onClick={() => setIsAddingCategory(false)}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">Categorías Seleccionadas:</Label>
                    <ul className="list-disc pl-4 mt-1">
                      {selectedCategories.map((category) => (
                        <li key={category} className="flex items-center justify-between">
                          <span>{category}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="ml-2"
                            onClick={() => handleRemoveCategory(category)}
                          >
                            <X className="h-4 w-4" /> {/* Asumiendo que tienes el icono X de lucide-react */}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Sitio web</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="Tu sitio web personal"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Guardar Cambios</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default ProfilePageClient;

