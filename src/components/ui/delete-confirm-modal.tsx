"use client";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    itemName?: string;
}

export function DeleteConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    title = "Delete Report?",
    description = "This action cannot be undone. The item and all its data will be permanently removed from the system.",
    confirmText = "Delete",
    cancelText = "Cancel",
    loading = false,
    itemName,
}: DeleteConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader className="items-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center ">
                        <Trash2 className="w-8 h-8 text-red-600" />
                    </div>
                    <DialogTitle className="text-xl font-semibold ">
                        {itemName ? `Delete ${itemName}?` : title}
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-sm text-muted-foreground ">
                    {description}
                </DialogDescription>
                <DialogFooter className="flex gap-3 w-full">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="destructive"
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
