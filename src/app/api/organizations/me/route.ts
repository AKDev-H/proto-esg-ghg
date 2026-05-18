import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        const organization = await prisma.organization.findUnique({
            where: { id: session.user.organizationId },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const settings = organization.settings as Record<string, string> | null;

        return NextResponse.json({
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            country: organization.country,
            currency: organization.currency,
            industryType: organization.industryType,
            settings: settings ?? undefined,
            users: organization.users.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                createdAt: u.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("Organization me error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}