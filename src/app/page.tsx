import { getFeaturedCompanies } from "@/actions/explore.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { SignInButton } from "@clerk/nextjs";
import {
  BarChart3 as BarChart4,
  Building,
  ChartNoAxesCombined,
  Goal,
  Lightbulb,
  MapPin,
  MessageSquare,
  MessagesSquare,
  MousePointerClick,
  Search,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";

export const metadata = {
  title: "Sobre Glooba | Conectando Sostenibilidad",
  description:
    "Descubre la misión, visión y beneficios de Glooba, la plataforma que conecta personas con iniciativas sostenibles en Latam.",
};

/**
 * About page component that showcases the platform's mission and features
 * @returns {JSX.Element} The about page component with sections about the platform's purpose and benefits
 */
export default async function AboutPage() {
  const featuredCompanies = await getFeaturedCompanies();

  return (
    // Using container and padding classes common in Next.js layouts
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="space-y-12 md:space-y-16 lg:space-y-20 mb-12 md:mb-16">
        {/* --- Hero Section: What is Glooba & Core Promise --- */}
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Ayudemos a construir <br />{" "}
            <span className="text-primary">
            un mundo más sostenible
            </span>
          </h1>
          {/* Call to action integrated early */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 mb-12 max-w-2xl mx-auto">
            <Link href="/explore">
              <Button
                size="default"
                variant="default"
                className="font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Search className="mr-2 h-5 w-5" /> Encuentra soluciones ahora
              </Button>
            </Link>
            <SignInButton mode="modal">
              <Button
                size="default"
                variant="outline"
                className="font-semibold transition-all duration-200 hover:scale-105 hover:bg-primary/10"
              >
                <UserPlus className="mr-2 h-5 w-5" /> Únete a la comunidad
              </Button>
            </SignInButton>
          </div>
        {/* --- Stats Section --- */}
        <section className="bg-white dark:bg-background px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card dark:bg-card-dark border dark:border-card-dark rounded-lg p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-success mb-4" />
              <span className="text-4xl font-bold text-success">{355}</span>
              <p className="text-lg text-muted-foreground mt-2">Usuarios activos</p>
            </div>
            <div className="bg-card dark:bg-card-dark border dark:border-card-dark rounded-lg p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow">
              <Building className="w-12 h-12 text-success mb-4" />
              <span className="text-4xl font-bold text-success">+{170}</span>
              <p className="text-lg text-muted-foreground mt-2">Empresas registradas</p>
            </div>
            <div className="bg-card dark:bg-card-dark border dark:border-card-dark rounded-lg p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow">
              <UserPlus className="w-12 h-12 text-warning mb-4" />
              <span className="text-4xl font-bold text-warning">{316}</span>
              <p className="text-lg text-muted-foreground mt-2">Usuarios nuevos</p>
            </div>
            <div className="bg-card dark:bg-card-dark border dark:border-card-dark rounded-lg p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow">
              <MousePointerClick className="w-12 h-12 text-info mb-4" />
              <span className="text-4xl font-bold text-info">+{2400}</span>
              <p className="text-lg text-muted-foreground mt-2">Interacciones</p>
            </div>
          </div>
        </section>
          
        </section>
        {/* --- What we do --- */}
        <section>
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4">
              En <span className="font-semibold text-foreground">Glooba</span>, transformamos la sostenibilidad de un concepto a una experiencia compartida. Somos el puente que conecta a personas con iniciativas que están construyendo un futuro mejor.
            </p>
            <div className="inline-flex items-center gap-2 text-muted-foreground/80 text-sm md:text-base">
              <span className="h-px w-8 bg-foreground/20"></span>
              <span>Juntos impulsamos la colaboración, la innovación y el cambio positivo</span>
              <span className="h-px w-8 bg-foreground/20"></span>
            </div>
          </div>
        </section>

        {/* --- Solution Section: How Glooba Solves It (User Benefits Focused) --- */}
        {/* This section now focuses explicitly on the *user benefits* of the solution */}
        <section className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 md:mb-12">
            Con Glooba, tú puedes:
          </h2>
          {/* Grid of key user actions/benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="text-center hover:shadow-md transition-shadow p-6">
              {" "}
              {/* Added padding to Card */}
              <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />{" "}
              {/* Larger icon, centered */}
              <CardTitle className="text-xl font-semibold mb-2">
                Encontrar Fácilmente
              </CardTitle>{" "}
              {/* Stronger title */}
              <CardContent className="p-0">
                {" "}
                {/* Removed default padding */}
                <p className="text-muted-foreground text-sm">
                  Alternativas sostenibles verificadas y cercanas a ti con
                  nuestro buscador inteligente.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow p-6">
              <ChartNoAxesCombined className="h-10 w-10 text-primary mx-auto mb-4" />{" "}
              {/* Larger icon, centered */}
              <CardTitle className="text-xl font-semibold mb-2">
                Impulsar el Cambio
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-muted-foreground text-sm">
                  Apoyando a entidades comprometidas y descubriendo formas de
                  unirte al movimiento sostenible.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow p-6">
              <MessagesSquare className="h-10 w-10 text-primary mx-auto mb-4" />{" "}
              {/* Larger icon, centered */}
              <CardTitle className="text-xl font-semibold mb-2">
                Conectar y Colaborar
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-muted-foreground text-sm">
                  Interactúa con una comunidad, recibe notificaciones, comparte
                  experiencias y ayuda a verificar iniciativas.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* --- ¿Por qué usar Glooba? --- */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
              ¿Por qué elegir Glooba?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <ShieldCheck className="h-8 w-8 text-green-600" />,
                  title: "Información Verificada",
                  description: "Accede a datos confiables y actualizados sobre iniciativas sostenibles verificadas por nuestra comunidad."
                },
                {
                  icon: <Users2 className="h-8 w-8 text-blue-600" />,
                  title: "Comunidad Activa",
                  description: "Únete a una red de personas y organizaciones comprometidas con la sostenibilidad y el impacto positivo."
                },
                {
                  icon: <MapPin className="h-8 w-8 text-purple-600" />,
                  title: "Soluciones Locales",
                  description: "Descubre iniciativas cercanas a ti y apoya el desarrollo sostenible en tu propia comunidad."
                },
                {
                  icon: <BarChart4 className="h-8 w-8 text-amber-600" />,
                  title: "Impacto Medible",
                  description: "Visualiza el impacto real de las iniciativas y cómo contribuyen a los Objetivos de Desarrollo Sostenible."
                },
                {
                  icon: <MessageSquare className="h-8 w-8 text-rose-600" />,
                  title: "Feedback Colaborativo",
                  description: "Comparte tus experiencias y ayuda a otros a tomar decisiones informadas con reseñas y calificaciones."
                },
                {
                  icon: <Lightbulb className="h-8 w-8 text-indigo-600" />,
                  title: "Innovación Abierta",
                  description: "Conecta con emprendedores y organizaciones que están impulsando soluciones innovadoras para un futuro sostenible."
                }
              ].map((item, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* --- Allies Section --- */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4">
            Nuestros Aliados
          </h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            Colaboramos con organizaciones y empresas líderes comprometidas con
            la sostenibilidad en Latam.
          </p>
          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-muted/30">
              {/* Display fetched company logos */}
              {featuredCompanies.length > 0 ? (
                featuredCompanies.map((company) => (
                  <Link
                    href={
                      company.username ? `/profile/${company.username}` : "#"
                    }
                    key={company.id}
                    className="flex-shrink-0 transition-opacity hover:opacity-80"
                    title={company.username || "Company Profile"} // Add a title for accessibility
                  >
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-muted">
                      <AvatarImage
                        src={company.image || undefined}
                        alt={`${company.username || "Company"} logo`}
                      />
                      <AvatarFallback className="text-xs">
                        {company.username
                          ? company.username.substring(0, 2).toUpperCase()
                          : "GBA"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-center w-full">
                  Aún no tenemos aliados destacados.
                </p>
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
            <div className="md:col-span-1 space-y-3">
              {" "}
              {/* Added space-y */}
              <Lightbulb className="h-8 w-8 text-yellow-600 mb-2" />{" "}
              {/* Added icon */}
              <h3 className="text-xl font-semibold">¿Qué es Glooba?</h3>
              <p className="text-muted-foreground text-sm">
                {" "}
                {/* Reduced text size */}
                Glooba es una plataforma que conecta a personas con organizaciones y empresas comprometidas con la sostenibilidad.
              </p>
            </div>
            <div className="md:col-span-1 space-y-3">
              {" "}
              {/* Added space-y */}
              <Goal className="h-8 w-8 text-green-600 mb-2" />{" "}
              {/* Added icon */}
              <h3 className="text-xl font-semibold">Misión</h3>
              <p className="text-muted-foreground text-sm">
                {" "}
                {/* Reduced text size */}
                Facilitar la transición global hacia la sostenibilidad. Empoderamos
                elecciones conscientes para un futuro mejor.
              </p>
            </div>
            <div className="md:col-span-1 space-y-3">
              {" "}
              {/* Added space-y */}
              <TrendingUp className="h-8 w-8 text-cyan-600 mb-2" />{" "}
              {/* Added icon */}
              <h3 className="text-xl font-semibold">Visión</h3>
              <p className="text-muted-foreground text-sm">
                {" "}
                {/* Reduced text size */}
                Ser la comunidad líder donde la sostenibilidad es accesible y la
                opción preferida para todos, transformando decisiones en impacto
                positivo.
              </p>
            </div>
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            ¿Listo/a para ser parte del cambio?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad, explora iniciativas y descubre cómo tus
            acciones pueden generar un impacto positivo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 max-w-2xl mx-auto">
            <Link href="/explore">
              <Button
                size="default"
                variant="default"
                className="font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Search className="mr-2 h-5 w-5" /> Explorar Iniciativas
              </Button>
            </Link>
            <SignInButton mode="modal">
              <Button
                size="default"
                variant="outline"
                className="font-semibold transition-all duration-200 hover:scale-105 hover:bg-primary/10"
              >
                <UserPlus className="mr-2 h-5 w-5" /> Crear Cuenta Gratuita
              </Button>
            </SignInButton>
          </div>
        </section>
      </div>
    </div>
  );
}
