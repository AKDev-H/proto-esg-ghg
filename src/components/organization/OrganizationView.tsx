"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building2, Users, Pencil, Save, X, Calculator } from "lucide-react";
import type { OrganizationUser } from "@/modules/organizations/types";
import { canManageOrgSettings } from "@/lib/permissions";

interface OrganizationViewProps {
    organization: {
        id: string;
        name: string;
        slug: string;
        country: string;
        currency: string;
        industryType: string;
        settings?: Record<string, string>;
        users?: OrganizationUser[];
    };
    userRole?: string;
    onUpdate?: () => void;
}

const INDUSTRY_TYPES = [
    { value: "automotive", label: "Automotive" },
    { value: "electronics", label: "Electronics" },
    { value: "food_beverage", label: "Food & Beverage" },
    { value: "textile", label: "Textile" },
    { value: "chemical", label: "Chemical" },
    { value: "metal", label: "Metal & Machinery" },
    { value: "plastic", label: "Plastic & Rubber" },
    { value: "construction", label: "Construction" },
    { value: "pharmaceutical", label: "Pharmaceutical" },
    { value: "other", label: "Other" },
];

const COUNTRIES = [
    { value: "US", label: "United States" },
    { value: "MY", label: "Malaysia" },
];

const CURRENCIES = [
    { value: "USD", label: "USD ($)" },
    { value: "MYR", label: "MYR (RM)" },
];

const DISTANCE_UNITS = [
    { value: "km", label: "Kilometers (km)" },
    { value: "mile", label: "Miles (mi)" },
];

const WEIGHT_UNITS = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "lb", label: "Pounds (lb)" },
];

const FUEL_UNITS = [
    { value: "liter", label: "Liters (L)" },
    { value: "gallon", label: "Gallons (gal)" },
];

const FACTOR_SOURCES = [
    { value: "EPA", label: "EPA (US)" },
    { value: "DEFRA", label: "DEFRA (UK)" },
    { value: "Malaysia Grid", label: "Malaysia Grid" },
];

