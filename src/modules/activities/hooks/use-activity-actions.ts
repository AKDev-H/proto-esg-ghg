"use client";

import {
    canSubmitActivities,
    canApproveActivities,
} from "@/lib/permissions";
import type { SessionUser } from "@/types";

export function useActivityActions(user?: SessionUser | null) {
    const canSubmit = canSubmitActivities(user?.role);
    const canApprove = canApproveActivities(user?.role);

    const submitActivity = async (id: string): Promise<boolean> => {
        const response = await fetch(`/api/activities/${id}/submit`, {
            method: "POST",
        });
        return response.ok;
    };

    const approveActivity = async (
        id: string,
        status: "approve" | "reject",
    ): Promise<boolean> => {
        const response = await fetch(`/api/activities/${id}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        return response.ok;
    };

    return { canSubmit, canApprove, submitActivity, approveActivity };
}
