'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { submitFeedback } from '@/actions/feedback.action';
import { useAuth } from '@clerk/nextjs';

interface FeedbackFormProps {
  onFeedbackSubmitted?: () => void;
}

export function FeedbackForm({ onFeedbackSubmitted }: FeedbackFormProps) {
  const [content, setContent] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!content.trim()) {
      toast.error('Por favor ingresa tus comentarios');
      return;
    }

    startTransition(async () => {
      const result = await submitFeedback({ 
        content,
        email: !isSignedIn ? email : undefined 
      });
      
      if (result.success) {
        toast.success('¡Gracias por tu feedback!');
        setContent('');
        setEmail('');
        onFeedbackSubmitted?.();
        setTimeout(() => {
          router.refresh();
        }, 5000);
      } else {
        toast.error(result.error || 'Error al enviar el formulario');
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto px-6">
      <CardHeader className="px-0 pt-6">
        <CardTitle className="text-xl sm:text-2xl">Deja tu comentario</CardTitle>
        <CardDescription className="text-base sm:text-sm">
          Nos encantaría escuchar tus pensamientos, sugerencias o reportar cualquier problema que hayas encontrado.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              id="feedback"
              placeholder="Escribe acá..."
              className="min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
          
          {!isSignedIn && (
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="w-full"
              />
              <p className="text-sm sm:text-xs text-muted-foreground">
                Si deseas que te contactemos, déjanos tu correo electrónico.
              </p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
