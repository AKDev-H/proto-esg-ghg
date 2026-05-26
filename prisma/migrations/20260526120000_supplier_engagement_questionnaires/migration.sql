-- CreateEnum
CREATE TYPE "SupplierCategory" AS ENUM ('stainless_steel', 'aluminum', 'chemicals', 'logistics', 'other');

-- CreateEnum
CREATE TYPE "QuestionnaireType" AS ENUM ('carbon_disclosure', 'pcf', 'energy_usage');

-- CreateEnum
CREATE TYPE "QuestionnaireInviteStatus" AS ENUM ('pending', 'opened', 'submitted', 'expired', 'revoked');

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN "categories" "SupplierCategory"[] DEFAULT ARRAY[]::"SupplierCategory"[],
ADD COLUMN "otherCategoryType" TEXT;

-- CreateTable
CREATE TABLE "SupplierQuestionnaireInvite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "questionnaireTypes" "QuestionnaireType"[],
    "status" "QuestionnaireInviteStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierQuestionnaireInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierQuestionnaireResponse" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "carbonDisclosure" JSONB,
    "pcf" JSONB,
    "energyUsage" JSONB,
    "respondentName" TEXT,
    "respondentEmail" TEXT,
    "respondentTitle" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierQuestionnaireResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierQuestionnaireInvite_tokenHash_key" ON "SupplierQuestionnaireInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "SupplierQuestionnaireInvite_organizationId_idx" ON "SupplierQuestionnaireInvite"("organizationId");

-- CreateIndex
CREATE INDEX "SupplierQuestionnaireInvite_supplierId_idx" ON "SupplierQuestionnaireInvite"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierQuestionnaireInvite_status_idx" ON "SupplierQuestionnaireInvite"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierQuestionnaireResponse_inviteId_key" ON "SupplierQuestionnaireResponse"("inviteId");

-- AddForeignKey
ALTER TABLE "SupplierQuestionnaireInvite" ADD CONSTRAINT "SupplierQuestionnaireInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierQuestionnaireInvite" ADD CONSTRAINT "SupplierQuestionnaireInvite_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierQuestionnaireInvite" ADD CONSTRAINT "SupplierQuestionnaireInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierQuestionnaireResponse" ADD CONSTRAINT "SupplierQuestionnaireResponse_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "SupplierQuestionnaireInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
