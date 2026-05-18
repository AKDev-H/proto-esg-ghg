"use client"

import { FileX } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"

interface EmptyStateProps {
    title?: string
    description?: string
    icon?: React.ReactNode
    className?: string
}

export function EmptyState({
    title = "No data found",
    description = "There are no items to display at this time.",
    icon,
    className,
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {icon || <FileX className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
        </div>
    )
}

interface TableEmptyStateProps {
    colSpan?: number
    title?: string
    description?: string
}

export function TableEmptyState({
    colSpan = 5,
    title = "No data found",
    description = "There are no items to display at this time.",
}: TableEmptyStateProps) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="text-center py-8">
                <EmptyState title={title} description={description} />
            </TableCell>
        </TableRow>
    )
}