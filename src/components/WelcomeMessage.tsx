/**
 * Component that displays a welcome message for new users.
 * @module WelcomeMessage
 */
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import Link from 'next/link';

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
        <CardTitle className="text-2xl font-bold">
          ¡Bienvenido/a a Glooba!
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground max-w-xl">
          Conectamos personas y organizaciones con iniciativas sostenibles. ¡Explora, valora y sé
          parte del cambio!
        </CardDescription>
        <div className="pt-2">
          <Link href="/about" passHref>
            <Button size="default" variant="outline">
              <Info className="mr-2 h-5 w-5 text-primary" /> Conoce Más
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
}
