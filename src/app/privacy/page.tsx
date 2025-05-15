import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Glooba',
  description: 'Aprende cómo recopilamos, usamos y protegemos tu información personal.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-6">Política de Privacidad</CardTitle>
          <p className="text-muted-foreground text-center">
            Última actualización: 15 de mayo de 2025
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Información que Recopilamos</h2>
            <p className="mb-4">
              Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta, 
              actualizas tu perfil o te comunicas con nosotros. Esto puede incluir tu nombre, dirección de correo electrónico, 
              y cualquier otra información que elijas proporcionar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Cómo Utilizamos tu Información</h2>
            <p className="mb-4">
              Utilizamos la información que recopilamos para:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Responder a tus comentarios, preguntas y solicitudes</li>
              <li>Enviarte notificaciones técnicas y mensajes de soporte</li>
              <li>Monitorear y analizar tendencias, uso y actividades</li>
              <li>Detectar, investigar y prevenir incidentes de seguridad</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Compartir Información</h2>
            <p className="mb-4">
              No compartimos tu información personal con terceros excepto como se describe en esta 
              Política de Privacidad o con tu consentimiento. Podemos compartir información con proveedores de servicios 
              que realizan servicios en nuestro nombre.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Seguridad de los Datos</h2>
            <p className="mb-4">
              Implementamos medidas técnicas y organizativas apropiadas para proteger tu información 
              personal. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico 
              es completamente seguro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Tus Derechos</h2>
            <p className="mb-4">
              Puedes tener ciertos derechos con respecto a tu información personal, incluido el derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Acceder y recibir una copia de tus datos personales</li>
              <li>Rectificar cualquier información personal que sea inexacta</li>
              <li>Solicitar la eliminación de tu información personal</li>
              <li>Oponerte o restringir el procesamiento de tu información personal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Cambios en esta Política</h2>
            <p className="mb-4">
              Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos de cualquier cambio 
              publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última actualización".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Contáctanos</h2>
            <p>
              Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en:
            </p>
            <p className="mt-2">
              Correo electrónico: gloobacl@gmail.com
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