export function OrganizationView({
    organization,
    userRole,
    onUpdate,
}: OrganizationViewProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: organization.name,
        country: organization.country,
        currency: organization.currency,
        industryType: organization.industryType,
        settings: {
            distanceUnit: organization.settings?.distanceUnit || "km",
            weightUnit: organization.settings?.weightUnit || "kg",
            fuelUnit: organization.settings?.fuelUnit || "liter",
            factorSource: organization.settings?.factorSource || "EPA",
        },
    });

    const canEdit = canManageOrgSettings(userRole);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/organizations/${organization.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    country: formData.country,
                    currency: formData.currency,
                    industryType: formData.industryType,
                    settings: formData.settings,
                }),
            });
            if (res.ok) {
                setIsEditing(false);
                onUpdate?.();
                router.refresh();
            }
        } catch (error) {
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: organization.name,
            country: organization.country,
            currency: organization.currency,
            industryType: organization.industryType,
            settings: {
                distanceUnit: organization.settings?.distanceUnit || "km",
                weightUnit: organization.settings?.weightUnit || "kg",
                fuelUnit: organization.settings?.fuelUnit || "liter",
                factorSource: organization.settings?.factorSource || "EPA",
            },
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Organization Settings</h1>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Calculator className="w-4 h-4 mr-2" />
                                Calculation Formulae
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="md:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Calculation Formulae</DialogTitle>
                                <DialogDescription>
                                    Emissions are calculated from converted activity values and the selected emission factor. Final results are stored as kgCO2e.
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="scope1" className="mt-2">
                                <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                                    <TabsTrigger
                                        value="scope1"
                                        className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                    >
                                        Scope 1
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="scope2"
                                        className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                    >
                                        Scope 2
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="scope3"
                                        className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                    >
                                        Scope 3
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="scope1" className="mt-5 space-y-4">
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <p className="text-sm text-muted-foreground">Main formula</p>
                                        <p className="mt-1 font-mono text-sm font-semibold">
                                            Scope 1 Emissions = Converted Activity Value × Scope 1 Emission Factor
                                        </p>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <p>
                                            <span className="font-medium">Vehicle fuel:</span> Fuel consumed in liters × fuel emission factor
                                        </p>
                                        <p>
                                            <span className="font-medium">Stationary combustion:</span> Fuel consumed in liters × fuel emission factor
                                        </p>
                                        <p>
                                            <span className="font-medium">Refrigerants:</span> Refrigerant quantity in kg × refrigerant GWP factor
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="scope2" className="mt-5 space-y-4">
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <p className="text-sm text-muted-foreground">Main formula</p>
                                        <p className="mt-1 font-mono text-sm font-semibold">
                                            Scope 2 Emissions = Electricity Consumption × Grid Emission Factor
                                        </p>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <p>
                                            <span className="font-medium">Purchased electricity:</span> Electricity consumed in kWh × country or grid emission factor
                                        </p>
                                        <p>
                                            Input units such as MWh or MJ are converted to kWh before the emission factor is applied.
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="scope3" className="mt-5 space-y-4">
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <p className="text-sm text-muted-foreground">Main formula</p>
                                        <p className="mt-1 font-mono text-sm font-semibold">
                                            Scope 3 Emissions = Converted Activity Value × Scope 3 Category Emission Factor
                                        </p>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <p>
                                            <span className="font-medium">Purchased goods:</span> Material quantity in kg × material emission factor
                                        </p>
                                        <p>
                                            <span className="font-medium">Transportation:</span> Weight × distance × transport emission factor
                                        </p>
                                        <p>
                                            <span className="font-medium">Product use:</span> Annual energy × lifetime × units sold × electricity factor
                                        </p>
                                        <p>
                                            <span className="font-medium">End-of-life:</span> Waste quantity × disposal emission factor
                                        </p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>

                    {canEdit && !isEditing && (
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Organization Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Organization Name
                                </Label>
                                {isEditing ? (
                                    <Input
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="mt-1"
                                    />
                                ) : (
                                    <p className="font-medium">
                                        {organization.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Country
                                </Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.country}
                                        onValueChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                country: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRIES.map((c) => (
                                                <SelectItem
                                                    key={c.value}
                                                    value={c.value}
                                                >
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-medium">
                                        {organization.country === "US"
                                            ? "United States"
                                            : "Malaysia"}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Currency
                                </Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                currency: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map((c) => (
                                                <SelectItem
                                                    key={c.value}
                                                    value={c.value}
                                                >
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-medium">
                                        {organization.currency}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Industry Type
                                </Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.industryType}
                                        onValueChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                industryType: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INDUSTRY_TYPES.map((i) => (
                                                <SelectItem
                                                    key={i.value}
                                                    value={i.value}
                                                >
                                                    {i.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-medium capitalize">
                                        {organization.industryType.replace(
                                            "_",
                                            " ",
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">
                                Distance Unit
                            </Label>
                            {isEditing ? (
                                <Select
                                    value={formData.settings.distanceUnit}
                                    onValueChange={(v) =>
                                        setFormData({
                                            ...formData,
                                            settings: {
                                                ...formData.settings,
                                                distanceUnit: v,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DISTANCE_UNITS.map((d) => (
                                            <SelectItem
                                                key={d.value}
                                                value={d.value}
                                            >
                                                {d.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="font-medium">
                                    {organization.settings?.distanceUnit ||
                                        "km"}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="text-muted-foreground">
                                Weight Unit
                            </Label>
                            {isEditing ? (
                                <Select
                                    value={formData.settings.weightUnit}
                                    onValueChange={(v) =>
                                        setFormData({
                                            ...formData,
                                            settings: {
                                                ...formData.settings,
                                                weightUnit: v,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WEIGHT_UNITS.map((w) => (
                                            <SelectItem
                                                key={w.value}
                                                value={w.value}
                                            >
                                                {w.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="font-medium">
                                    {organization.settings?.weightUnit || "kg"}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="text-muted-foreground">
                                Fuel Unit
                            </Label>
                            {isEditing ? (
                                <Select
                                    value={formData.settings.fuelUnit}
                                    onValueChange={(v) =>
                                        setFormData({
                                            ...formData,
                                            settings: {
                                                ...formData.settings,
                                                fuelUnit: v,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FUEL_UNITS.map((f) => (
                                            <SelectItem
                                                key={f.value}
                                                value={f.value}
                                            >
                                                {f.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="font-medium">
                                    {organization.settings?.fuelUnit || "liter"}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="text-muted-foreground">
                                Factor Source
                            </Label>
                            {isEditing ? (
                                <Select
                                    value={formData.settings.factorSource}
                                    onValueChange={(v) =>
                                        setFormData({
                                            ...formData,
                                            settings: {
                                                ...formData.settings,
                                                factorSource: v,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FACTOR_SOURCES.map((f) => (
                                            <SelectItem
                                                key={f.value}
                                                value={f.value}
                                            >
                                                {f.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="font-medium">
                                    {organization.settings?.factorSource ||
                                        "EPA"}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Team Members ({organization.users?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {organization.users?.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                                <Badge variant="secondary">
                                    {user.role.replace("_", " ")}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
