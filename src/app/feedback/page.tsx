import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { MessageCircleQuestion } from "lucide-react";

export const metadata = {
  title: "Comentarios | Glooba",
  description:
    "Comparte tus comentarios sobre la plataforma Glooba. ¡Valoramos tu opinión para ayudarnos a mejorar!",
};

export default function FeedbackPage() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto space-y-8 ">
        <div className="text-center space-y-4">
          <MessageCircleQuestion className="mx-auto h-12 w-12 text-primary sm:h-16 sm:w-16" />
          <h1 className="text-3xl font-bold tracking-tight">
            Valoramos tu opinión
          </h1>
          <p className="text-muted-foreground text-base">
            ¡Tu retroalimentación nos ayuda a mejorar nuestra plataforma!
          </p>
        </div>
        <FeedbackForm />
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>
            Para soporte urgente, contáctanos en{" "}
            <a
              href="mailto:gloobacl@gmail.com"
              className="text-primary hover:underline break-all"
            >
              <br />
              gloobacl@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
