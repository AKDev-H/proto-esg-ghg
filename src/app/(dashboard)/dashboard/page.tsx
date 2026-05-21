import { DashboardOverview } from "@/modules/dashboard/components"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
    Truck,
    Zap,
    Globe,
    FileText,
    FolderOpen,
    Settings,
    Scale,
    Plus,
    Building2,
    Users,
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
    const session = await auth()
    const isSuperAdmin = session?.user?.role === "super_admin"

    let stats = null
    if (isSuperAdmin) {
        const [orgCount, userCount, reportCount] = await Promise.all([
            prisma.organization.count(),
            prisma.user.count({ where: { organizationId: { not: null } } }),
            prisma.report.count(),
        ])
        stats = { orgCount, userCount, reportCount }
    }

    if (isSuperAdmin) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">Super Admin Dashboard</h1>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/superadmin/organizations">
                            <Building2 className="w-4 h-4 mr-2" />
                            Manage Organizations
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-3">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Organizations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-bold">{stats?.orgCount ?? 0}</div>
                            <p className="text-sm text-muted-foreground mt-1">Total organizations</p>
                            <Link href="/superadmin/organizations" className="mt-4 block">
                                <Button variant="outline" className="w-full">
                                    View All
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-3">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-bold">{stats?.userCount ?? 0}</div>
                            <p className="text-sm text-muted-foreground mt-1">Total users across orgs</p>
                            <Link href="/superadmin/users" className="mt-4 block">
                                <Button variant="outline" className="w-full">
                                    View All
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden sm:col-span-2 lg:col-span-1">
                        <CardHeader className="bg-primary/5 pb-3">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-bold">{stats?.reportCount ?? 0}</div>
                            <p className="text-sm text-muted-foreground mt-1">Total ESG reports generated</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/superadmin/organizations">
                            <Button variant="outline" className="w-full justify-start">
                                <Building2 className="w-4 h-4 mr-2" />
                                Organizations Management
                            </Button>
                        </Link>
                        <Link href="/superadmin/users">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="w-4 h-4 mr-2" />
                                Users Management
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Emissions overview and quick actions
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto shrink-0">
                    <Link href="/activities/scope1">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                    </Link>
                </Button>
            </div>

            <DashboardOverview />

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-3">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            <Truck className="w-5 h-5 text-primary" />
                            Add Scope Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <Link href="/activities/scope1" className="block">
                            <Button variant="outline" className="w-full justify-start group">
                                <Truck className="w-4 h-4 mr-3 group-hover:text-primary" />
                                Scope 1 - Direct
                                <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary">Vehicles, Fuel, AC</span>
                            </Button>
                        </Link>
                        <Link href="/activities/scope2" className="block">
                            <Button variant="outline" className="w-full justify-start group">
                                <Zap className="w-4 h-4 mr-3 group-hover:text-primary" />
                                Scope 2 - Energy
                                <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary">Electricity</span>
                            </Button>
                        </Link>
                        <Link href="/activities/scope3" className="block">
                            <Button variant="outline" className="w-full justify-start group">
                                <Globe className="w-4 h-4 mr-3 group-hover:text-primary" />
                                Scope 3 - Value Chain
                                <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary">Supply Chain</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-3">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <Link href="/reports" className="block">
                            <Button variant="outline" className="w-full justify-start group">
                                <FolderOpen className="w-4 h-4 mr-3 group-hover:text-primary" />
                                View Reports
                                <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary">History</span>
                            </Button>
                        </Link>
                        <Link href="/reports" className="block">
                            <Button variant="default" className="w-full justify-start group">
                                <FileText className="w-4 h-4 mr-3" />
                                Generate ESG Report
                                <span className="ml-auto text-xs opacity-80">New</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden sm:col-span-2 lg:col-span-1">
                    <CardHeader className="bg-primary/5 pb-3">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <Link href="/settings/organization" className="block">
                            <Button variant="outline" className="w-full justify-start group">
                                <Settings className="w-4 h-4 mr-3 group-hover:text-primary" />
                                Organization
                                <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary">Profile</span>
                            </Button>
                        </Link>
                        <Link href="/factors" className="block">
                            <Button variant="outline" className="w-full justify-start group">
                                <Scale className="w-4 h-4 mr-3 group-hover:text-primary" />
                                Emission Factors
                                <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary">Manage</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                </div>
            </section>
        </div>
    )
}