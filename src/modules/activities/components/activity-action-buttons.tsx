"use client";

import { Button } from "@/components/ui/button";
import type { DataStatus } from "@/types";

interface ActivityActionButtonsProps {
    activityId: string;
    status: DataStatus;
    canSubmit: boolean;
    canApprove: boolean;
    isLoading?: boolean;
    onSubmit: (id: string) => void;
    onApprove: (id: string, status: "approve" | "reject") => void;
}

export function ActivityActionButtons({
    activityId,
    status,
    canSubmit,
    canApprove,
    isLoading = false,
    onSubmit,
    onApprove,
}: ActivityActionButtonsProps) {
    if (status === "draft" && canSubmit) {
        return (
            <Button
                size="sm"
                disabled={isLoading}
                onClick={() => onSubmit(activityId)}
            >
                {isLoading ? "Submitting..." : "Submit"}
            </Button>
        );
    }

    if (status === "submitted" && canApprove) {
        return (
            <div className="flex gap-1">
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => onApprove(activityId, "reject")}
                >
                    Reject
                </Button>
                <Button
                    size="sm"
                    disabled={isLoading}
                    onClick={() => onApprove(activityId, "approve")}
                >
                    Approve
                </Button>
            </div>
        );
    }

    return null;
}
