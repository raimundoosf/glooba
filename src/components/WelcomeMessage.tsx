/**
 * Component that displays a welcome message for new users.
 * @module WelcomeMessage
 */
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Info, Users, CircleCheckBig, Handshake } from 'lucide-react';

/**
 * Component that displays a welcome card with:
 * - Welcome message in Spanish
 * - Description about the platform's purpose
 * - "Learn More" button linking to about page
 * @returns {JSX.Element} The welcome message component
 */
export default function WelcomeMessage() {
  return (
    <Card className="mb-8">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-3xl font-bold text-primary">¡Bienvenido/a a Glooba!</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          <div className="space-y-2 mt-1">
            <p className="text-lg">
              Encuentra y valoriza iniciativas sostenibles de empresas y organizaciones.
            </p>
            <div className="flex flex-wrap justify-center gap-2  ">
              <div className="group flex items-center gap-2 p-1.5 rounded bg-muted/50 hover:bg-muted/70 transition-colors">
                <CircleCheckBig className="h-5 w-5 text-blue-500 transition-transform group-hover:scale-110" />
                <span className="font-medium">Alternativas verificadas</span>
              </div>
              <div className="group flex items-center gap-2 p-1.5 rounded bg-muted/50 hover:bg-muted-70 transition-colors">
                <Handshake className="h-5 w-5 text-green-500 transition-transform group-hover:scale-110" />
                <span className="font-medium">Actores locales</span>
              </div>
              <div className="group flex items-center gap-2 p-1.5 rounded bg-muted/50 hover:bg-muted-70 transition-colors">
                <Users className="h-5 w-5 text-purple-500 transition-transform group-hover:scale-110" />
                <span className="font-medium">Evaluación colaborativa</span>
              </div>
              <Link
                href="/about"
                className="group flex items-center gap-2 p-1.5 rounded bg-muted/50 hover:bg-muted-70 transition-colors"
              >
                <Info className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" />
                <span className="font-medium">¡Conoce más!</span>
              </Link>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
