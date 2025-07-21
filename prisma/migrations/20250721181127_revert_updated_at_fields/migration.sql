/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CompanyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Follows` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,regionId]` on the table `Commune` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "CompanyRequest" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Follows" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE INDEX "Commune_regionId_idx" ON "Commune"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Commune_name_regionId_key" ON "Commune"("name", "regionId");
