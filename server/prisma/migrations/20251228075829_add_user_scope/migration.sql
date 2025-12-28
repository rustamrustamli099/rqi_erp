-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'TENANT';
