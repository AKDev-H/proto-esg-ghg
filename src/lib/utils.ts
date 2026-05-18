import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals = 2): string {
    return num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatKgCO2(kg: number): string {
    if (kg >= 1000000) {
        return `${formatNumber(kg / 1000000)} tCO2e`;
    }
    return `${formatNumber(kg)} kgCO2e`;
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function generateYearOptions(
    startYear = 2020,
): { value: number; label: string }[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= startYear; year--) {
        years.push({ value: year, label: String(year) });
    }
    return years;
}
