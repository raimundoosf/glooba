"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitEnrollment } from "@/actions/enrollment.action";
import { toast } from "react-hot-toast";

export default function EnrollmentPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    contactName: "",
    contactEmail: "",
    phone: "",
    website: "",
    description: "",
    sustainability: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim())
      newErrors.companyName = "El nombre de la empresa es obligatorio.";
    if (!formData.industry.trim())
      newErrors.industry = "Debe seleccionar una industria.";
    if (!formData.contactName.trim())
      newErrors.contactName =
        "El nombre de la persona de contacto es obligatorio.";
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "El correo electrónico no es válido.";
    }
    if (!formData.description.trim())
      newErrors.description = "La descripción de la empresa es obligatoria.";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await submitEnrollment(formData);
      if (res.success) {
        toast.success(
          "¡Gracias por su interés! Revisaremos su solicitud y nos pondremos en contacto a la brevedad."
        );
        setFormData({
          companyName: "",
          industry: "",
          contactName: "",
          contactEmail: "",
          phone: "",
          website: "",
          description: "",
          sustainability: "",
        });
      } else {
        toast.error(res.error || "Ocurrió un error inesperado.");
      }
    });
  };

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Registro de Empresas/Organizaciones
          </CardTitle>
          <CardDescription>
            Únete a nuestra red de empresas y organizaciones sostenibles.
            Complete el formulario a continuación para comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Nombre de la Empresa/Organización *
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Ejemplo S.A."
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm">{errors.companyName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria *</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("industry", value)
                    }
                    value={formData.industry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="manufactura">Manufactura</SelectItem>
                      <SelectItem value="comercio">
                        Comercio Minorista
                      </SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-red-500 text-sm">{errors.industry}</p>
                  )}
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
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-sm">{errors.contactName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Correo Electrónico *</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    placeholder="contacto@ejemplo.com"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm">
                      {errors.contactEmail}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://ejemplo.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Detalles de la Empresa</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción de la Empresa *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Cuéntenos sobre su empresa/organización..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sustainability">
                    Iniciativas de Sostenibilidad
                  </Label>
                  <Textarea
                    id="sustainability"
                    name="sustainability"
                    placeholder="Describa sus esfuerzos u objetivos actuales en sostenibilidad..."
                    className="min-h-[100px]"
                    value={formData.sustainability}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isPending}
              >
                {isPending ? "Enviando..." : "Enviar Solicitud"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Revisaremos su solicitud y nos pondremos en contacto dentro de
                3-5 días hábiles.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
