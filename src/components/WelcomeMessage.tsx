"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import {
  Info,
} from "lucide-react";

export default function WelcomeMessage() {
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

  if (isLargeScreen) {
    return (
      <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
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
                  href="/"
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

}
