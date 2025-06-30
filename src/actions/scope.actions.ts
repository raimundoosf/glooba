'use server';

import { PrismaClient, ScopeType } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

interface UpdateScopeParams {
  companyId: string;
  scope: ScopeType;
  regions?: string[];
  communes?: string[];
}

export async function updateUserScope(params: UpdateScopeParams) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error('Usuario no autenticado.');
  }

  const { companyId, scope, regions, communes } = params;

  // Verificación: Asegurarse de que el usuario que hace la petición es el dueño de la empresa
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user || user.id !== companyId) {
    throw new Error('No autorizado para realizar esta acción.');
  }

  try {
    // Usamos una transacción para asegurar la atomicidad de la operación
    await prisma.$transaction(async (tx) => {
      // 1. Borrar todas las áreas de servicio existentes para esta empresa
      await tx.companyServiceArea.deleteMany({
        where: { companyId },
      });

      // 2. Crear las nuevas áreas de servicio basadas en el scope
      if (scope === 'COUNTRY') {
        await tx.companyServiceArea.create({
          data: {
            companyId,
            scope: 'COUNTRY',
          },
        });
      } else if (scope === 'REGION' && regions && regions.length > 0) {
        await tx.companyServiceArea.createMany({
          data: regions.map((regionId) => ({
            companyId,
            scope: 'REGION',
            regionId,
          })),
        });
      } else if (scope === 'COMMUNE' && communes && communes.length > 0) {
        // 1. Para garantizar la integridad, buscamos cada comuna para obtener su regionId.
        const communesWithRegions = await tx.commune.findMany({
          where: {
            id: { in: communes },
          },
          select: {
            id: true,
            regionId: true,
          },
        });

        // 2. Creamos las áreas de servicio con el ID de la comuna y su respectiva región.
        await tx.companyServiceArea.createMany({
          data: communesWithRegions.map((commune) => ({
            companyId,
            scope: 'COMMUNE',
            communeId: commune.id,
            regionId: commune.regionId, // Guardar también la región
          })),
        });
      }
    });

    // Revalidar la página del perfil para que los cambios se muestren inmediatamente
    revalidatePath(`/profile/${user.username}`);

    return { success: true, message: 'Alcance actualizado correctamente.' };
  } catch (error) {
    console.error('Error updating user scope:', error);
    return { success: false, message: 'Error al actualizar el alcance.' };
  }
}
