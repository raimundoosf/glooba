import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Términos de Servicio | Glooba',
  description: 'Términos y condiciones para el uso de los servicios de Glooba.',
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-6">Términos de Servicio</CardTitle>
          <p className="text-muted-foreground text-center">
            Última actualización: 15 de mayo de 2025
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Aceptación de los Términos</h2>
            <p className="mb-4">
              Al acceder o utilizar la plataforma Glooba, usted acepta estar sujeto a estos Términos de Servicio 
              y a nuestra Política de Privacidad. Si no está de acuerdo con estos términos, por favor no utilice nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Descripción del Servicio</h2>
            <p className="mb-4">
              Glooba proporciona una plataforma que conecta a los usuarios con organizaciones y servicios. El servicio 
              incluye, entre otros, perfiles de organizaciones, reseñas y contenido relacionado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Cuentas de Usuario</h2>
            <p className="mb-4">
              Para acceder a ciertas funciones, es posible que deba crear una cuenta. Usted es responsable 
              de mantener la confidencialidad de la información de su cuenta y de todas las actividades 
              que ocurran bajo su cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Conducta del Usuario</h2>
            <p className="mb-4">
              Usted acepta no utilizar el servicio para:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Violar cualquier ley o regulación</li>
              <li>Infringir los derechos de terceros</li>
              <li>Publicar contenido falso, engañoso o difamatorio</li>
              <li>Transmitir virus u otro código dañino</li>
              <li>Interferir con el servicio o sus características de seguridad</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Propiedad Intelectual</h2>
            <p className="mb-4">
              Todo el contenido en la plataforma Glooba, incluyendo texto, gráficos, logotipos y software, es 
              propiedad de Glooba o de sus licenciantes y está protegido por las leyes de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Limitación de Responsabilidad</h2>
            <p className="mb-4">
              En la máxima medida permitida por la ley, Glooba no será responsable por ningún daño indirecto, 
              incidental, especial, consecuente o punitivo que resulte de su uso o 
              incapacidad para usar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Terminación</h2>
            <p className="mb-4">
              Podemos terminar o suspender su cuenta y el acceso al servicio a nuestra entera discreción, 
              sin previo aviso, por conductas que consideremos que violan estos Términos o que son perjudiciales 
              para otros usuarios, para nosotros o para terceros, o por cualquier otra razón.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Cambios en los Términos</h2>
            <p className="mb-4">
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Notificaremos cualquier 
              cambio actualizando la fecha de "Última actualización" en la parte superior de esta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Ley Aplicable</h2>
            <p className="mb-4">
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de la 
              jurisdicción en la que esté establecida Glooba, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contáctenos</h2>
            <p>
              Si tiene alguna pregunta sobre estos Términos, por favor contáctenos en:
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
