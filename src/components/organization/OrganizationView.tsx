"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Building2, Users } from "lucide-react"
import type { OrganizationUser } from "@/modules/organizations/types"

interface OrganizationViewProps {
    organization: {
        id: string
        name: string
        slug: string
        country: string
        currency: string
        industryType: string
        settings?: Record<string, string>
        users?: OrganizationUser[]
    }
    onUpdate?: () => void
}

export function OrganizationView({ organization, onUpdate }: OrganizationViewProps) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Organization Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Organization Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Organization Name</Label>
                                <p className="font-medium">{organization.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Country</Label>
                                <p className="font-medium">{organization.country}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Currency</Label>
                                <p className="font-medium">{organization.currency}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Industry Type</Label>
                                <p className="font-medium capitalize">{organization.industryType.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">Distance Unit</Label>
                            <p className="font-medium">{organization.settings?.distanceUnit || 'km'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Weight Unit</Label>
                            <p className="font-medium">{organization.settings?.weightUnit || 'kg'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Fuel Unit</Label>
                            <p className="font-medium">{organization.settings?.fuelUnit || 'liter'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Factor Source</Label>
                            <p className="font-medium">{organization.settings?.factorSource || 'EPA'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Team Members ({organization.users?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {organization.users?.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <Badge variant="secondary">{user.role.replace('_', ' ')}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}