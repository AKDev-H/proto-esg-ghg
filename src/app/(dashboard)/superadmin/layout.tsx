"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Shield, Building2, Users, LayoutDashboard, LogOut, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

const superAdminNav = [
    { name: "Organizations", href: "/superadmin/organizations", icon: Building2 },
    { name: "Users", href: "/superadmin/users", icon: Users },
];

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        async function checkRole() {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.role !== "super_admin") {
                        window.location.href = "/dashboard";
                    } else {
                        setAuthorized(true);
                    }
                } else {
                    window.location.href = "/login";
                }
            } catch {
                window.location.href = "/login";
            }
        }
        checkRole();
    }, []);

    if (!authorized) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link href="/superadmin/organizations" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Shield className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-xl hidden sm:inline">
                                Super Admin
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-1">
                            {superAdminNav.map((item) => {
                                const Icon = item.icon;
                                const isActive = router === item.href || router.startsWith(item.href + "/");
                                return (
                                    <Link key={item.name} href={item.href}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            size="sm"
                                            className={cn("gap-2", isActive && "bg-primary/10")}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {item.name}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button variant="ghost" size="icon">
                                    <Building2 className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px]">
                                <div className="flex flex-col gap-4 mt-8">
                                    {superAdminNav.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = router === item.href || router.startsWith(item.href + "/");
                                        return (
                                            <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}>
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                        isActive
                                                            ? "bg-primary/10 text-primary"
                                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                                    )}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    {item.name}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    <div className="border-t my-2" />
                                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                            <LayoutDashboard className="w-5 h-5" />
                                            Back to Dashboard
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign out
                                    </button>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                <span className="hidden md:inline">Dashboard</span>
                            </Button>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Settings className="w-4 h-4 mr-2" />
                                    <span className="hidden md:inline">Settings</span>
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="container px-4 py-6">{children}</main>
        </div>
    );
}