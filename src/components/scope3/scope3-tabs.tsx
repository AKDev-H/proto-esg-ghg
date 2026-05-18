"use client";

import { SCOPE3_CATEGORY_IMPORTANCE, type Scope3Category } from "@/types";

const CATEGORY_LABELS: Record<Scope3Category, string> = {
    cat1_purchased_goods: "Purchased Goods",
    cat2_capital_goods: "Capital Goods",
    cat3_fuel_energy: "Fuel & Energy",
    cat4_upstream_transport: "Upstream Transport",
    cat5_waste: "Waste",
    cat6_business_travel: "Business Travel",
    cat7_employee_commuting: "Employee Commuting",
    cat8_upstream_leased: "Upstream Leased",
    cat9_downstream_transport: "Downstream Transport",
    cat10_product_processing: "Product Processing",
    cat11_product_use: "Product Use",
    cat12_end_of_life: "End of Life",
    cat13_downstream_leased: "Downstream Leased",
};

interface Scope3TabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Scope3Tabs({ activeTab, onTabChange }: Scope3TabsProps) {
    const categories = Object.keys(CATEGORY_LABELS) as Scope3Category[];
    const tabKeys = [
        "purchased",
        "capital",
        "fuel",
        "upstream",
        "waste",
        "travel",
        "commute",
        "leased",
        "downstream",
        "processing",
        "product",
        "endoflife",
        "downstreamLeased",
    ];

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
                    onClick={() => onTabChange(tabKeys[idx])}
                    className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tabKeys[idx] ? "border-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                    <span
                        className={
                            importanceColors[SCOPE3_CATEGORY_IMPORTANCE[cat]]
                        }
                    >
                        ●
                    </span>{" "}
                    {CATEGORY_LABELS[cat]}
                </button>
            ))}
        </div>
    );
}

export { CATEGORY_LABELS };
