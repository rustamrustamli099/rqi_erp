-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "sectorId" TEXT,
ADD COLUMN     "tin" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "sectors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sectors_name_key" ON "sectors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_slug_key" ON "sectors"("slug");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
