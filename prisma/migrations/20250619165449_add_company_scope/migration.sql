-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('COUNTRY', 'REGION', 'COMMUNE');

-- CreateTable
CREATE TABLE "Commune" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyServiceArea" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "scope" "ScopeType" NOT NULL DEFAULT 'COUNTRY',
    "regionId" TEXT,
    "communeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Commune_regionId_idx" ON "Commune"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Commune_name_regionId_key" ON "Commune"("name", "regionId");

-- CreateIndex
CREATE INDEX "CompanyServiceArea_communeId_idx" ON "CompanyServiceArea"("communeId");

-- CreateIndex
CREATE INDEX "CompanyServiceArea_companyId_idx" ON "CompanyServiceArea"("companyId");

-- CreateIndex
CREATE INDEX "CompanyServiceArea_regionId_idx" ON "CompanyServiceArea"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- AddForeignKey
ALTER TABLE "Commune" ADD CONSTRAINT "Commune_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyServiceArea" ADD CONSTRAINT "CompanyServiceArea_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "Commune"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyServiceArea" ADD CONSTRAINT "CompanyServiceArea_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyServiceArea" ADD CONSTRAINT "CompanyServiceArea_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
