"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { TableEmptyState } from "@/components/ui/empty-state"
import { FactorsCard } from "./FactorsCard"
import { FactorsForm } from "./FactorsForm"
import { SCOPE3_CATEGORY_LABELS } from "@/lib/constants"
import type { EmissionFactor } from "@/modules/emission-factors/types"

function formatCategory(category: string, scope3Category?: string): string {
    if (category === "scope3" && scope3Category) {
        const label = SCOPE3_CATEGORY_LABELS[scope3Category]
        if (label) {
            return label.replace(/^\d+\.\s*/, "")
        }
        return scope3Category.replace(/_/g, " ").replace(/cat(\d+)/, "Category $1")
    }
    return category.charAt(0).toUpperCase() + category.slice(1)
}

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface FactorsTableClientProps {
    factors: EmissionFactor[]
    pagination: PaginationInfo
    canManageFactors?: boolean
}

export function FactorsTableClient({ factors, pagination, canManageFactors = false }: FactorsTableClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [editingFactor, setEditingFactor] = useState<EmissionFactor | null>(null)

    const filterCategory = searchParams.get("category") || "all"
    const columnCount = canManageFactors ? 8 : 7

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/factors?${params.toString()}`)
    }

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (category === "all") {
            params.delete("category")
        } else {
            params.set("category", category)
        }
        params.set("page", "1")
        router.push(`/factors?${params.toString()}`)
    }

    const handleEdit = (factor: EmissionFactor) => {
        setEditingFactor(factor)
    }

    const handleCancelEdit = () => {
        setEditingFactor(null)
    }

    const handleSuccess = () => {
        setEditingFactor(null)
        router.refresh()
    }

    const paginationInfo = pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {["all", "scope1", "scope2", "scope3"].map((cat) => (
                    <Button
                        key={cat}
                        variant={filterCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryChange(cat)}
                    >
                        {cat === "all" ? "All" : formatCategory(cat)}
                    </Button>
                ))}
            </div>

            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Activity Type</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Factor Value</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Valid From</TableHead>
                            {canManageFactors && <TableHead>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {factors.length === 0 ? (
                            <TableEmptyState 
                                colSpan={columnCount}
                                title="No emission factors found"
                                description="Add or import emission factors to get started."
                            />
                        ) : (
                            factors.map((factor) => (
                                <TableRow key={factor.id}>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted">
                                            {formatCategory(factor.category, factor.scope3Category)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">{factor.activityType}</TableCell>
                                    <TableCell>{factor.activityUnit}</TableCell>
                                    <TableCell>{factor.factorValue}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted">
                                            {factor.source}
                                        </span>
                                    </TableCell>
                                    <TableCell>{factor.country === "US" ? "United States" : factor.country === "MY" ? "Malaysia" : factor.country}</TableCell>
                                    <TableCell>{new Date(factor.validFrom).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}</TableCell>
                                    {canManageFactors && (
                                        <TableCell>
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(factor)}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {paginationInfo.totalPages > 1 && (
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1} to {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of {paginationInfo.total} results
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(paginationInfo.page - 1)}
                                disabled={paginationInfo.page === 1}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === paginationInfo.page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(paginationInfo.page + 1)}
                                disabled={paginationInfo.page === paginationInfo.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <FactorsCard factors={factors} onEdit={canManageFactors ? handleEdit : undefined} />
            {canManageFactors && (
                <FactorsForm editFactor={editingFactor} onCancelEdit={handleCancelEdit} onSuccess={handleSuccess} />
            )}
        </div>
    )
}
