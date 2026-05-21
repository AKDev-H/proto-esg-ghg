"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Zap,
    Globe,
    FileText,
    Settings,
    Users,
    LogOut,
    ChevronDown,
    Menu,
    Gauge,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canManageUsers } from "@/lib/permissions";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PageContainer } from "@/components/layout/page-container";
import type { UserRole } from "@/types";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Scope 1", href: "/activities/scope1", icon: Gauge },
    { name: "Scope 2", href: "/activities/scope2", icon: Zap },
    { name: "Scope 3", href: "/activities/scope3", icon: Globe },
    { name: "Factors", href: "/factors", icon: FileText },
    { name: "Reports", href: "/reports", icon: FileText },
];

const settingsNav = [
    { name: "Organization", href: "/settings/organization", icon: Building2, visible: () => true },
    { name: "Users", href: "/settings/users", icon: Users, visible: canManageUsers },
];

interface DashboardShellProps {
    userRole: UserRole;
    children: React.ReactNode;
}

export function DashboardShell({ userRole, children }: DashboardShellProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isSuperAdmin = userRole === "super_admin";

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <PageContainer className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Gauge className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-xl hidden sm:inline">
                                ESG Carbon
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-1">
                            {!isSuperAdmin &&
                                navigation.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                        pathname === item.href ||
                                        pathname.startsWith(item.href + "/");
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
                            {isSuperAdmin && (
                                <Link href="/superadmin/organizations">
                                    <Button
                                        variant={
                                            pathname.startsWith("/superadmin")
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        size="sm"
                                        className={cn(
                                            "gap-2",
                                            pathname.startsWith("/superadmin") && "bg-primary/10",
                                        )}
                                    >
                                        <Shield className="w-4 h-4" />
                                        Super Admin
                                    </Button>
                                </Link>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px]">
                                <div className="flex flex-col gap-4 mt-8">
                                    {!isSuperAdmin &&
                                        navigation.map((item) => {
                                            const Icon = item.icon;
                                            const isActive =
                                                pathname === item.href ||
                                                pathname.startsWith(item.href + "/");
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                >
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
                                    {isSuperAdmin && (
                                        <Link
                                            href="/superadmin/organizations"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    pathname.startsWith("/superadmin")
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                                )}
                                            >
                                                <Shield className="w-5 h-5" />
                                                Super Admin
                                            </div>
                                        </Link>
                                    )}
                                    {!isSuperAdmin && (
                                        <>
                                            <div className="border-t my-2" />
                                            {settingsNav
                                                .filter((item) => item.visible(userRole))
                                                .map((item) => {
                                                    const Icon = item.icon;
                                                    const isActive = pathname === item.href;
                                                    return (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            onClick={() => setMobileOpen(false)}
                                                        >
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
                                        </>
                                    )}
                                    <div className="border-t my-2" />
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

                        {!isSuperAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Settings className="w-4 h-4 mr-2" />
                                        <span className="hidden md:inline">Settings</span>
                                        <ChevronDown className="w-4 h-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {settingsNav
                                        .filter((item) => item.visible(userRole))
                                        .map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <DropdownMenuItem key={item.name} asChild>
                                                    <Link href={item.href} className="gap-2">
                                                        <Icon className="w-4 h-4" />
                                                        {item.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </PageContainer>
            </header>

            <PageContainer as="main" className="py-8 md:py-10">
                {children}
            </PageContainer>
        </div>
    );
}
