import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/modules/auth/schemas";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 400 },
            );
        }

        const passwordHash = await hashPassword(validatedData.password);

        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                passwordHash,
                name: validatedData.name,
                role: validatedData.organizationName ? "org_admin" : "viewer",
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation failed", details: error },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
