-- CreateEnum
CREATE TYPE "ExcelImportStatus" AS ENUM ('uploading', 'completed', 'failed');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN "dataSource" TEXT NOT NULL DEFAULT 'dashboard',
ADD COLUMN "excelImportId" TEXT;

-- CreateTable
CREATE TABLE "ExcelImport" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalSize" INTEGER NOT NULL,
    "compressedSize" INTEGER,
    "filePath" TEXT NOT NULL,
    "reportingYear" INTEGER NOT NULL,
    "status" "ExcelImportStatus" NOT NULL DEFAULT 'uploading',
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "parsedSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExcelImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExcelImport_organizationId_idx" ON "ExcelImport"("organizationId");

-- CreateIndex
CREATE INDEX "ExcelImport_status_idx" ON "ExcelImport"("status");

-- CreateIndex
CREATE INDEX "Report_excelImportId_idx" ON "Report"("excelImportId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_excelImportId_fkey" FOREIGN KEY ("excelImportId") REFERENCES "ExcelImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcelImport" ADD CONSTRAINT "ExcelImport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcelImport" ADD CONSTRAINT "ExcelImport_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
