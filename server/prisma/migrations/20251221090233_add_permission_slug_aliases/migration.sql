/*
  Warnings:

  - A unique constraint covering the columns `[resellerCode]` on the table `reseller_profiles` will be added. If there are existing duplicate values, this will fail.
  - The required column `resellerCode` was added to the `reseller_profiles` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "reseller_profiles" ADD COLUMN     "resellerCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "parentTenantId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "permission_slug_aliases" (
    "id" TEXT NOT NULL,
    "oldSlug" TEXT NOT NULL,
    "newSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_slug_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_slug_aliases_oldSlug_key" ON "permission_slug_aliases"("oldSlug");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_profiles_resellerCode_key" ON "reseller_profiles"("resellerCode");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_parentTenantId_fkey" FOREIGN KEY ("parentTenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
