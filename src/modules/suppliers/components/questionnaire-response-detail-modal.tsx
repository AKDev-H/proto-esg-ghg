"use client";

import type { ReactNode } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type {
    CarbonDisclosureData,
    EnergyUsageData,
    PcfData,
    QuestionnaireResponseRecord,
} from "@/modules/suppliers/types";
import { getCategoryLabel } from "@/modules/suppliers/utils/categories";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatBool(value: boolean | undefined) {
    if (value === undefined) return "—";
    return value ? "Yes" : "No";
}

function formatValue(value: unknown, suffix = "") {
    if (value === null || value === undefined || value === "") return "—";
    return `${String(value)}${suffix}`;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(180px,240px)_1fr] gap-x-6 gap-y-1 py-2.5 border-b border-border/60 last:border-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium break-words">{value}</dd>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-lg border bg-muted/20 p-5">
            <h3 className="font-semibold text-base mb-4">{title}</h3>
            <dl>{children}</dl>
        </section>
    );
}

function CarbonDisclosureSection({ data }: { data: CarbonDisclosureData }) {
    return (
        <Section title="Carbon Disclosure Questionnaire">
            <DetailRow label="Reporting year" value={formatValue(data.reportingYear)} />
            <DetailRow
                label="Scope 1 emissions"
                value={formatValue(data.scope1Emissions, " tCO2e")}
            />
            <DetailRow
                label="Scope 2 emissions"
                value={formatValue(data.scope2Emissions, " tCO2e")}
            />
            <DetailRow
                label="Scope 3 emissions"
                value={formatValue(data.scope3Emissions, " tCO2e")}
            />
            <DetailRow
                label="SBTi commitment"
                value={formatBool(data.hasSbtiCommitment)}
            />
            <DetailRow label="CDP disclosure" value={formatBool(data.cdpDisclosure)} />
            <DetailRow
                label="Third-party verified"
                value={formatBool(data.thirdPartyVerified)}
            />
            <DetailRow
                label="Reduction target"
                value={formatValue(data.reductionTargetPercent, "%")}
            />
            <DetailRow label="Comments" value={formatValue(data.comments)} />
        </Section>
    );
}

function PcfSection({ data }: { data: PcfData }) {
    return (
        <Section title="Product Carbon Footprint (PCF)">
            <DetailRow label="Product name" value={formatValue(data.productName)} />
            <DetailRow label="Functional unit" value={formatValue(data.productUnit)} />
            <DetailRow
                label="Cradle-to-gate emissions"
                value={formatValue(data.cradleToGateEmissions, " kgCO2e/unit")}
            />
            <DetailRow label="System boundary" value={formatValue(data.systemBoundary)} />
            <DetailRow label="Data quality" value={formatValue(data.dataQuality)} />
            <DetailRow label="Methodology" value={formatValue(data.methodology)} />
            <DetailRow label="Allocation method" value={formatValue(data.allocationMethod)} />
            <DetailRow label="Comments" value={formatValue(data.comments)} />
        </Section>
    );
}

function EnergyUsageSection({ data }: { data: EnergyUsageData }) {
    return (
        <Section title="Energy Usage Request">
            <DetailRow
                label="Annual electricity"
                value={formatValue(data.annualElectricityKwh, " kWh/yr")}
            />
            <DetailRow
                label="Annual natural gas"
                value={formatValue(
                    data.annualNaturalGas,
                    data.naturalGasUnit ? ` ${data.naturalGasUnit}/yr` : "",
                )}
            />
            <DetailRow
                label="Annual diesel"
                value={formatValue(data.annualDieselLiters, " L/yr")}
            />
            <DetailRow
                label="Renewable energy"
                value={formatValue(data.renewableEnergyPercent, "%")}
            />
            <DetailRow
                label="Energy intensity"
                value={formatValue(
                    data.energyIntensity,
                    data.energyIntensityUnit ? ` ${data.energyIntensityUnit}` : "",
                )}
            />
            <DetailRow label="Comments" value={formatValue(data.comments)} />
        </Section>
    );
}

export function QuestionnaireResponseDetailModal({
    response,
    open,
    onOpenChange,
}: {
    response: QuestionnaireResponseRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl"
            >
                {response && (
                    <>
                        <SheetHeader className="shrink-0 space-y-3 border-b px-6 py-5 pr-14 text-left">
                            <SheetTitle className="text-xl">
                                {response.supplierName}
                            </SheetTitle>
                            <SheetDescription>
                                Questionnaire submitted on{" "}
                                {formatDate(response.submittedAt)}
                            </SheetDescription>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {response.supplierCategories.map((category) => (
                                    <Badge key={category} variant="outline">
                                        {getCategoryLabel(
                                            category,
                                            response.supplierOtherCategoryType,
                                        )}
                                    </Badge>
                                ))}
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <div className="space-y-5">
                                <Section title="Respondent">
                                    <DetailRow
                                        label="Name"
                                        value={formatValue(response.respondentName)}
                                    />
                                    <DetailRow
                                        label="Email"
                                        value={formatValue(response.respondentEmail)}
                                    />
                                    <DetailRow
                                        label="Title"
                                        value={formatValue(response.respondentTitle)}
                                    />
                                </Section>

                                {response.carbonDisclosure && (
                                    <CarbonDisclosureSection
                                        data={response.carbonDisclosure}
                                    />
                                )}
                                {response.pcf && <PcfSection data={response.pcf} />}
                                {response.energyUsage && (
                                    <EnergyUsageSection data={response.energyUsage} />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
