import { DashboardOverview } from "@/modules/dashboard/components"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Truck,
    Zap,
    Globe,
    FileText,
    FolderOpen,
    Settings,
    Scale,
    Plus,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/activities/scope1">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                    </Link>
                </Button>
            </div>

            <DashboardOverview />

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
        </div>
    )
}