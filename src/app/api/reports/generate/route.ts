import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateESGSummaryPDF } from "@/modules/reports/components/ESGSummaryReport";
import { SCOPE3_CATEGORY_LABELS } from "@/lib/constants";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "No organization associated" }, { status: 400 });
        }

        const body = await request.json();
        const { reportingYear, reportType } = body;

        if (!reportingYear) {
            return NextResponse.json({ error: "Reporting year is required" }, { status: 400 });
        }

        const organization = await prisma.organization.findUnique({
            where: { id: session.user.organizationId },
        });

        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
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
                ...(reportingYearRecord ? { reportingYearId: reportingYearRecord.id } : {}),
            },
            include: {
                emissionFactor: true,
            },
        });

        const totalEmissions = activities.reduce(
            (sum, a) => sum + (a.calculatedEmissions ?? 0),
            0,
        );

        const byScope = {
            scope1: 0,
            scope2: 0,
            scope3: 0,
        };
        const byCategory: Record<string, number> = {};
        const byActivityType: Record<string, number> = {};

        for (const activity of activities) {
            byScope[activity.scope as keyof typeof byScope] += activity.calculatedEmissions ?? 0;
            
            const activityKey = `${activity.scope}:${activity.activityType}`;
            byActivityType[activityKey] = (byActivityType[activityKey] || 0) + (activity.calculatedEmissions ?? 0);
            
            if (activity.scope === "scope3" && activity.scope3Category) {
                byCategory[activity.scope3Category] =
                    (byCategory[activity.scope3Category] || 0) + (activity.calculatedEmissions ?? 0);
            }
        }

        const scope3Categories = Object.entries(byCategory)
            .map(([category, emissions]) => ({
                category: SCOPE3_CATEGORY_LABELS[category] || category,
                emissions,
                percentage: totalEmissions > 0 ? (emissions / totalEmissions) * 100 : 0,
                activityCount: activities.filter(a => a.scope === "scope3" && a.scope3Category === category).length,
            }))
            .sort((a, b) => b.emissions - a.emissions);

        const topActivities = Object.entries(byActivityType)
            .map(([key, emissions]) => {
                const [scope, activityType] = key.split(":");
                return { activityType, emissions, scope };
            })
            .sort((a, b) => b.emissions - a.emissions)
            .slice(0, 5);

        const reportData = {
            organization: {
                name: organization.name,
                country: organization.country,
                industryType: organization.industryType,
            },
            reportingYear,
            generatedAt: new Date().toISOString(),
            totalEmissions,
            scope1Emissions: byScope.scope1,
            scope2Emissions: byScope.scope2,
            scope3Emissions: byScope.scope3,
            activityCount: activities.length,
            scope1Percentage: totalEmissions > 0 ? (byScope.scope1 / totalEmissions) * 100 : 0,
            scope2Percentage: totalEmissions > 0 ? (byScope.scope2 / totalEmissions) * 100 : 0,
            scope3Percentage: totalEmissions > 0 ? (byScope.scope3 / totalEmissions) * 100 : 0,
            scope3Categories,
            topActivities,
            countryContext: {
                benchmark: organization.country === "US" ? "EPA Manufacturing Benchmark" : "Malaysia Grid Average",
                unit: organization.country === "US" ? "lb CO2e/unit" : "kg CO2e/kWh",
                threshold: organization.country === "US"
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
                        totalEmissions,
                        activityCount: activities.length,
                    },
                },
            });

            return NextResponse.json({
                id: report.id,
                organizationId: report.organizationId,
                reportingYear: report.reportingYear,
                reportType: report.reportType,
                status: report.status,
                generatedAt: report.generatedAt?.toISOString(),
                createdAt: report.createdAt.toISOString(),
                pdfBase64,
                summary: {
                    totalEmissions,
                    byScope,
                    byCategory,
                    activityCount: activities.length,
                },
            }, { status: 201 });
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
                    totalEmissions,
                    activityCount: activities.length,
                },
            },
        });

        return NextResponse.json({
            id: report.id,
            organizationId: report.organizationId,
            reportingYear: report.reportingYear,
            reportType: report.reportType,
            status: report.status,
            generatedAt: report.generatedAt?.toISOString(),
            createdAt: report.createdAt.toISOString(),
            summary: {
                totalEmissions,
                byScope,
                byCategory,
                activityCount: activities.length,
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Report generate error:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}