-- CreateEnum
CREATE TYPE "Country" AS ENUM ('US', 'MY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'org_admin', 'sustainability_manager', 'data_entry_staff', 'viewer');

-- CreateEnum
CREATE TYPE "IndustryType" AS ENUM ('automotive', 'electronics', 'food_beverage', 'chemicals', 'textiles', 'plastics', 'metals', 'machinery', 'paper_packaging', 'other');

-- CreateEnum
CREATE TYPE "EmissionScope" AS ENUM ('scope1', 'scope2', 'scope3');

-- CreateEnum
CREATE TYPE "Scope3Category" AS ENUM ('cat1_purchased_goods', 'cat4_upstream_transport', 'cat9_downstream_transport', 'cat11_product_use', 'cat12_end_of_life');

-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ReportingStatus" AS ENUM ('draft', 'submitted', 'approved', 'verified');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('esg_summary', 'detailed');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('truck', 'rail', 'ship', 'aircraft', 'pipeline', 'van');

-- CreateEnum
CREATE TYPE "DisposalType" AS ENUM ('landfill', 'incineration', 'recycling', 'composting', 'energy_recovery');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" "Country" NOT NULL,
    "currency" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "industryType" "IndustryType" NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'data_entry_staff',
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "facilityType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportingYear" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "ReportingStatus" NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportingYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactorSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactorSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionFactor" (
    "id" TEXT NOT NULL,
    "category" "EmissionScope" NOT NULL,
    "scope3Category" "Scope3Category",
    "activityType" TEXT NOT NULL,
    "activityUnit" TEXT NOT NULL,
    "factorValue" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "country" "Country" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "EmissionFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityData" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reportingYearId" TEXT NOT NULL,
    "facilityId" TEXT,
    "scope" "EmissionScope" NOT NULL,
    "scope3Category" "Scope3Category",
    "activityType" TEXT NOT NULL,
    "inputValue" DOUBLE PRECISION NOT NULL,
    "inputUnit" TEXT NOT NULL,
    "convertedValue" DOUBLE PRECISION NOT NULL,
    "convertedUnit" TEXT NOT NULL,
    "emissionFactorId" TEXT,
    "calculatedEmissions" DOUBLE PRECISION,
    "dataStatus" "DataStatus" NOT NULL DEFAULT 'draft',
    "submittedById" TEXT,
    "approvedById" TEXT,
    "comments" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope1Vehicle" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope1Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope1Stationary" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope1Stationary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope1Refrigerant" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "refrigerantType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope1Refrigerant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope2Electricity" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "gridRegion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope2Electricity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3PurchasedGood" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "supplierId" TEXT,
    "supplierCountry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3PurchasedGood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3Transportation" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "transportMode" "TransportMode" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "distanceUnit" TEXT NOT NULL DEFAULT 'km',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3Transportation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3ProductUse" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "annualEnergyKwh" DOUBLE PRECISION NOT NULL,
    "lifetimeYears" INTEGER,
    "unitsSold" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3ProductUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3EndOfLife" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "disposalType" "DisposalType" NOT NULL,
    "wasteQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3EndOfLife_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "contactEmail" TEXT,
    "industryType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "filePath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "generatedAt" TIMESTAMP(3),
    "generatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "comments" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_country_idx" ON "Organization"("country");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "Facility_organizationId_idx" ON "Facility"("organizationId");

-- CreateIndex
CREATE INDEX "ReportingYear_organizationId_idx" ON "ReportingYear"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportingYear_organizationId_year_key" ON "ReportingYear"("organizationId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "FactorSource_name_key" ON "FactorSource"("name");

-- CreateIndex
CREATE INDEX "EmissionFactor_category_idx" ON "EmissionFactor"("category");

-- CreateIndex
CREATE INDEX "EmissionFactor_country_idx" ON "EmissionFactor"("country");

-- CreateIndex
CREATE INDEX "EmissionFactor_organizationId_idx" ON "EmissionFactor"("organizationId");

-- CreateIndex
CREATE INDEX "EmissionFactor_activityType_idx" ON "EmissionFactor"("activityType");

-- CreateIndex
CREATE INDEX "ActivityData_organizationId_idx" ON "ActivityData"("organizationId");

-- CreateIndex
CREATE INDEX "ActivityData_reportingYearId_idx" ON "ActivityData"("reportingYearId");

-- CreateIndex
CREATE INDEX "ActivityData_scope_idx" ON "ActivityData"("scope");

-- CreateIndex
CREATE INDEX "ActivityData_dataStatus_idx" ON "ActivityData"("dataStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Scope2Electricity_activityDataId_key" ON "Scope2Electricity"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3PurchasedGood_activityDataId_key" ON "Scope3PurchasedGood"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3Transportation_activityDataId_key" ON "Scope3Transportation"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3ProductUse_activityDataId_key" ON "Scope3ProductUse"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3EndOfLife_activityDataId_key" ON "Scope3EndOfLife"("activityDataId");

-- CreateIndex
CREATE INDEX "Supplier_organizationId_idx" ON "Supplier"("organizationId");

-- CreateIndex
CREATE INDEX "Product_organizationId_idx" ON "Product"("organizationId");

-- CreateIndex
CREATE INDEX "Report_organizationId_idx" ON "Report"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ApprovalRequest_activityDataId_idx" ON "ApprovalRequest"("activityDataId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_status_idx" ON "ApprovalRequest"("status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportingYear" ADD CONSTRAINT "ReportingYear_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionFactor" ADD CONSTRAINT "EmissionFactor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionFactor" ADD CONSTRAINT "EmissionFactor_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "FactorSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityData" ADD CONSTRAINT "ActivityData_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityData" ADD CONSTRAINT "ActivityData_reportingYearId_fkey" FOREIGN KEY ("reportingYearId") REFERENCES "ReportingYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityData" ADD CONSTRAINT "ActivityData_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityData" ADD CONSTRAINT "ActivityData_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityData" ADD CONSTRAINT "ActivityData_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityData" ADD CONSTRAINT "ActivityData_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope1Vehicle" ADD CONSTRAINT "Scope1Vehicle_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope1Stationary" ADD CONSTRAINT "Scope1Stationary_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope1Refrigerant" ADD CONSTRAINT "Scope1Refrigerant_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope2Electricity" ADD CONSTRAINT "Scope2Electricity_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3PurchasedGood" ADD CONSTRAINT "Scope3PurchasedGood_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3PurchasedGood" ADD CONSTRAINT "Scope3PurchasedGood_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3Transportation" ADD CONSTRAINT "Scope3Transportation_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3ProductUse" ADD CONSTRAINT "Scope3ProductUse_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3EndOfLife" ADD CONSTRAINT "Scope3EndOfLife_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
