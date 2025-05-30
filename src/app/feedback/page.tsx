import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { MessageCircleQuestion } from 'lucide-react';

export const metadata = {
  title: 'Comentarios | Glooba',
  description: 'Comparte tus comentarios sobre la plataforma Glooba. ¡Valoramos tu opinión para ayudarnos a mejorar!',
};

export default function FeedbackPage() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
        <div className="text-center space-y-4">
          <MessageCircleQuestion className="mx-auto h-12 w-12 text-primary sm:h-16 sm:w-16" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Valoramos tu opinión</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            ¡Tu retroalimentación nos ayuda a mejorar nuestra plataforma!
          </p>
        </div>
        <div className="w-full max-w-2xl mx-auto">
          <FeedbackForm />
        </div>
        <div className="text-center text-sm text-muted-foreground mt-8 px-4">
          <p>
            Para soporte urgente, contáctanos en{' '}
            <a 
              href="mailto:gloobacl@gmail.com" 
              className="text-primary hover:underline break-all"
            >
              gloobacl@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
