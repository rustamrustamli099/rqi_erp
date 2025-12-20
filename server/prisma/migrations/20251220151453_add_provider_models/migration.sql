/*
  Warnings:

  - The `details` column on the `audit_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `latitude` on the `cities` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `cities` table. All the data in the column will be lost.
  - You are about to drop the column `isAllowed` on the `countries` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `countries` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `countries` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `districts` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `districts` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `billingReason` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `periodEnd` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `invoices` table. All the data in the column will be lost.
  - The `status` column on the `invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `slug` on the `packages` table. All the data in the column will be lost.
  - You are about to alter the column `priceMonthly` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `priceYearly` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `scope` on the `permissions` table. All the data in the column will be lost.
  - The `details` column on the `security_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `billingCycle` column on the `subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `sectorId` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `tin` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `isMfaEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mfaSecret` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `document_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sectors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timezones` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[number]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `access_policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `access_policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `cities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `countries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `districts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountDue` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountRemaining` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'SUSPENDED', 'TRIALING');

-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('PROVIDER', 'CUSTOMER', 'RESELLER', 'PARTNER');

-- CreateEnum
CREATE TYPE "LedgerAccountType" AS ENUM ('CASH', 'REVENUE', 'ACCOUNTS_RECEIVABLE', 'ACCOUNTS_PAYABLE', 'LIABILITY', 'EXPENSE', 'COMMISSION_EXPENSE');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "access_policies" DROP CONSTRAINT "access_policies_userId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "security_logs" DROP CONSTRAINT "security_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "template_versions" DROP CONSTRAINT "template_versions_templateId_fkey";

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_sectorId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenantId_fkey";

-- DropIndex
DROP INDEX "packages_slug_key";

-- DropIndex
DROP INDEX "roles_name_tenantId_key";

-- AlterTable
ALTER TABLE "access_policies" ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "conditions" JSONB,
ADD COLUMN     "effect" TEXT NOT NULL DEFAULT 'ALLOW',
ADD COLUMN     "resource" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "allowedDays" DROP NOT NULL,
ALTER COLUMN "allowedIps" DROP NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "resource" TEXT,
ADD COLUMN     "userAgent" TEXT,
ALTER COLUMN "module" DROP NOT NULL,
DROP COLUMN "details",
ADD COLUMN     "details" JSONB;

-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "cities" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "countries" DROP COLUMN "isAllowed",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "districts" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "files" ALTER COLUMN "uploadedBy" DROP NOT NULL,
ALTER COLUMN "module" DROP NOT NULL,
ALTER COLUMN "module" DROP DEFAULT,
ALTER COLUMN "usage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "amount",
DROP COLUMN "billingReason",
DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
DROP COLUMN "tenantId",
ADD COLUMN     "amountDue" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "amountRemaining" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "items" JSONB,
ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'AZN',
DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "menus" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "packages" DROP COLUMN "slug",
ALTER COLUMN "priceMonthly" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "priceYearly" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "scope",
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "security_logs" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "ipAddress" DROP NOT NULL,
DROP COLUMN "details",
ADD COLUMN     "details" JSONB;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "billingCycle",
ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "sectorId",
DROP COLUMN "tin",
ADD COLUMN     "address" JSONB,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "type" "TenantType" NOT NULL DEFAULT 'CUSTOMER';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isMfaEnabled",
DROP COLUMN "mfaSecret",
ADD COLUMN     "is_mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfa_secret" TEXT,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- DropTable
DROP TABLE "document_templates";

-- DropTable
DROP TABLE "sectors";

-- DropTable
DROP TABLE "template_versions";

-- DropTable
DROP TABLE "timezones";

-- DropEnum
DROP TYPE "PermissionScope";

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tenantId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_items" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "token" TEXT,
    "last4" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "status" "TransactionStatus" NOT NULL,
    "providerTxId" TEXT,
    "failureReason" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_policies" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reseller_profiles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "totalRevenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalCommission" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reseller_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "debitAccount" "LedgerAccountType" NOT NULL,
    "creditAccount" "LedgerAccountType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_transactions" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AZN',
    "status" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "gatewayTxId" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_tenantId_key" ON "user_roles"("userId", "roleId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_profiles_tenantId_key" ON "reseller_profiles"("tenantId");

-- CreateIndex
CREATE INDEX "ledger_entries_tenantId_postedAt_idx" ON "ledger_entries"("tenantId", "postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenantId_name_key" ON "roles"("tenantId", "name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_profiles" ADD CONSTRAINT "reseller_profiles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
