import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageSuppliers } from "@/lib/permissions";
import { createSupplierSchema } from "@/modules/suppliers/schemas";
import { listSuppliersWithInvites } from "@/modules/suppliers/services/supplier-questionnaires";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const suppliers = await listSuppliersWithInvites(
            session.user.organizationId,
        );

        return NextResponse.json({ suppliers });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch suppliers" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!canManageSuppliers(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const data = createSupplierSchema.parse(body);

        const supplier = await prisma.supplier.create({
            data: {
                organizationId: session.user.organizationId,
                name: data.name,
                country: data.country || null,
                contactEmail: data.contactEmail || null,
                categories: data.categories ?? [],
                otherCategoryType: data.categories.includes("other")
                    ? data.otherCategoryType?.trim() || null
                    : null,
            },
        });

        await prisma.auditLog.create({
            data: {
                organizationId: session.user.organizationId,
                userId: session.user.id,
                action: "create",
                entityType: "Supplier",
                entityId: supplier.id,
                newValue: {
                    name: supplier.name,
                    categories: supplier.categories,
                    otherCategoryType: supplier.otherCategoryType,
                },
            },
        });

        return NextResponse.json({ supplier }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0]?.message ?? "Invalid supplier data" },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { error: "Failed to create supplier" },
            { status: 500 },
        );
    }
}
