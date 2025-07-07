import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(regions);
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return NextResponse.json(
      { error: 'Error al obtener las regiones.' },
      { status: 500 }
    );
  }
}
