const nodeFetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Tipos para la data de la API
interface ApiRegion {
  codigo: string;
  nombre: string;
}

interface ApiCommune {
  codigo: string;
  nombre: string;
}

async function main() {
  console.log('Iniciando el seeding de la base de datos...');

  // 1. Limpiar datos existentes
  console.log('Limpiando tablas de Commune y Region...');
  await prisma.commune.deleteMany({});
  await prisma.region.deleteMany({});

  // 2. Obtener y procesar regiones
  console.log('Obteniendo regiones desde la API...');
  const regionsResponse = await nodeFetch('https://apis.digital.gob.cl/dpa/regiones');
  if (!regionsResponse.ok) {
    throw new Error(`Error al obtener regiones: ${regionsResponse.statusText}`);
  }
  const regionsData: ApiRegion[] = await regionsResponse.json();

  const regionsToCreate = regionsData.map((region) => ({
    id: region.codigo,
    name: region.nombre,
  }));

  await prisma.region.createMany({
    data: regionsToCreate,
  });
  console.log(`${regionsToCreate.length} regiones han sido creadas.`);

  // 3. Obtener y procesar comunas para cada región
  console.log('Obteniendo comunas para cada región...');
  let totalCommunes = 0;
  for (const region of regionsData) {
    const communesResponse = await nodeFetch(
      `https://apis.digital.gob.cl/dpa/regiones/${region.codigo}/comunas`
    );
    if (!communesResponse.ok) {
      console.warn(`No se pudieron obtener comunas para la región ${region.nombre}`);
      continue;
    }
    const communesData: ApiCommune[] = await communesResponse.json();

    const communesToCreate = communesData.map((commune) => ({
      id: commune.codigo,
      name: commune.nombre,
      regionId: region.codigo,
    }));

    if (communesToCreate.length > 0) {
      await prisma.commune.createMany({
        data: communesToCreate,
      });
      totalCommunes += communesToCreate.length;
      console.log(`  - ${communesToCreate.length} comunas creadas para la región ${region.nombre}.`);
    }
  }

  console.log(`Total de ${totalCommunes} comunas creadas.`);
  console.log('Seeding completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
