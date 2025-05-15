/**
 * Sidebar component that displays user profile information.
 * @module Sidebar
 */
import { getUserByClerkId } from '@/actions/user.action';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { Info, Instagram, Linkedin, LinkIcon, Mail, MapPinIcon, MessageSquareText, Smartphone, BookOpen, FileText, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

/**
 * Main sidebar component that displays:
 * - User profile card with:
 *   - Profile background image
 *   - Avatar with username
 *   - Bio (if available)
 *   - Following/followers counts
 *   - Location
 *   - Website link (if available)
 * @returns {JSX.Element} The authenticated sidebar component
 */
async function Sidebar() {
  const authUser = await currentUser();
  if (!authUser) return <UnAuthenticatedSidebar />;

  const user = await getUserByClerkId(authUser.id);
  if (!user) return null;

  return (
    <div className="sticky top-20">
      <Card className="bg-card overflow-hidden">
        <CardContent className="px-4 py-6 relative">
          <div className="absolute inset-x-0 top-0 h-32 bg-muted">
            {user.backgroundImage ? (
              <img
                src={user.backgroundImage}
                alt={`${user.name || user.username}'s background`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="h-12 w-12 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center text-center pt-20">
            <Link
              href={`/profile/${user.username}`}
              className="flex flex-col items-center justify-center"
              style={{ alignItems: 'center' }}
            >
              <Avatar className="w-24 h-24 border-4 border-card relative z-10 -mt-12">
                <AvatarImage src={user.image || '/avatar.png'} />
                <AvatarFallback>
                  {user.name?.substring(0, 2) || user.username.substring(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 space-y-1 flex flex-col items-center">
                <h3 className="font-semibold">{user.name}</h3>
                <div className="flex items-center">
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  {user.isCompany && (
                    <svg
                      className="ml-2 inline-flex"
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
                </div>
              </div>
            </Link>

            {user.bio && <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>}

            <div className="w-full">
              <Separator className="my-4" />
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{user._count.following}</p>
                  <p className="text-xs text-muted-foreground">Siguiendo</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <p className="font-medium">{user._count.followers}</p>
                  <p className="text-xs text-muted-foreground">Seguidores</p>
                </div>
              </div>
              <Separator className="my-4" />
            </div>

            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {user.location || 'Sin localizacion'}
              </div>
              <div className="flex items-center text-muted-foreground">
                <LinkIcon className="w-4 h-4 mr-2 shrink-0" />
                {user.website ? (
                  <a href={`${user.website}`} className="hover:underline truncate" target="_blank">
                    {user.website}
                  </a>
                ) : (
                  'Sin sitio web'
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Unauthenticated sidebar component that displays Glooba information and contact details.
 * - Glooba card: Logo, title, subtitle, social links (Instagram, LinkedIn), and a "Conoce más" link.
 * - Contact card: Title "Contacto", WhatsApp link, and Email link.
 * @returns {JSX.Element} The unauthenticated sidebar component.
 */
const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20 space-y-6">
    {/* Glooba Info Card */}
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <h2 className="text-2xl font-bold">
            Glooba
          </h2>
          <p className="text-sm text-muted-foreground px-4">
            Conectamos a personas con organizaciones que impulsan iniciativas sostenibles
          </p>
          <div className="flex space-x-3 pt-1">
            <Link href="https://www.instagram.com/gloobacl" target="_blank" rel="noopener noreferrer" className="p-2 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors">
              <Instagram className="h-5 w-5 text-primary" />
            </Link>
            <Link href="https://www.linkedin.com/company/gloobapp" target="_blank" rel="noopener noreferrer" className="p-2 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors">
              <Linkedin className="h-5 w-5 text-primary" />
            </Link>
          </div>
          <Link href="/about" className="flex items-center space-x-2 rounded-full bg-muted px-4 py-2 text-sm text-primary-600 hover:bg-gray-200 transition-all duration-200 ease-in-out">
            <Info className="h-4 w-4 text-primary" />
            Conoce más
          </Link>
        </div>
      </CardContent>
    </Card>

    {/* Información Legal */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-semibold">
          <BookOpen className="h-5 w-5 mr-2" />
          Información Legal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link
          href="/terms"
          className="flex items-center space-x-3 rounded-lg bg-primary-50 p-3 hover:bg-primary-100 transition-colors"
        >
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-sm">Términos de Servicio</span>
        </Link>
        <Link
          href="/privacy"
          className="flex items-center space-x-3 rounded-lg bg-primary-50 p-3 hover:bg-primary-100 transition-colors"
        >
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm">Política de Privacidad</span>
        </Link>
      </CardContent>
    </Card>
  </div>
);

export default Sidebar;
