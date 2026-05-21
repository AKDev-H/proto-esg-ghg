"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Scope3Tabs,
    SCOPE3_TAB_CATEGORIES,
    type Scope3TabKey,
} from "./scope3-tabs";
import { SCOPE3_CATEGORY_SHORT_LABELS } from "@/types";
import {
    PurchasedGoodsForm,
    CapitalGoodsForm,
    FuelEnergyForm,
    TransportForm,
    WasteForm,
    BusinessTravelForm,
    EmployeeCommutingForm,
    UpstreamLeasedForm,
    ProductProcessingForm,
    ProductUseForm,
    EndOfLifeForm,
    DownstreamLeasedForm,
} from "./forms";
import type { EmissionFactorOption } from "@/modules/activities/types";

interface Scope3FormsProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

const FORM_BY_TAB: Record<
    Scope3TabKey,
    React.ComponentType<{
        factors: EmissionFactorOption[];
        onSuccess?: () => void;
        category?: "cat4_upstream_transport" | "cat9_downstream_transport";
    }>
> = {
    purchased: PurchasedGoodsForm,
    capital: CapitalGoodsForm,
    fuel: FuelEnergyForm,
    upstream: TransportForm,
    waste: WasteForm,
    travel: BusinessTravelForm,
    commute: EmployeeCommutingForm,
    upstreamLeased: UpstreamLeasedForm,
    downstream: TransportForm,
    processing: ProductProcessingForm,
    productUse: ProductUseForm,
    endOfLife: EndOfLifeForm,
    downstreamLeased: DownstreamLeasedForm,
};

export function Scope3Forms({ factors, onSuccess }: Scope3FormsProps) {
    const [activeTab, setActiveTab] = useState<Scope3TabKey>("purchased");

    const getFactorsForCategory = (scope3Category: string) => {
        const exactMatch = factors.filter(
            (f) => f.scope3Category === scope3Category,
        );
        if (exactMatch.length > 0) return exactMatch;
        return factors.filter((f) => !f.scope3Category);
    };

    const category = SCOPE3_TAB_CATEGORIES[activeTab];
    const FormComponent = FORM_BY_TAB[activeTab];
    const categoryFactors = getFactorsForCategory(category);

    return (
        <div className="space-y-4">
            <Scope3Tabs activeTab={activeTab} onTabChange={setActiveTab} />

            <Card>
                <CardHeader>
                    <CardTitle>{SCOPE3_CATEGORY_SHORT_LABELS[category]}</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormComponent
                        factors={categoryFactors}
                        onSuccess={onSuccess}
                        {...(activeTab === "upstream"
                            ? { category: "cat4_upstream_transport" }
                            : activeTab === "downstream"
                              ? { category: "cat9_downstream_transport" }
                              : {})}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
