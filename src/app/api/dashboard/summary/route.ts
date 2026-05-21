import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const year = searchParams.get("year");
        const organizationId = session.user.organizationId;
        const isSuperAdmin = session.user.role === "super_admin";

        if (isSuperAdmin) {
            return NextResponse.json({ total: 0, byScope: {}, byCategory: {} });
        }

        if (!year) {
            return NextResponse.json(
                { error: "Year parameter required" },
                { status: 400 },
            );
        }

        const reportingYear = await prisma.reportingYear.findFirst({
            where: { year: parseInt(year), organizationId: organizationId! },
        });

        if (!reportingYear) {
            return NextResponse.json({ total: 0, byScope: {}, byCategory: {} });
        }

        const activities = await prisma.activityData.findMany({
            where: {
                reportingYearId: reportingYear.id,
                organizationId: organizationId!,
            },
            select: {
                scope: true,
                scope3Category: true,
                calculatedEmissions: true,
            },
        });

        const totalEmissions = activities.reduce(
            (sum, a) => sum + (a.calculatedEmissions ?? 0),
            0,
        );

        const byScope: Record<string, number> = {};
        for (const activity of activities) {
            byScope[activity.scope] =
                (byScope[activity.scope] || 0) +
                (activity.calculatedEmissions ?? 0);
        }

        const byCategory: Record<string, number> = {};
        for (const activity of activities) {
            if (activity.scope === "scope3" && activity.scope3Category) {
                byCategory[activity.scope3Category] =
                    (byCategory[activity.scope3Category] || 0) +
                    (activity.calculatedEmissions ?? 0);
            }
        }

        return NextResponse.json({
            total: totalEmissions,
            totalTonCO2e: Math.round((totalEmissions / 1000) * 100) / 100,
            byScope,
            byCategory,
            activityCount: activities.length,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
