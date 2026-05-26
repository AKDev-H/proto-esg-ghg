import { SUPPLIER_CATEGORIES } from "@/lib/constants";
import type { SupplierCategory } from "@/modules/suppliers/types";

export const PRIORITY_SUPPLIER_CATEGORIES: SupplierCategory[] = [
    "stainless_steel",
    "aluminum",
    "chemicals",
    "logistics",
];

export function getCategoryLabel(
    value: SupplierCategory,
    otherCategoryType?: string | null,
): string {
    if (value === "other" && otherCategoryType?.trim()) {
        return otherCategoryType.trim();
    }
    return SUPPLIER_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getCategoriesLabels(
    categories: SupplierCategory[],
    otherCategoryType?: string | null,
): string {
    if (categories.length === 0) return "—";
    return categories
        .map((category) => getCategoryLabel(category, otherCategoryType))
        .join(", ");
}

export function supplierHasCategory(
    categories: SupplierCategory[],
    category: SupplierCategory,
): boolean {
    return categories.includes(category);
}

export function isPrioritySupplier(categories: SupplierCategory[]): boolean {
    return categories.some((c) => PRIORITY_SUPPLIER_CATEGORIES.includes(c));
}

export function countSuppliersInCategory(
    suppliers: { categories: SupplierCategory[] }[],
    category: SupplierCategory,
): number {
    return suppliers.filter((s) => supplierHasCategory(s.categories, category))
        .length;
}

export function sortSuppliersByPriority<
    T extends { categories: SupplierCategory[]; name: string },
>(suppliers: T[]): T[] {
    return [...suppliers].sort((a, b) => {
        const aPriority = isPrioritySupplier(a.categories);
        const bPriority = isPrioritySupplier(b.categories);
        if (aPriority !== bPriority) return aPriority ? -1 : 1;
        if (aPriority && bPriority) {
            const aCount = a.categories.filter((c) =>
                PRIORITY_SUPPLIER_CATEGORIES.includes(c),
            ).length;
            const bCount = b.categories.filter((c) =>
                PRIORITY_SUPPLIER_CATEGORIES.includes(c),
            ).length;
            if (aCount !== bCount) return bCount - aCount;
        }
        return a.name.localeCompare(b.name);
    });
}
