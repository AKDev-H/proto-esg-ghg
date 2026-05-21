"use client";

import { SCOPE3_CATEGORY_SHORT_LABELS, SCOPE3_CATEGORY_IMPORTANCE, type Scope3Category } from "@/types";

const TAB_KEYS = [
    "purchased",
    "capital",
    "fuel",
    "upstream",
    "waste",
    "travel",
    "commute",
    "upstreamLeased",
    "downstream",
    "processing",
    "productUse",
    "endOfLife",
    "downstreamLeased",
] as const;

export type Scope3TabKey = (typeof TAB_KEYS)[number];

export const SCOPE3_TAB_CATEGORIES: Record<Scope3TabKey, Scope3Category> = {
    purchased: "cat1_purchased_goods",
    capital: "cat2_capital_goods",
    fuel: "cat3_fuel_energy",
    upstream: "cat4_upstream_transport",
    waste: "cat5_waste",
    travel: "cat6_business_travel",
    commute: "cat7_employee_commuting",
    upstreamLeased: "cat8_upstream_leased",
    downstream: "cat9_downstream_transport",
    processing: "cat10_product_processing",
    productUse: "cat11_product_use",
    endOfLife: "cat12_end_of_life",
    downstreamLeased: "cat13_downstream_leased",
};

interface Scope3TabsProps {
    activeTab: Scope3TabKey;
    onTabChange: (tab: Scope3TabKey) => void;
}

export function Scope3Tabs({ activeTab, onTabChange }: Scope3TabsProps) {
    const categories = Object.values(SCOPE3_TAB_CATEGORIES);

    const importanceColors = {
        high: "text-orange-600",
        medium: "text-yellow-600",
        low: "text-green-600",
        na: "text-gray-400",
    };

    return (
        <div className="flex overflow-x-auto border-b -mx-4 px-4 gap-1 scrollbar-none">
            {categories.map((cat, idx) => (
                <button
                    key={cat}
                    type="button"
                    onClick={() => onTabChange(TAB_KEYS[idx])}
                    className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === TAB_KEYS[idx] ? "border-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                    <span
                        className={
                            importanceColors[SCOPE3_CATEGORY_IMPORTANCE[cat]]
                        }
                    >
                        ●
                    </span>{" "}
                    {SCOPE3_CATEGORY_SHORT_LABELS[cat]}
                </button>
            ))}
        </div>
    );
}

export { SCOPE3_CATEGORY_SHORT_LABELS as CATEGORY_LABELS };
