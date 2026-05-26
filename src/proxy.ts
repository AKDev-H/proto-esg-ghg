import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    const isAuthPage = pathname.startsWith("/login");
    const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/activities") ||
        pathname.startsWith("/suppliers") ||
        pathname.startsWith("/factors") ||
        pathname.startsWith("/reports") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/audit") ||
        pathname.startsWith("/superadmin");

    if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/activities/:path*",
        "/suppliers/:path*",
        "/factors/:path*",
        "/reports/:path*",
        "/settings/:path*",
        "/audit/:path*",
        "/superadmin/:path*",
        "/login",
    ],
};
