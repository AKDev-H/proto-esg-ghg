"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    createActivityWithDetails,
    type CreateActivityPayload,
} from "@/modules/activities/services/create-activity";

interface UseCreateActivityFormOptions {
    onSuccess?: () => void;
}

export function useCreateActivityForm({
    onSuccess,
}: UseCreateActivityFormOptions = {}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactorId, setSelectedFactorId] = useState("");

    const submit = async (
        createPayload: CreateActivityPayload,
        detailsPayload?: Record<string, unknown>,
    ) => {
        setIsSubmitting(true);
        try {
            const result = await createActivityWithDetails(
                {
                    ...createPayload,
                    emissionFactorId:
                        createPayload.emissionFactorId ||
                        selectedFactorId ||
                        undefined,
                },
                detailsPayload,
            );

            if (result) {
                router.refresh();
                setSelectedFactorId("");
                onSuccess?.();
                return true;
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetFactor = () => setSelectedFactorId("");

    return {
        isSubmitting,
        selectedFactorId,
        setSelectedFactorId,
        submit,
        resetFactor,
    };
}
