-- CreateTable
CREATE TABLE "CompanyRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "description" TEXT NOT NULL,
    "sustainability" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyRequest_pkey" PRIMARY KEY ("id")
);
