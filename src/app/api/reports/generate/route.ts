import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateESGSummaryPDF } from "@/modules/reports/components/ESGSummaryReport";
import { buildReportSummaryFromActivities } from "@/modules/reports/services/build-report-summary";
import { canGenerateReports } from "@/lib/permissions";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canGenerateReports(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!session.user.organizationId) {
            return NextResponse.json(
                { error: "No organization associated" },
                { status: 400 },
            );
        }

        const body = await request.json();
        const { reportingYear, reportType } = body;

        if (!reportingYear) {
            return NextResponse.json(
                { error: "Reporting year is required" },
                { status: 400 },
            );
        }

        const organization = await prisma.organization.findUnique({
            where: { id: session.user.organizationId },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 },
            );
        }

        const reportingYearRecord = await prisma.reportingYear.findFirst({
            where: {
                organizationId: session.user.organizationId,
                year: reportingYear,
            },
        });

        const activities = await prisma.activityData.findMany({
            where: {
                organizationId: session.user.organizationId,
                ...(reportingYearRecord
                    ? { reportingYearId: reportingYearRecord.id }
                    : {}),
            },
            include: {
                emissionFactor: true,
            },
        });

        const summary = buildReportSummaryFromActivities(
            activities,
            organization.country,
            organization.industryType,
        );

        const reportData = {
            organization: {
                name: organization.name,
                country: organization.country,
                industryType: organization.industryType,
            },
            reportingYear,
            generatedAt: new Date().toISOString(),
            ...summary,
            countryContext: {
                benchmark:
                    organization.country === "US"
                        ? "EPA Manufacturing Benchmark"
                        : "Malaysia Grid Average",
                unit:
                    organization.country === "US"
                        ? "lb CO2e/unit"
                        : "kg CO2e/kWh",
                threshold:
                    organization.country === "US"
                        ? { low: 25, medium: 50, high: 50 }
                        : { low: 20, medium: 40, high: 40 },
            },
        };

        if (reportType === "esg_summary") {
            const pdfBlob = await generateESGSummaryPDF(reportData);
            const arrayBuffer = await pdfBlob.arrayBuffer();
            const pdfBase64 = Buffer.from(arrayBuffer).toString("base64");

            const report = await prisma.report.create({
                data: {
                    organizationId: session.user.organizationId,
                    reportingYear,
                    reportType: "esg_summary",
                    status: "completed",
                    generatedById: session.user.id,
                    generatedAt: new Date(),
                    filePath: null,
                },
            });

            await prisma.auditLog.create({
                data: {
                    organizationId: session.user.organizationId,
                    userId: session.user.id,
                    action: "generate_report",
                    entityType: "Report",
                    entityId: report.id,
                    newValue: {
                        reportingYear,
                        reportType: "esg_summary",
                        totalEmissions: summary.totalEmissions,
                        activityCount: summary.activityCount,
                    },
                },
            });

            return NextResponse.json(
                {
                    id: report.id,
                    organizationId: report.organizationId,
                    reportingYear: report.reportingYear,
                    reportType: report.reportType,
                    status: report.status,
                    generatedAt: report.generatedAt?.toISOString(),
                    createdAt: report.createdAt.toISOString(),
                    pdfBase64,
                    summary: {
                        totalEmissions: summary.totalEmissions,
                        byScope: {
                            scope1: summary.scope1Emissions,
                            scope2: summary.scope2Emissions,
                            scope3: summary.scope3Emissions,
                        },
                        byCategory: Object.fromEntries(
                            summary.scope3Categories.map((c) => [
                                c.categoryKey,
                                c.emissions,
                            ]),
                        ),
                        activityCount: summary.activityCount,
                        actionPlan: summary.actionPlan,
                    },
                },
                { status: 201 },
            );
        }

        const report = await prisma.report.create({
            data: {
                organizationId: session.user.organizationId,
                reportingYear,
                reportType: reportType || "esg_summary",
                status: "completed",
                generatedById: session.user.id,
                generatedAt: new Date(),
                filePath: null,
            },
        });

        await prisma.auditLog.create({
            data: {
                organizationId: session.user.organizationId,
                userId: session.user.id,
                action: "generate_report",
                entityType: "Report",
                entityId: report.id,
                newValue: {
                    reportingYear,
                    reportType,
                    totalEmissions: summary.totalEmissions,
                    activityCount: summary.activityCount,
                },
            },
        });

        return NextResponse.json(
            {
                id: report.id,
                organizationId: report.organizationId,
                reportingYear: report.reportingYear,
                reportType: report.reportType,
                status: report.status,
                generatedAt: report.generatedAt?.toISOString(),
                createdAt: report.createdAt.toISOString(),
                summary: {
                    totalEmissions: summary.totalEmissions,
                    byScope: {
                        scope1: summary.scope1Emissions,
                        scope2: summary.scope2Emissions,
                        scope3: summary.scope3Emissions,
                    },
                    byCategory: Object.fromEntries(
                        summary.scope3Categories.map((c) => [
                            c.categoryKey,
                            c.emissions,
                        ]),
                    ),
                    activityCount: summary.activityCount,
                    actionPlan: summary.actionPlan,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
