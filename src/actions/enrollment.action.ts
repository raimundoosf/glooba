"use server";

import prisma from "@/lib/prisma";

export interface EnrollmentData {
  companyName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  website?: string;
  description: string;
  sustainability?: string;
}

export interface EnrollmentResponse {
  success: boolean;
  error?: string;
}

/**
 * Submits an enrollment request to the database.
 *
 * Validates the data and returns an error string if the data is invalid.
 * If the data is valid, creates a new CompanyRequest document in the database
 * and returns a success response.
 *
 * @param data - The data to submit, including the company name, industry, contact name, contact email, phone, website, description, and sustainability
 * @returns A response object indicating success or failure, with an error message if the submission failed
 */
export async function submitEnrollment(
  data: EnrollmentData
): Promise<EnrollmentResponse> {
  // Validación básica
  if (!data.companyName?.trim()) {
    return { success: false, error: "El nombre de la empresa es obligatorio." };
  }
  if (!data.industry?.trim()) {
    return { success: false, error: "Debe seleccionar una industria." };
  }
  if (!data.contactName?.trim()) {
    return {
      success: false,
      error: "El nombre de la persona de contacto es obligatorio.",
    };
  }
  if (!data.contactEmail?.trim()) {
    return { success: false, error: "El correo electrónico es obligatorio." };
  }
  if (!/\S+@\S+\.\S+/.test(data.contactEmail)) {
    return { success: false, error: "El correo electrónico no es válido." };
  }
  if (!data.description?.trim()) {
    return {
      success: false,
      error: "La descripción de la empresa es obligatoria.",
    };
  }

  try {
    await prisma.companyRequest.create({
      data: {
        name: data.companyName,
        industry: data.industry,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        phone: data.phone,
        website: data.website,
        description: data.description,
        sustainability: data.sustainability,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al guardar los datos." };
  }
}
