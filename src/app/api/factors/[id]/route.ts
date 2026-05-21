import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFactors } from "@/lib/permissions";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const factor = await prisma.emissionFactor.findUnique({
            where: { id },
            include: { sourceRef: true },
        });

        if (!factor) {
            return NextResponse.json(
                { error: "Emission factor not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(factor);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canManageFactors(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const factor = await prisma.emissionFactor.update({
            where: { id },
            data: {
                category: body.category,
                activityType: body.activityType,
                activityUnit: body.activityUnit,
                factorValue: body.factorValue,
                source: body.source,
                country: body.country,
                validFrom: body.validFrom
                    ? new Date(body.validFrom)
                    : undefined,
                validTo: body.validTo ? new Date(body.validTo) : undefined,
                scope3Category: body.scope3Category || null,
            },
        });

        return NextResponse.json(factor);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canManageFactors(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;

        await prisma.emissionFactor.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
