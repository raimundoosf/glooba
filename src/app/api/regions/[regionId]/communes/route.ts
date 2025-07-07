import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { regionId: string } }
) {
  const { regionId } = params;

  if (!regionId) {
    return NextResponse.json(
      { error: 'El ID de la región es requerido.' },
      { status: 400 }
    );
  }

  try {
    const communes = await prisma.commune.findMany({
      where: {
        regionId: regionId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (communes.length === 0) {
      // Esto puede significar que la región no existe o no tiene comunas.
      // Devolvemos un arreglo vacío, que es una respuesta válida.
    }

    return NextResponse.json(communes);
  } catch (error) {
    console.error(`Failed to fetch communes for region ${regionId}:`, error);
    return NextResponse.json(
      { error: 'Error al obtener las comunas.' },
      { status: 500 }
    );
  }
}
