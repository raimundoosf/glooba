'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EnrollmentPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Manejar el envío del formulario
    alert('¡Gracias por su interés! Revisaremos su solicitud y nos pondremos en contacto a la brevedad.');
  };

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Registro de Empresas/Organizaciones</CardTitle>
          <CardDescription>
            Únete a nuestra red de empresas y organizaciones sostenibles. Complete el formulario a continuación para comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa/Organización *</Label>
                  <Input 
                    id="companyName" 
                    name="companyName"
                    placeholder="Ejemplo S.A." 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria *</Label>
                  <Select name="industry" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="manufactura">Manufactura</SelectItem>
                      <SelectItem value="comercio">Comercio Minorista</SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Información de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Persona de Contacto *</Label>
                  <Input 
                    id="contactName" 
                    name="contactName"
                    placeholder="Juan Pérez" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Correo Electrónico *</Label>
                  <Input 
                    id="contactEmail" 
                    name="contactEmail"
                    type="email" 
                    placeholder="contacto@ejemplo.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel" 
                    placeholder="+56 9 1234 5678" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input 
                    id="website" 
                    name="website"
                    type="url" 
                    placeholder="https://ejemplo.com" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Detalles de la Empresa</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción de la Empresa *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Cuéntenos sobre su empresa/organización..."
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sustainability">Iniciativas de Sostenibilidad</Label>
                  <Textarea
                    id="sustainability"
                    name="sustainability"
                    placeholder="Describa sus esfuerzos u objetivos actuales en sostenibilidad..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button type="submit" className="w-full md:w-auto">
                Enviar Solicitud
              </Button>
              <p className="text-sm text-muted-foreground">
                Revisaremos su solicitud y nos pondremos en contacto dentro de 3-5 días hábiles.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
