-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Scope3Category" ADD VALUE 'cat2_capital_goods';
ALTER TYPE "Scope3Category" ADD VALUE 'cat3_fuel_energy';
ALTER TYPE "Scope3Category" ADD VALUE 'cat5_waste';
ALTER TYPE "Scope3Category" ADD VALUE 'cat6_business_travel';
ALTER TYPE "Scope3Category" ADD VALUE 'cat7_employee_commuting';
ALTER TYPE "Scope3Category" ADD VALUE 'cat8_upstream_leased';
ALTER TYPE "Scope3Category" ADD VALUE 'cat10_product_processing';
ALTER TYPE "Scope3Category" ADD VALUE 'cat13_downstream_leased';

-- AlterTable
ALTER TABLE "Scope3Transportation" ADD COLUMN     "transportCategory" TEXT NOT NULL DEFAULT 'upstream';

-- CreateTable
CREATE TABLE "Scope3CapitalGood" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "purchaseYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3CapitalGood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3FuelEnergy" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "activityDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3FuelEnergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3Waste" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "wasteType" TEXT NOT NULL,
    "disposalMethod" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3Waste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3BusinessTravel" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "travelType" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "numberOfTrips" INTEGER NOT NULL,
    "origin" TEXT,
    "destination" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3BusinessTravel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3EmployeeCommuting" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "transportMode" TEXT NOT NULL,
    "averageDistancePerDay" DOUBLE PRECISION NOT NULL,
    "daysPerYear" INTEGER NOT NULL,
    "numberOfEmployees" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3EmployeeCommuting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3UpstreamLeased" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "leaseType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3UpstreamLeased_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3ProductProcessing" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "processingType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3ProductProcessing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope3DownstreamLeased" (
    "id" TEXT NOT NULL,
    "activityDataId" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "leaseType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope3DownstreamLeased_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Scope3CapitalGood_activityDataId_key" ON "Scope3CapitalGood"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3FuelEnergy_activityDataId_key" ON "Scope3FuelEnergy"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3Waste_activityDataId_key" ON "Scope3Waste"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3BusinessTravel_activityDataId_key" ON "Scope3BusinessTravel"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3EmployeeCommuting_activityDataId_key" ON "Scope3EmployeeCommuting"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3UpstreamLeased_activityDataId_key" ON "Scope3UpstreamLeased"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3ProductProcessing_activityDataId_key" ON "Scope3ProductProcessing"("activityDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope3DownstreamLeased_activityDataId_key" ON "Scope3DownstreamLeased"("activityDataId");

-- AddForeignKey
ALTER TABLE "Scope3CapitalGood" ADD CONSTRAINT "Scope3CapitalGood_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3FuelEnergy" ADD CONSTRAINT "Scope3FuelEnergy_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3Waste" ADD CONSTRAINT "Scope3Waste_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3BusinessTravel" ADD CONSTRAINT "Scope3BusinessTravel_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3EmployeeCommuting" ADD CONSTRAINT "Scope3EmployeeCommuting_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3UpstreamLeased" ADD CONSTRAINT "Scope3UpstreamLeased_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3ProductProcessing" ADD CONSTRAINT "Scope3ProductProcessing_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope3DownstreamLeased" ADD CONSTRAINT "Scope3DownstreamLeased_activityDataId_fkey" FOREIGN KEY ("activityDataId") REFERENCES "ActivityData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
