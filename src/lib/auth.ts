import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { SessionUser, UserRole } from "@/types";

declare module "next-auth" {
    interface Session {
        user: SessionUser;
    }
    interface User {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        organizationId: string | null;
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        organizationId: string | null;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    include: { organization: true },
                });

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash,
                );

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as UserRole,
                    organizationId: user.organizationId,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.organizationId = user.organizationId;
            }
            return token;
        },
        async session({ session, token }) {
            const newUser: SessionUser = {
                id: token.id as string,
                email: token.email as string,
                name: token.name as string,
                role: token.role as UserRole,
                organizationId: token.organizationId as string | null,
            }
            Object.assign(session.user, newUser)
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
});

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(
    password: string,
    hashedPassword: string,
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}
