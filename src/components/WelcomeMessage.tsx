"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import {
  Users,
  CircleCheckBig,
  Handshake,
  MousePointerClick,
  Info,
} from "lucide-react";

export default function WelcomeMessage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [showLink, setShowLink] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    if (typeof window !== "undefined") {
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, []);

  useEffect(() => {
    if (!isLargeScreen) {
      const hasDismissed = localStorage.getItem("hasDismissedWelcome");
      if (!hasDismissed) {
        setIsOpen(true);
      }
    }
  }, [isLargeScreen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasDismissedWelcome", "true");
  };

  const welcomeContent = (
    <>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-primary">
          ¡Bienvenido/a a Glooba!
        </h2>
        <p className="text-muted-foreground">
          Encuentra empresas y organizaciones comprometidas con la
          sostenibilidad.
        </p>
      </div>
      <div className="mt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CircleCheckBig className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <span className="text-sm">
              Buscador de organizaciones sostenibles verificadas.
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Handshake className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-sm">
              Productos, servicios y descuentos de empresas comprometidas.
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Users className="h-6 w-6 text-purple-500 flex-shrink-0" />
            <span className="text-sm">
              Sigue a emprendimientos locales y deja tu reseña.
            </span>
          </div>
        </div>
        <Button asChild className="w-full mt-4" onClick={handleClose}>
          <Link
            href="/about"
            className="flex items-center justify-center gap-2"
          >
            <Info className="h-4 w-4" />
            <span>Conocer más sobre Glooba</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleClose}
          asChild
        >
          <Link href="/" className="flex items-center justify-center gap-2">
            <MousePointerClick className="h-4 w-4" />
            <span>Probar demo</span>
          </Link>
        </Button>
      </div>
    </>
  );

  if (isLargeScreen) {
    return (
      <Card className="mb-8">
        <CardHeader className="items-center text-center min-h-[9rem]">
          {/* Título: Se renderiza de forma diferente según el paso de la animación */}
          <CardTitle className="text-3xl font-bold text-card-foreground">
            {animationStep < 1 ? (
              // 1. ANTES Y DURANTE la animación del título
              <TypeAnimation
                sequence={[
                  "¡Bienvenido/a a Glooba!",
                  () => setAnimationStep(1),
                ]}
                wrapper="span"
                speed={40}
                repeat={0}
                cursor={true}
              />
            ) : (
              // 2. DESPUÉS de que la animación del título termina, se convierte en texto estático
              <span>¡Bienvenido/a a Glooba!</span>
            )}
          </CardTitle>

          {/* Descripción: Se renderiza de forma diferente según el paso de la animación */}
          {animationStep === 1 && (
            // 3. SOLO DURANTE la animación de la descripción
            <div className="text-lg text-muted-foreground font-normal mt-2">
              <TypeAnimation
                sequence={[
                  "Encuentra empresas y organizaciones comprometidas con la sostenibilidad.",
                  1000,
                  () => {
                    setAnimationStep(2);
                    setShowLink(true);
                  },
                ]}
                wrapper="span"
                speed={55}
                repeat={0}
                cursor={true}
              />
            </div>
          )}

          {animationStep > 1 && (
            // 4. DESPUÉS de que la animación de la descripción termina
            <div className="text-lg text-muted-foreground font-normal mt-2">
              <span>
                Encuentra empresas y organizaciones comprometidas con la
                sostenibilidad.
              </span>
            </div>
          )}

          <CardDescription className="text-base text-muted-foreground">
            {showLink && (
              <div className="flex flex-wrap justify-center gap-2 animate-fade-in mt-2">
                <Link
                  href="/about"
                  className="group flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
                >
                  <Info className="h-4 transition-transform group-hover:scale-110" />
                  <span className="font-medium">
                    ¡Conoce más sobre nosotros!
                  </span>
                </Link>
              </div>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden rounded-lg sm:rounded-lg">
        <div className="p-6">{welcomeContent}</div>
      </DialogContent>
    </Dialog>
  );
}
