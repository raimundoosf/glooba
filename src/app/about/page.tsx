import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Users, MapPin, Search, TrendingUp, Handshake, Lightbulb, Leaf, CloudOff } from "lucide-react"; // Added Handshake, Lightbulb
import { SignInButton } from "@clerk/nextjs";
import { getFeaturedCompanies } from "@/actions/explore.action"; // Import the new action
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

// Metadata for the page (optional but recommended)
export const metadata = {
  title: "Sobre Glooba | Conectando Sostenibilidad",
  description: "Descubre la misión, visión y beneficios de Glooba, la plataforma que conecta personas con iniciativas sostenibles en Latam.",
};

// Make the component async to fetch data
export default async function AboutPage() {
  // Fetch featured companies
  const featuredCompanies = await getFeaturedCompanies();

  return (
    // Using container and padding classes common in Next.js layouts
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="space-y-12 md:space-y-16 lg:space-y-20 mb-12 md:mb-16">

        {/* --- Hero Section: What is Glooba & Core Promise --- */}
        <section className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Tu puerta de entrada a un <span className="text-primary">futuro sostenible</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Glooba es la plataforma que conecta a personas como tú con empresas y organizaciones que impulsan iniciativas sostenibles en Latam.
          </p>
           {/* Call to action integrated early */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/">
                  <Button size="lg" variant="default">
                      <Search className="mr-2 h-5 w-5" /> Encuentra Iniciativas Ahora
                  </Button>
              </Link>
              <SignInButton mode="modal"> 
                  <Button
                      size="lg" 
                      variant="outline" 
                      className="mx-7"
                  >
                      Únete a la Comunidad
                  </Button>
              </SignInButton>
          </div>
           {/* Key features/pillars presented visually below CTA */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> Red social de sustentabilidad</div>
              <div className="flex items-center gap-2"><Search className="h-5 w-5 text-blue-600" /> Buscador verificado</div>
              <div className="flex items-center gap-2"><Users className="h-5 w-5 text-purple-600" /> Evaluación colaborativa</div>
          </div>
        </section>

        {/* --- Problem Section: Why Glooba Exists --- */}
        {/* Using a more engaging visual style for the quote */}
        <section className="max-w-4xl mx-auto">
           <h2 className="sr-only">El Problema que Resolvemos</h2> {/* Accessible heading */}
           <Card className="bg-secondary/50 dark:bg-secondary/30 border-l-4 border-primary p-6 md:p-8"> {/* Added padding to Card */}
                <blockquote className="text-xl md:text-2xl italic text-foreground mb-4 leading-relaxed"> {/* Increased text size, adjusted leading */}
                    "9 de cada 10 consumidores latinoamericanos busca marcas comprometidas con la sostenibilidad, solo el 30% encuentra opciones debido a la falta de información"
                </blockquote>
                <p className="text-sm text-muted-foreground text-right">- Kantar, 2022</p> {/* Align source right */}
            </Card>
        </section>

        {/* --- Solution Section: How Glooba Solves It (User Benefits Focused) --- */}
        {/* This section now focuses explicitly on the *user benefits* of the solution */}
         <section className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 md:mb-12">
                Con Glooba, tú puedes:
            </h2>
             {/* Grid of key user actions/benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <Card className="text-center hover:shadow-md transition-shadow p-6"> {/* Added padding to Card */}
                    <MapPin className="h-10 w-10 text-primary mx-auto mb-4" /> {/* Larger icon, centered */}
                    <CardTitle className="text-xl font-semibold mb-2">Encontrar Fácilmente</CardTitle> {/* Stronger title */}
                    <CardContent className="p-0"> {/* Removed default padding */}
                        <p className="text-muted-foreground text-sm">Alternativas sostenibles verificadas y cercanas a ti con nuestro buscador inteligente.</p>
                    </CardContent>
                </Card>
                <Card className="text-center hover:shadow-md transition-shadow p-6">
                    <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" /> {/* Larger icon, centered */}
                     <CardTitle className="text-xl font-semibold mb-2">Impulsar el Cambio</CardTitle>
                     <CardContent className="p-0">
                        <p className="text-muted-foreground text-sm">Apoyando a empresas comprometidas y descubriendo formas de unirte al movimiento sostenible.</p>
                    </CardContent>
                </Card>
                 <Card className="text-center hover:shadow-md transition-shadow p-6">
                    <Users className="h-10 w-10 text-primary mx-auto mb-4" /> {/* Larger icon, centered */}
                    <CardTitle className="text-xl font-semibold mb-2">Conectar y Colaborar</CardTitle>
                    <CardContent className="p-0">
                        <p className="text-muted-foreground text-sm">Interactúa con una comunidad, comparte experiencias y ayuda a verificar iniciativas.</p>
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* --- What we value / Focus Areas Section --- */}
        {/* Renamed and styled this section to focus on the values/areas Glooba champions */}
        <section className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 md:mb-12">
               Nuestros Pilares de Sostenibilidad
            </h2>
            {/* Grid of focus areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[ // Array for easy mapping
                  { title: "Economía Circular", description: "Fomentando la reutilización y el reciclaje.", icon: Lightbulb },
                  { title: "Materiales Sustentables", description: "Priorizando recursos renovables y de bajo impacto.", icon: Leaf }, // Assuming you have or add a Leaf icon
                  { title: "Comunidad Local", description: "Apoyando a productores y negocios cercanos.", icon: Handshake },
                  { title: "Disminución de Huella de Carbono", description: "Promoviendo prácticas que reducen emisiones.", icon: CloudOff }, // Assuming you have or add a CloudOff icon
                ].map((item) => (
                  // Added padding to Card, improved icon display
                  <Card key={item.title} className="text-center hover:shadow-md transition-shadow p-6 flex flex-col items-center">
                     <item.icon className="h-8 w-8 text-secondary-foreground mb-3" /> {/* Icon for each pillar */}
                    <CardTitle className="text-lg font-semibold mb-2">{item.title}</CardTitle> {/* Stronger title */}
                    <CardContent className="p-0 flex-grow"> {/* flex-grow to push description */}
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
        </section>

        {/* --- Allies Section --- */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4">Nuestros Aliados</h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            Colaboramos con organizaciones y empresas líderes comprometidas con la sostenibilidad en Latam.
          </p>
          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-muted/30">
              {/* Display fetched company logos */}
              {featuredCompanies.length > 0 ? (
                featuredCompanies.map((company) => (
                  <Link
                    href={company.username ? `/profile/${company.username}` : '#'}
                    key={company.id}
                    className="flex-shrink-0 transition-opacity hover:opacity-80"
                    title={company.username || 'Company Profile'} // Add a title for accessibility
                  >
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-muted">
                      <AvatarImage src={company.image || undefined} alt={`${company.username || 'Company'} logo`} />
                      <AvatarFallback className="text-xs">
                        {company.username
                          ? company.username.substring(0, 2).toUpperCase()
                          : 'GBA'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-center w-full">Aún no tenemos aliados destacados.</p>
              )}
            </div>
            {/* Optional: Fade effect at the edges - adjusted colors slightly */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          </div>
        </section>

        {/* --- About / Mission / Vision Section --- */}
        {/* Combined About, Mission, Vision into a single, more concise section */}
        <section className="max-w-4xl mx-auto">
             <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 md:mb-12">
                Nuestro Propósito
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="md:col-span-1 space-y-3"> {/* Added space-y */}
                <Lightbulb className="h-8 w-8 text-primary mb-2" /> {/* Added icon */}
                <h3 className="text-xl font-semibold">¿Qué es Glooba?</h3>
                <p className="text-muted-foreground text-sm"> {/* Reduced text size */}
                  Glooba es una plataforma que conecta a consumidores con iniciativas y ofertas sostenibles en Latam, facilitando el consumo responsable y apoyando a empresas comprometidas.
                </p>
              </div>
              <div className="md:col-span-1 space-y-3"> {/* Added space-y */}
                 <Handshake className="h-8 w-8 text-primary mb-2" /> {/* Added icon */}
                <h3 className="text-xl font-semibold">Misión</h3>
                <p className="text-muted-foreground text-sm"> {/* Reduced text size */}
                  Facilitar la transición global hacia el consumo responsable conectando personas con empresas sostenibles. Empoderamos elecciones conscientes para un futuro mejor.
                </p>
              </div>
              <div className="md:col-span-1 space-y-3"> {/* Added space-y */}
                <TrendingUp className="h-8 w-8 text-primary mb-2" /> {/* Added icon */}
                <h3 className="text-xl font-semibold">Visión</h3>
                <p className="text-muted-foreground text-sm"> {/* Reduced text size */}
                  Ser el ecosistema líder donde la sostenibilidad es accesible y la opción preferida para todos, transformando decisiones en impacto positivo.
                </p>
              </div>
            </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">¿Listo/a para ser parte del cambio?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a nuestra comunidad, explora iniciativas y descubre cómo tus acciones pueden generar un impacto positivo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                  <Button size="lg" variant="default">
                      <Search className="mr-2 h-5 w-5" /> Explorar Iniciativas
                  </Button>
              </Link>
              <SignInButton mode="modal"> 
                  <Button
                      size="lg" 
                      variant="outline"
                      className="mx-6"
                  >
                      Crear Cuenta Gratuita
                  </Button>
              </SignInButton>
          </div>
        </section>
      </div>
    </div>
  );
}