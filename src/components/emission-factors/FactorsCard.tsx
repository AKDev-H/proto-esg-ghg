"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmissionFactor } from "@/modules/emission-factors/types"

interface FactorsCardProps {
    factors: EmissionFactor[]
    onEdit?: (factor: EmissionFactor) => void
}

export function FactorsCard({ factors, onEdit }: FactorsCardProps) {
    if (factors.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No factors found
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4 md:hidden">
            {factors.map((factor) => (
                <Card key={factor.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{factor.activityType}</CardTitle>
                            <Badge variant="secondary">{factor.source}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Unit:</span>
                                <span className="ml-2">{factor.activityUnit}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Factor:</span>
                                <span className="ml-2 font-medium">{factor.factorValue}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Category:</span>
                                <span className="ml-2">{factor.category}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Country:</span>
                                <span className="ml-2">{factor.country}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-muted-foreground">Valid From:</span>
                                <span className="ml-2">{new Date(factor.validFrom).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}</span>
                            </div>
                        </div>
                        {onEdit && (
                            <div className="mt-3">
                                <Button size="sm" variant="outline" onClick={() => onEdit(factor)}>
                                    Edit
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}