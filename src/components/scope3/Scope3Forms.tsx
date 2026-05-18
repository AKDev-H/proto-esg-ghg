"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scope3Tabs, CATEGORY_LABELS } from "./scope3-tabs";
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

interface Scope3FormsProps {
    factors: Array<{
        id: string;
        activityType: string;
        factorValue: number;
        activityUnit: string;
        scope3Category: string | null;
    }>;
    onSuccess?: () => void;
}

export function Scope3Forms({ factors, onSuccess }: Scope3FormsProps) {
    const [activeTab, setActiveTab] = useState<string>("purchased");

    const getFactorsForCategory = (scope3Category: string) => {
        const exactMatch = factors.filter(
            (f) => f.scope3Category === scope3Category,
        );
        if (exactMatch.length > 0) {
            return exactMatch;
        }
        const fallback = factors.filter((f) => !f.scope3Category);
        return fallback;
    };

    return (
        <div className="space-y-4">
            <Scope3Tabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "purchased" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat1_purchased_goods}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PurchasedGoodsForm
                            factors={getFactorsForCategory(
                                "cat1_purchased_goods",
                            )}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "capital" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat2_capital_goods}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CapitalGoodsForm
                            factors={getFactorsForCategory(
                                "cat2_capital_goods",
                            )}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "fuel" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat3_fuel_energy}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FuelEnergyForm
                            factors={getFactorsForCategory("cat3_fuel_energy")}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "upstream" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat4_upstream_transport}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TransportForm
                            factors={getFactorsForCategory(
                                "cat4_upstream_transport",
                            )}
                            category="cat4_upstream_transport"
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "waste" && (
                <Card>
                    <CardHeader>
                        <CardTitle>{CATEGORY_LABELS.cat5_waste}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <WasteForm
                            factors={getFactorsForCategory("cat5_waste")}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "travel" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat6_business_travel}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BusinessTravelForm
                            factors={getFactorsForCategory(
                                "cat6_business_travel",
                            )}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "commute" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat7_employee_commuting}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EmployeeCommutingForm
                            factors={getFactorsForCategory(
                                "cat7_employee_commuting",
                            )}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "upstreamLeased" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat8_upstream_leased}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UpstreamLeasedForm
                            factors={getFactorsForCategory(
                                "cat8_upstream_leased",
                            )}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "downstream" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat9_downstream_transport}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TransportForm
                            factors={getFactorsForCategory(
                                "cat9_downstream_transport",
                            )}
                            category="cat9_downstream_transport"
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "processing" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat10_product_processing}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProductProcessingForm
                            factors={getFactorsForCategory(
                                "cat10_product_processing",
                            )}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "productUse" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat11_product_use}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProductUseForm
                            factors={getFactorsForCategory("cat11_product_use")}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "endOfLife" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat12_end_of_life}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EndOfLifeForm
                            factors={getFactorsForCategory("cat12_end_of_life")}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "downstreamLeased" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {CATEGORY_LABELS.cat13_downstream_leased}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DownstreamLeasedForm
                            factors={getFactorsForCategory(
                                "cat13_downstream_leased",
                            )}
                            onSuccess={onSuccess}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
