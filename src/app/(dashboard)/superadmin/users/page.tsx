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
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    organizationId: string | null;
    createdAt: string;
    organization?: {
        id: string;
        name: string;
        slug: string;
    };
}

interface Organization {
    id: string;
    name: string;
}

export default function SuperAdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "data_entry_staff",
        password: "",
        organizationId: "",
    });

    const fetchData = async () => {
        try {
            const [usersRes, orgsRes] = await Promise.all([
                fetch("/api/superadmin/users"),
                fetch("/api/superadmin/organizations"),
            ]);
            if (usersRes.ok) {
                setUsers(await usersRes.json());
            }
            if (orgsRes.ok) {
                setOrganizations(await orgsRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
        if (!editingUser && !formData.password.trim()) newErrors.password = "Password is required";
        else if (!editingUser && formData.password.length < 6) newErrors.password = "Min 6 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: "",
            organizationId: user.organizationId || "",
        });
        setErrors({});
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingUser(null);
        setFormData({
            name: "",
            email: "",
            role: "data_entry_staff",
            password: "",
            organizationId: "",
        });
        setErrors({});
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            ...formData,
            organizationId: formData.organizationId || null,
        };

        try {
            const url = editingUser
                ? `/api/superadmin/users/${editingUser.id}`
                : "/api/superadmin/users";
            const method = editingUser ? "PUT" : "POST";

            if (editingUser && !formData.password) {
                delete (payload as Record<string, string>).password;
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setDialogOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error("Failed to save user:", error);
        }
    };

    const handleDelete = async () => {
        if (!deletingUser) return;

        try {
            const res = await fetch(`/api/superadmin/users/${deletingUser.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setDeletingUser(null);
                fetchData();
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "super_admin": return "destructive";
            case "org_admin": return "default";
            case "sustainability_manager": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Users</h1>
                        <p className="text-muted-foreground text-sm">Manage all users across organizations</p>
                    </div>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
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
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Organization</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getRoleBadgeVariant(user.role) as "default" | "secondary" | "destructive" | "outline"}>
                                                        {user.role.replace(/_/g, " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.organization?.name || (
                                                        <span className="text-muted-foreground">None</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeletingUser(user)}>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label required error={!!errors.name}>Name</Label>
                            <Input
                                error={!!errors.name}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label required error={!!errors.email}>Email</Label>
                            <Input
                                type="email"
                                error={!!errors.email}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="user@example.com"
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label required error={!!errors.role}>Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v) => setFormData({ ...formData, role: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {USER_ROLES.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Organization</Label>
                            <Select
                                value={formData.organizationId}
                                onValueChange={(v) => setFormData({ ...formData, organizationId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select organization (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None (Super Admin only)</SelectItem>
                                    {organizations.map((org) => (
                                        <SelectItem key={org.id} value={org.id}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label required={!editingUser} error={!!errors.password}>
                                Password {!editingUser && "*"}
                            </Label>
                            <Input
                                type="password"
                                error={!!errors.password}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder={editingUser ? "Leave empty to keep current" : "Enter password"}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingUser ? "Update" : "Create"} User
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                    </DialogHeader>
                    <p>
                        Are you sure you want to delete <strong>{deletingUser?.name}</strong> ({deletingUser?.email})?
                        This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingUser(null)}>
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