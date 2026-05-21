"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { INDUSTRY_TYPES } from "@/lib/constants";

const organizationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    country: z.enum(["US", "MY"]),
    reportingYear: z.number().min(2000).max(2100),
    industryType: z.string().min(1, "Industry type is required"),
    adminEmail: z.string().email("Invalid email"),
    adminPassword: z.string().min(6, "Password must be at least 6 characters"),
    adminName: z.string().min(2, "Admin name must be at least 2 characters"),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface Organization {
    id: string;
    name: string;
    slug: string;
    country: string;
    currency: string;
    reportingYear: number;
    industryType: string;
    createdAt: string;
    _count: {
        users: number;
        facilities: number;
        reports: number;
    };
}

export default function SuperAdminOrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<OrganizationFormData>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            country: "US",
            reportingYear: new Date().getFullYear(),
        },
    });

    const fetchOrganizations = async () => {
        try {
            const res = await fetch("/api/superadmin/organizations");
            if (res.ok) {
                setOrganizations(await res.json());
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const onSubmit = async (data: OrganizationFormData) => {
        try {
            const res = await fetch("/api/superadmin/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                reset();
                setDialogOpen(false);
                fetchOrganizations();
            }
        } catch (error) {
        }
    };

    const handleDelete = async () => {
        if (!deletingOrg) return;

        try {
            const res = await fetch(`/api/superadmin/organizations/${deletingOrg.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setDeletingOrg(null);
                fetchOrganizations();
            }
        } catch (error) {
        }
    };

    const openEditDialog = (org: Organization) => {
        setEditingOrg(org);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Organizations</h1>
                        <p className="text-muted-foreground text-sm">Manage all organizations</p>
                    </div>
                </div>
                <Button onClick={() => { setEditingOrg(null); reset(); setDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Organization
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Industry</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Facilities</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {organizations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No organizations found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        organizations.map((org) => (
                                            <TableRow key={org.id}>
                                                <TableCell className="font-medium">{org.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{org.country}</Badge>
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {org.industryType.replace(/_/g, " ")}
                                                </TableCell>
                                                <TableCell>{org.reportingYear}</TableCell>
                                                <TableCell>{org._count.users}</TableCell>
                                                <TableCell>{org._count.facilities}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditDialog(org)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeletingOrg(org)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingOrg ? "Edit Organization" : "Add New Organization"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label required error={!!errors.name}>
                                    Organization Name
                                </Label>
                                <Input
                                    error={!!errors.name}
                                    {...register("name")}
                                    placeholder="Acme Corporation"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label required error={!!errors.country}>
                                    Country
                                </Label>
                                <Select
                                    value={watch("country")}
                                    onValueChange={(v) => setValue("country", v as "US" | "MY")}
                                >
                                    <SelectTrigger error={!!errors.country}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US">United States</SelectItem>
                                        <SelectItem value="MY">Malaysia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label required error={!!errors.industryType}>
                                    Industry Type
                                </Label>
                                <Select
                                    value={watch("industryType")}
                                    onValueChange={(v) => setValue("industryType", v)}
                                >
                                    <SelectTrigger error={!!errors.industryType}>
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRY_TYPES.map((ind) => (
                                            <SelectItem key={ind.value} value={ind.value}>
                                                {ind.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label required error={!!errors.reportingYear}>
                                    Reporting Year
                                </Label>
                                <Input
                                    type="number"
                                    error={!!errors.reportingYear}
                                    {...register("reportingYear", { valueAsNumber: true })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label required error={!!errors.adminName}>
                                    Admin Name
                                </Label>
                                <Input
                                    error={!!errors.adminName}
                                    {...register("adminName")}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label required error={!!errors.adminEmail}>
                                    Admin Email
                                </Label>
                                <Input
                                    type="email"
                                    error={!!errors.adminEmail}
                                    {...register("adminEmail")}
                                    placeholder="admin@company.com"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label required error={!!errors.adminPassword}>
                                    Admin Password
                                </Label>
                                <Input
                                    type="password"
                                    error={!!errors.adminPassword}
                                    {...register("adminPassword")}
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : editingOrg ? "Update" : "Create Organization"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deletingOrg} onOpenChange={() => setDeletingOrg(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Organization</DialogTitle>
                    </DialogHeader>
                    <p>
                        Are you sure you want to delete <strong>{deletingOrg?.name}</strong>? This will
                        also delete all associated users, facilities, and data. This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingOrg(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}