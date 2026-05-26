"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    SUPPLIER_CATEGORIES,
    QUESTIONNAIRE_TYPES,
    QUESTIONNAIRE_INVITE_STATUS_LABELS,
} from "@/lib/constants";
import { createSupplierSchema } from "@/modules/suppliers/schemas";
import type {
    QuestionnaireInviteRecord,
    QuestionnaireResponseRecord,
    SupplierCategory,
    SupplierRecord,
} from "@/modules/suppliers/types";
import {
    countSuppliersInCategory,
    getCategoryLabel,
    isPrioritySupplier,
    sortSuppliersByPriority,
} from "@/modules/suppliers/utils/categories";
import { toast } from "@/hooks/use-toast";
import { Copy, Link2, Plus, RefreshCw } from "lucide-react";
import { z } from "zod";

type CreateSupplierForm = z.infer<typeof createSupplierSchema>;

interface SupplierEngagementProps {
    canManage: boolean;
}

function CategoryBadges({
    categories,
    otherCategoryType,
}: {
    categories: SupplierCategory[];
    otherCategoryType?: string | null;
}) {
    if (categories.length === 0) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                    {getCategoryLabel(category, otherCategoryType)}
                </Badge>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string | null | undefined }) {
    if (!status) return <Badge variant="outline">No invite</Badge>;

    const variant =
        status === "submitted"
            ? "default"
            : status === "expired" || status === "revoked"
              ? "destructive"
              : "secondary";

    return (
        <Badge variant={variant}>
            {QUESTIONNAIRE_INVITE_STATUS_LABELS[
                status as keyof typeof QUESTIONNAIRE_INVITE_STATUS_LABELS
            ] ?? status}
        </Badge>
    );
}

