export interface CreateActivityPayload {
    scope: "scope1" | "scope2" | "scope3";
    activityType: string;
    inputValue: number;
    inputUnit: string;
    emissionFactorId?: string;
    scope3Category?: string;
    scope3Details?: Record<string, unknown>;
    comments?: string;
    facilityId?: string;
    reportingYearId?: string;
}

export async function createActivityWithDetails(
    createPayload: CreateActivityPayload,
    detailsPayload?: Record<string, unknown>,
): Promise<{ id: string } | null> {
    const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
    });

    if (!response.ok) return null;

    const activity = await response.json();

    if (detailsPayload) {
        await fetch(`/api/activities/${activity.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(detailsPayload),
        });
    }

    return activity;
}
