import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

        const organization = await prisma.organization.findUnique({
            where: { id },
            include: {
                facilities: true,
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        createdAt: true,
                    },
                },
                reportingYears: {
                    orderBy: { year: "desc" },
                },
            },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(organization);
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

        if (!["super_admin", "org_admin"].includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const organization = await prisma.organization.update({
            where: { id },
            data: {
                name: body.name,
                settings: body.settings,
            },
        });

        await prisma.auditLog.create({
            data: {
                organizationId: id,
                userId: session.user.id,
                action: "update",
                entityType: "Organization",
                entityId: id,
                oldValue: { name: organization.name },
                newValue: { name: body.name },
            },
        });

        return NextResponse.json(organization);
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

        if (session.user.role !== "super_admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;

        await prisma.organization.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
