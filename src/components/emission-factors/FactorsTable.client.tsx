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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    sources: string[]
    units: string[]
}

export function FactorsTableClient({ 
    factors, 
    pagination, 
    canManageFactors = false,
    sources = [],
    units = []
}: FactorsTableClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [editingFactor, setEditingFactor] = useState<EmissionFactor | null>(null)

    const filterCategory = searchParams.get("category") || "all"
    const filterSource = searchParams.get("source") || "all"
    const filterCountry = searchParams.get("country") || "all"
    const filterScope3Category = searchParams.get("scope3Category") || "all"
    const filterUnit = searchParams.get("unit") || "all"

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
            if (category === "scope1" || category === "scope2") {
                params.delete("scope3Category")
            }
        }
        params.set("page", "1")
        router.push(`/factors?${params.toString()}`)
    }

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        params.set("page", "1")
        router.push(`/factors?${params.toString()}`)
    }

    const handleResetFilters = () => {
        const params = new URLSearchParams()
        const currentCategory = searchParams.get("category")
        if (currentCategory && currentCategory !== "all") {
            params.set("category", currentCategory)
        }
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

    const isAnyFilterActive = filterSource !== "all" || filterCountry !== "all" || filterScope3Category !== "all" || filterUnit !== "all"

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
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
                    {canManageFactors && (
                        <FactorsForm editFactor={editingFactor} onCancelEdit={handleCancelEdit} onSuccess={handleSuccess} />
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Country</label>
                        <Select value={filterCountry} onValueChange={(val) => handleFilterChange("country", val)}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All Countries" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="MY">Malaysia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Source</label>
                        <Select value={filterSource} onValueChange={(val) => handleFilterChange("source", val)}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All Sources" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                {sources.map((src) => (
                                    <SelectItem key={src} value={src}>{src}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Scope 3 Category</label>
                        <Select 
                            value={filterScope3Category} 
                            onValueChange={(val) => handleFilterChange("scope3Category", val)}
                            disabled={filterCategory === "scope1" || filterCategory === "scope2"}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {Object.entries(SCOPE3_CATEGORY_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label.replace(/^\d+\.\s*/, "")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Unit</label>
                        <Select value={filterUnit} onValueChange={(val) => handleFilterChange("unit", val)}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All Units" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Units</SelectItem>
                                {units.map((unit) => (
                                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isAnyFilterActive && (
                    <div className="flex justify-end pt-2">
                        <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-muted-foreground h-8 text-xs hover:text-foreground">
                            Clear Filters
                        </Button>
                    </div>
                )}
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
        </div>
    )
}
