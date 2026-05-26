"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QUESTIONNAIRE_TYPES } from "@/lib/constants";
import { submitQuestionnaireSchema } from "@/modules/suppliers/schemas";
import type {
    PublicQuestionnaireContext,
    QuestionnaireType,
    SupplierCategory,
} from "@/modules/suppliers/types";
import { getCategoriesLabels } from "@/modules/suppliers/utils/categories";
import { CheckCircle2, Gauge, Loader2 } from "lucide-react";
import { z } from "zod";

type SubmitForm = z.infer<typeof submitQuestionnaireSchema>;

interface SupplierQuestionnaireFormProps {
    token: string;
}

export function SupplierQuestionnaireForm({ token }: SupplierQuestionnaireFormProps) {
    const [context, setContext] = useState<PublicQuestionnaireContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<SubmitForm>({
        resolver: zodResolver(submitQuestionnaireSchema),
        defaultValues: { token },
    });

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(
                    `/api/supplier-questionnaires/validate?token=${encodeURIComponent(token)}`,
                );
                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    setError(data?.error ?? "Invalid questionnaire link");
                    return;
                }
                const data: PublicQuestionnaireContext = await res.json();
                setContext(data);
                if (data.alreadySubmitted) {
                    setSubmitted(true);
                }
            } catch {
                setError("Failed to load questionnaire");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [token]);

    const includesType = (type: QuestionnaireType) =>
        context?.questionnaireTypes.includes(type) ?? false;

    const onSubmit = async (data: SubmitForm) => {
        setSubmitting(true);
        try {
            const payload: SubmitForm = { ...data, token };

            if (!includesType("carbon_disclosure")) delete payload.carbonDisclosure;
            if (!includesType("pcf")) delete payload.pcf;
            if (!includesType("energy_usage")) delete payload.energyUsage;

            const res = await fetch("/api/supplier-questionnaires/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setSubmitted(true);
                return;
            }

            const err = await res.json().catch(() => null);
            setError(err?.error ?? "Failed to submit questionnaire");
        } catch {
            setError("Failed to submit questionnaire");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error && !context) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Link Not Valid</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-7 h-7 text-primary" />
                        </div>
                        <CardTitle>Thank You</CardTitle>
                        <CardDescription>
                            Your emissions data for {context?.supplierName} has been
                            submitted to {context?.organizationName}.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (context?.status === "expired" || context?.status === "revoked") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Link Expired</CardTitle>
                        <CardDescription>
                            This questionnaire link is no longer valid. Please contact{" "}
                            {context.organizationName} for a new link.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-10 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                        <Gauge className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Supplier Emissions Questionnaire</h1>
                        <p className="text-muted-foreground text-sm">
                            Requested by {context?.organizationName}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{context?.supplierName}</CardTitle>
                        <CardDescription>
                            {context?.supplierCategories &&
                            context.supplierCategories.length > 0
                                ? `${getCategoriesLabels(
                                      context.supplierCategories as SupplierCategory[],
                                      context.supplierOtherCategoryType,
                                  )} supplier · `
                                : ""}
                            Complete the sections below. Link expires{" "}
                            {context?.expiresAt
                                ? new Date(context.expiresAt).toLocaleDateString()
                                : ""}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {context?.questionnaireTypes.map((type) => (
                                <Badge key={type} variant="secondary">
                                    {QUESTIONNAIRE_TYPES.find((t) => t.value === type)?.label ??
                                        type}
                                </Badge>
                            ))}
                        </div>
                    </CardHeader>
                </Card>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Your Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="respondentName">Full Name *</Label>
                                <Input
                                    id="respondentName"
                                    {...form.register("respondentName")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="respondentEmail">Email *</Label>
                                <Input
                                    id="respondentEmail"
                                    type="email"
                                    {...form.register("respondentEmail")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="respondentTitle">Job Title</Label>
                                <Input
                                    id="respondentTitle"
                                    {...form.register("respondentTitle")}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {includesType("carbon_disclosure") && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Carbon Disclosure Questionnaire
                                </CardTitle>
                                <CardDescription>
                                    Report your organization&apos;s GHG emissions inventory.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Reporting Year</Label>
                                    <Input
                                        type="number"
                                        {...form.register("carbonDisclosure.reportingYear")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Scope 1 Emissions (tCO2e)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("carbonDisclosure.scope1Emissions")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Scope 2 Emissions (tCO2e)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("carbonDisclosure.scope2Emissions")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Scope 3 Emissions (tCO2e)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("carbonDisclosure.scope3Emissions")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reduction Target (%)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register(
                                            "carbonDisclosure.reductionTargetPercent",
                                        )}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Additional Comments</Label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        {...form.register("carbonDisclosure.comments")}
                                    />
                                </div>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        {...form.register("carbonDisclosure.hasSbtiCommitment")}
                                    />
                                    Science Based Targets (SBTi) commitment
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        {...form.register("carbonDisclosure.cdpDisclosure")}
                                    />
                                    CDP disclosure submitted
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        {...form.register("carbonDisclosure.thirdPartyVerified")}
                                    />
                                    Third-party verified emissions data
                                </label>
                            </CardContent>
                        </Card>
                    )}

                    {includesType("pcf") && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Product Carbon Footprint (PCF)
                                </CardTitle>
                                <CardDescription>
                                    Provide cradle-to-gate emissions for products supplied.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Product Name</Label>
                                    <Input {...form.register("pcf.productName")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Functional Unit</Label>
                                    <Input
                                        placeholder="e.g. kg, unit, meter"
                                        {...form.register("pcf.productUnit")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cradle-to-Gate Emissions (kgCO2e/unit)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("pcf.cradleToGateEmissions")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data Quality</Label>
                                    <Select
                                        onValueChange={(v) =>
                                            form.setValue(
                                                "pcf.dataQuality",
                                                v as "primary" | "secondary" | "mixed",
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select quality" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="primary">Primary data</SelectItem>
                                            <SelectItem value="secondary">
                                                Secondary data
                                            </SelectItem>
                                            <SelectItem value="mixed">Mixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>System Boundary</Label>
                                    <Input
                                        placeholder="e.g. Raw material extraction to factory gate"
                                        {...form.register("pcf.systemBoundary")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Methodology</Label>
                                    <Input
                                        placeholder="e.g. ISO 14067, GHG Protocol"
                                        {...form.register("pcf.methodology")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Allocation Method</Label>
                                    <Input {...form.register("pcf.allocationMethod")} />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Comments</Label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        {...form.register("pcf.comments")}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {includesType("energy_usage") && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Energy Usage Request</CardTitle>
                                <CardDescription>
                                    Report annual energy consumption at your facilities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Annual Electricity (kWh)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("energyUsage.annualElectricityKwh")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Renewable Energy (%)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("energyUsage.renewableEnergyPercent")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Annual Natural Gas</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("energyUsage.annualNaturalGas")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Natural Gas Unit</Label>
                                    <Input
                                        placeholder="e.g. m3, therms"
                                        {...form.register("energyUsage.naturalGasUnit")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Annual Diesel (liters)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("energyUsage.annualDieselLiters")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Energy Intensity</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...form.register("energyUsage.energyIntensity")}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Comments</Label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        {...form.register("energyUsage.comments")}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {error && (
                        <p className="text-sm text-destructive text-center">{error}</p>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Questionnaire"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
