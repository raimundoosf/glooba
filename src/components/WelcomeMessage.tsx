import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
          Encuentra y valora acciones que generan impacto. 
          ¡Sé parte del cambio!
        </CardDescription>
      </CardHeader>
    </Card>
  );
}