export function SupplierEngagement({ canManage }: SupplierEngagementProps) {
    const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
    const [invites, setInvites] = useState<QuestionnaireInviteRecord[]>([]);
    const [responses, setResponses] = useState<QuestionnaireResponseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([
        "carbon_disclosure",
        "pcf",
        "energy_usage",
    ]);

    const form = useForm<CreateSupplierForm>({
        resolver: zodResolver(createSupplierSchema),
        defaultValues: { categories: [], otherCategoryType: "" },
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [suppliersRes, invitesRes, responsesRes] = await Promise.all([
                fetch("/api/suppliers"),
                fetch("/api/supplier-questionnaires"),
                fetch("/api/supplier-questionnaires?view=responses"),
            ]);

            if (suppliersRes.ok) {
                const data = await suppliersRes.json();
                setSuppliers(data.suppliers);
            }
            if (invitesRes.ok) {
                const data = await invitesRes.json();
                setInvites(data.invites);
            }
            if (responsesRes.ok) {
                const data = await responsesRes.json();
                setResponses(data.responses);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onCreateSupplier = async (data: CreateSupplierForm) => {
        const res = await fetch("/api/suppliers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            toast({ title: "Supplier created", description: `${data.name} added.` });
            setShowCreateForm(false);
            form.reset({ categories: [], otherCategoryType: "" });
            fetchData();
            return;
        }

        const error = await res.json().catch(() => null);
        toast({
            variant: "destructive",
            title: "Failed to create supplier",
            description: error?.error ?? "Please try again.",
        });
    };

    const generateLink = async (supplierId: string, supplierName: string) => {
        const res = await fetch(`/api/suppliers/${supplierId}/invites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionnaireTypes: selectedTypes,
                expiresInDays: 90,
            }),
        });

        if (res.ok) {
            const data = await res.json();
            setGeneratedLink(data.url);
            toast({
                title: "Questionnaire link generated",
                description: `Secure link created for ${supplierName}.`,
            });
            fetchData();
            return;
        }

        const error = await res.json().catch(() => null);
        toast({
            variant: "destructive",
            title: "Failed to generate link",
            description: error?.error ?? "Please try again.",
        });
    };

    const copyLink = async () => {
        if (!generatedLink) return;
        await navigator.clipboard.writeText(generatedLink);
        toast({ title: "Link copied", description: "Share this link with your supplier." });
    };

    const toggleQuestionnaireType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
        );
    };

    const toggleSupplierCategory = (category: SupplierCategory) => {
        const current = form.getValues("categories") ?? [];
        const isSelected = current.includes(category);

        if (isSelected) {
            form.setValue(
                "categories",
                current.filter((c) => c !== category),
            );
            if (category === "other") {
                form.setValue("otherCategoryType", "");
            }
            return;
        }

        form.setValue("categories", [...current, category]);
    };

    const selectedCategories = form.watch("categories") ?? [];
    const hasOtherCategory = selectedCategories.includes("other");

    const sortedSuppliers = sortSuppliersByPriority(suppliers);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Supplier Engagement
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Send carbon disclosure, PCF, and energy usage questionnaires to
                        priority suppliers via secure links.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {canManage && (
                        <Button onClick={() => setShowCreateForm(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Supplier
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>MATC Priority Suppliers</CardTitle>
                    <CardDescription>
                        Focus on stainless steel, aluminum, chemical, and logistics
                        providers — suppliers can belong to more than one category.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {SUPPLIER_CATEGORIES.filter((c) => c.priority).map((cat) => {
                            const count = countSuppliersInCategory(
                                suppliers,
                                cat.value as SupplierCategory,
                            );
                            return (
                                <div
                                    key={cat.value}
                                    className="rounded-lg border p-4 bg-muted/30"
                                >
                                    <p className="font-medium text-sm">{cat.label}</p>
                                    <p className="text-2xl font-bold mt-1">{count}</p>
                                    <p className="text-xs text-muted-foreground">
                                        suppliers tracked
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {canManage && (
                <Card>
                    <CardHeader>
                        <CardTitle>Questionnaire Types to Send</CardTitle>
                        <CardDescription>
                            Select which forms to include when generating a supplier link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {QUESTIONNAIRE_TYPES.map((type) => (
                                <label
                                    key={type.value}
                                    className="flex items-center gap-2 rounded-lg border px-4 py-2 cursor-pointer hover:bg-muted/50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(type.value)}
                                        onChange={() =>
                                            toggleQuestionnaireType(type.value)
                                        }
                                        className="rounded"
                                    />
                                    <span className="text-sm">{type.label}</span>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {generatedLink && (
                <Card className="border-primary/30 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link2 className="w-5 h-5" />
                            Secure Supplier Link
                        </CardTitle>
                        <CardDescription>
                            Share this link with your supplier. It is unique and expires
                            after 90 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-3">
                        <Input readOnly value={generatedLink} className="font-mono text-sm" />
                        <Button onClick={copyLink}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="suppliers">
                <TabsList>
                    <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
                    <TabsTrigger value="invites">Invites ({invites.length})</TabsTrigger>
                    <TabsTrigger value="responses">
                        Submissions ({responses.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="suppliers" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            {loading ? (
                                <p className="text-muted-foreground">Loading...</p>
                            ) : suppliers.length === 0 ? (
                                <p className="text-muted-foreground">
                                    No suppliers yet. Add a supplier to generate a
                                    questionnaire link.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left">
                                                <th className="pb-3 font-medium">Supplier</th>
                                                <th className="pb-3 font-medium">Categories</th>
                                                <th className="pb-3 font-medium">Contact</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                {canManage && (
                                                    <th className="pb-3 font-medium">Action</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedSuppliers.map((supplier) => (
                                                    <tr key={supplier.id} className="border-b">
                                                        <td className="py-3 font-medium">
                                                            {supplier.name}
                                                            {isPrioritySupplier(
                                                                supplier.categories,
                                                            ) && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="ml-2 text-xs"
                                                                >
                                                                    Priority
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="py-3">
                                                            <CategoryBadges
                                                                categories={
                                                                    supplier.categories
                                                                }
                                                                otherCategoryType={
                                                                    supplier.otherCategoryType
                                                                }
                                                            />
                                                        </td>
                                                        <td className="py-3 text-muted-foreground">
                                                            {supplier.contactEmail ?? "—"}
                                                        </td>
                                                        <td className="py-3">
                                                            <StatusBadge
                                                                status={
                                                                    supplier.latestInviteStatus
                                                                }
                                                            />
                                                        </td>
                                                        {canManage && (
                                                            <td className="py-3">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    disabled={
                                                                        selectedTypes.length === 0
                                                                    }
                                                                    onClick={() =>
                                                                        generateLink(
                                                                            supplier.id,
                                                                            supplier.name,
                                                                        )
                                                                    }
                                                                >
                                                                    <Link2 className="w-4 h-4 mr-1" />
                                                                    Generate Link
                                                                </Button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invites" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            {invites.length === 0 ? (
                                <p className="text-muted-foreground">No invites sent yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left">
                                                <th className="pb-3 font-medium">Supplier</th>
                                                <th className="pb-3 font-medium">Types</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium">Expires</th>
                                                <th className="pb-3 font-medium">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invites.map((invite) => (
                                                <tr key={invite.id} className="border-b">
                                                    <td className="py-3">
                                                        <div>{invite.supplierName}</div>
                                                        <CategoryBadges
                                                            categories={
                                                                invite.supplierCategories
                                                            }
                                                            otherCategoryType={
                                                                invite.supplierOtherCategoryType
                                                            }
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {invite.questionnaireTypes.map((t) => (
                                                                <Badge
                                                                    key={t}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {QUESTIONNAIRE_TYPES.find(
                                                                        (qt) => qt.value === t,
                                                                    )?.label ?? t}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <StatusBadge status={invite.status} />
                                                    </td>
                                                    <td className="py-3 text-muted-foreground">
                                                        {new Date(
                                                            invite.expiresAt,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 text-muted-foreground">
                                                        {invite.submittedAt
                                                            ? new Date(
                                                                  invite.submittedAt,
                                                              ).toLocaleDateString()
                                                            : "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="responses" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            {responses.length === 0 ? (
                                <p className="text-muted-foreground">
                                    No submissions yet. Responses will appear here when
                                    suppliers complete their questionnaires.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {responses.map((response) => (
                                        <div
                                            key={response.id}
                                            className="rounded-lg border p-4 space-y-3"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold">
                                                        {response.supplierName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        <CategoryBadges
                                                            categories={
                                                                response.supplierCategories
                                                            }
                                                            otherCategoryType={
                                                                response.supplierOtherCategoryType
                                                            }
                                                        />{" "}
                                                        · Submitted{" "}
                                                        {new Date(
                                                            response.submittedAt,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Badge>Submitted</Badge>
                                            </div>
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">
                                                    Respondent:{" "}
                                                </span>
                                                {response.respondentName} (
                                                {response.respondentEmail})
                                            </p>
                                            <div className="grid gap-3 sm:grid-cols-3 text-sm">
                                                {response.carbonDisclosure && (
                                                    <div className="rounded-md bg-muted/40 p-3">
                                                        <p className="font-medium mb-1">
                                                            Carbon Disclosure
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            Scope 1:{" "}
                                                            {String(
                                                                (
                                                                    response.carbonDisclosure as Record<
                                                                        string,
                                                                        unknown
                                                                    >
                                                                ).scope1Emissions ?? "—",
                                                            )}{" "}
                                                            tCO2e
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            Scope 2:{" "}
                                                            {String(
                                                                (
                                                                    response.carbonDisclosure as Record<
                                                                        string,
                                                                        unknown
                                                                    >
                                                                ).scope2Emissions ?? "—",
                                                            )}{" "}
                                                            tCO2e
                                                        </p>
                                                    </div>
                                                )}
                                                {response.pcf && (
                                                    <div className="rounded-md bg-muted/40 p-3">
                                                        <p className="font-medium mb-1">PCF</p>
                                                        <p className="text-muted-foreground">
                                                            Product:{" "}
                                                            {String(
                                                                (
                                                                    response.pcf as Record<
                                                                        string,
                                                                        unknown
                                                                    >
                                                                ).productName ?? "—",
                                                            )}
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            Emissions:{" "}
                                                            {String(
                                                                (
                                                                    response.pcf as Record<
                                                                        string,
                                                                        unknown
                                                                    >
                                                                ).cradleToGateEmissions ?? "—",
                                                            )}{" "}
                                                            kgCO2e/unit
                                                        </p>
                                                    </div>
                                                )}
                                                {response.energyUsage && (
                                                    <div className="rounded-md bg-muted/40 p-3">
                                                        <p className="font-medium mb-1">
                                                            Energy Usage
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            Electricity:{" "}
                                                            {String(
                                                                (
                                                                    response.energyUsage as Record<
                                                                        string,
                                                                        unknown
                                                                    >
                                                                ).annualElectricityKwh ?? "—",
                                                            )}{" "}
                                                            kWh/yr
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            Renewable:{" "}
                                                            {String(
                                                                (
                                                                    response.energyUsage as Record<
                                                                        string,
                                                                        unknown
                                                                    >
                                                                ).renewableEnergyPercent ?? "—",
                                                            )}
                                                            %
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md m-4">
                        <CardHeader>
                            <CardTitle>Add Supplier</CardTitle>
                            <CardDescription>
                                Enter supplier details to generate a secure questionnaire
                                link.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={form.handleSubmit(onCreateSupplier)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="name">Supplier Name *</Label>
                                    <Input
                                        id="name"
                                        {...form.register("name")}
                                        placeholder="e.g. Apex Stainless Co."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Categories</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Select all that apply — a supplier can span
                                        multiple priority areas.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {SUPPLIER_CATEGORIES.map((cat) => {
                                            const selected = (
                                                form.watch("categories") ?? []
                                            ).includes(cat.value as SupplierCategory);
                                            return (
                                                <label
                                                    key={cat.value}
                                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm ${
                                                        selected
                                                            ? "border-primary bg-primary/5"
                                                            : "hover:bg-muted/50"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() =>
                                                            toggleSupplierCategory(
                                                                cat.value as SupplierCategory,
                                                            )
                                                        }
                                                        className="rounded"
                                                    />
                                                    {cat.label}
                                                    {cat.priority ? " (Priority)" : ""}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {hasOtherCategory && (
                                        <div className="space-y-2 pt-2">
                                            <Label htmlFor="otherCategoryType">
                                                Other supplier type *
                                            </Label>
                                            <Input
                                                id="otherCategoryType"
                                                {...form.register("otherCategoryType")}
                                                placeholder="e.g. Packaging materials, IT services"
                                            />
                                            {form.formState.errors.otherCategoryType && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.formState.errors
                                                            .otherCategoryType.message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        {...form.register("contactEmail")}
                                        placeholder="supplier@company.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        {...form.register("country")}
                                        placeholder="e.g. US, Malaysia"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Create Supplier</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
