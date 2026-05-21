"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUserSchema } from "@/modules/users/schemas";
import type { CreateUserFormData } from "@/modules/users/types";
import { toast } from "@/hooks/use-toast";

interface UserFormProps {
    onSuccess?: () => void;
}

export function UserForm({ onSuccess }: UserFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
        defaultValues: { role: "data_entry_staff" },
    });

    const onSubmit = async (data: CreateUserFormData) => {
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setIsOpen(false);
                form.reset({
                    name: "",
                    email: "",
                    password: "",
                    role: "data_entry_staff",
                });
                toast({
                    title: "User added",
                    description: `${data.name} has been added successfully.`,
                });
                onSuccess?.();
                return;
            }

            const error = await res.json().catch(() => null);
            toast({
                variant: "destructive",
                title: "Failed to add user",
                description: error?.error ?? "Something went wrong. Please try again.",
            });
        } catch {
            toast({
                variant: "destructive",
                title: "Failed to add user",
                description: "Something went wrong. Please try again.",
            });
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Add User</Button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md m-4">
                        <CardHeader>
                            <CardTitle>Add New User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label
                                        required
                                        error={!!form.formState.errors.name}
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        error={!!form.formState.errors.name}
                                        {...form.register("name")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        required
                                        error={!!form.formState.errors.email}
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        type="email"
                                        error={!!form.formState.errors.email}
                                        {...form.register("email")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        required
                                        error={!!form.formState.errors.password}
                                    >
                                        Password
                                    </Label>
                                    <Input
                                        type="password"
                                        error={!!form.formState.errors.password}
                                        {...form.register("password")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        required
                                        error={!!form.formState.errors.role}
                                    >
                                        Role
                                    </Label>
                                    <Select
                                        value={form.watch("role")}
                                        onValueChange={(v) =>
                                            form.setValue(
                                                "role",
                                                v as CreateUserFormData["role"],
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            error={!!form.formState.errors.role}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="org_admin">
                                                Organization Admin
                                            </SelectItem>
                                            <SelectItem value="sustainability_manager">
                                                Sustainability Manager
                                            </SelectItem>
                                            <SelectItem value="data_entry_staff">
                                                Data Entry Staff
                                            </SelectItem>
                                            <SelectItem value="viewer">
                                                Viewer
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        Add User
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
