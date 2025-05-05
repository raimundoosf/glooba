import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";

export default function WelcomeMessage() {
  return (
    <Card className="mb-8">
      <CardHeader className="items-center text-center">
        <link rel="icon" href="/favicon.ico" />
        <CardTitle className="text-2xl font-bold text-primary dark:text-primary-light">
          ¡Bienvenido/a a Glooba!
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground max-w-xl">
        Conectamos personas y organizaciones con iniciativas sostenibles. 
        ¡Explora, valora y sé parte del cambio!
        </CardDescription>
        <div className="pt-2">
          <Link href="/about" passHref>
            <Button size="default" variant="outline">
              <Info className="mr-2 h-5 w-5" /> Conoce Más
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
}