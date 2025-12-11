/*
  Warnings:

  - You are about to drop the `streets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `phoneCode` to the `countries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usage` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "streets" DROP CONSTRAINT "streets_districtId_fkey";

-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "countries" ADD COLUMN     "isAllowed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "phoneCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "districts" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "module" TEXT NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "usage" TEXT NOT NULL;

-- DropTable
DROP TABLE "streets";
