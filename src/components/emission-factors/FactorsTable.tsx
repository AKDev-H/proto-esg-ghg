"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FactorsCard } from "./FactorsCard"
import { FactorsForm } from "./FactorsForm"
import { SCOPE3_CATEGORY_LABELS } from "@/lib/constants"
import type { EmissionFactor } from "@/modules/emission-factors/types"

interface FactorsTableProps {
    factors: EmissionFactor[]
}

const ITEMS_PER_PAGE = 10

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

export function FactorsTable({ factors: initialFactors }: FactorsTableProps) {
    const router = useRouter()
    const [factors] = useState(initialFactors)
    const [key, setKey] = useState(0)
    const [filterCategory, setFilterCategory] = useState<string>("all")
    const [editingFactor, setEditingFactor] = useState<EmissionFactor | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const filteredFactors =
        filterCategory === "all"
            ? factors
            : factors.filter((f) => f.category === filterCategory)

    const totalPages = Math.ceil(filteredFactors.length / ITEMS_PER_PAGE)
    const paginatedFactors = filteredFactors.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const handleEdit = (factor: EmissionFactor) => {
        setEditingFactor(factor)
    }

    const handleCancelEdit = () => {
        setEditingFactor(null)
    }

    const handleSuccess = async () => {
        setEditingFactor(null)
        router.refresh()
        setKey((k) => k + 1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {["all", "scope1", "scope2", "scope3"].map((cat) => (
                    <Button
                        key={cat}
                        variant={filterCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setFilterCategory(cat); setCurrentPage(1) }}
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
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedFactors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No factors found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedFactors.map((factor) => (
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
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(factor)}>
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFactors.length)} of {filteredFactors.length} results
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <FactorsCard factors={filteredFactors} onEdit={handleEdit} />
            <FactorsForm editFactor={editingFactor} onCancelEdit={handleCancelEdit} onSuccess={handleSuccess} />
        </div>
    )
}