"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableEmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { DATA_STATUS_LABELS } from "@/lib/constants";
import { STATUS_BADGE_STYLES } from "@/lib/status-styles";
import { formatTonCO2e } from "@/lib/emissions-display";
import { ActivityActionButtons } from "@/modules/activities/components/activity-action-buttons";
import { useActivityActions } from "@/modules/activities/hooks/use-activity-actions";
import {
    getActivityDetails,
    getActivityLabel,
    getActivityMobileRows,
} from "@/modules/activities/utils/format-activity-display";
import type { ActivityListItem } from "@/modules/activities/types";
import type { PaginationInfo } from "@/types/pagination";
import type { DataStatus, SessionUser } from "@/types";

interface ActivitiesListProps {
    activities: ActivityListItem[];
    pagination: PaginationInfo;
    user?: SessionUser | null;
    activityLabels?: Record<string, string>;
}

type StatusUpdate = { id: string; dataStatus: DataStatus };

export function ActivitiesList({
    activities,
    pagination,
    user,
    activityLabels = {},
}: ActivitiesListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const { canSubmit, canApprove, submitActivity, approveActivity } =
        useActivityActions(user);

    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [optimisticActivities, setOptimisticActivities] = useOptimistic(
        activities,
        (state, update: StatusUpdate) =>
            state.map((activity) =>
                activity.id === update.id
                    ? { ...activity, dataStatus: update.dataStatus }
                    : activity,
            ),
    );

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSubmit = async (id: string) => {
        setActionLoadingId(id);
        startTransition(async () => {
            setOptimisticActivities({ id, dataStatus: "submitted" });
            const ok = await submitActivity(id);
            if (ok) router.refresh();
            setActionLoadingId(null);
        });
    };

    const handleApprove = async (id: string, status: "approve" | "reject") => {
        setActionLoadingId(id);
        const dataStatus = status === "approve" ? "approved" : "rejected";
        startTransition(async () => {
            setOptimisticActivities({ id, dataStatus });
            const ok = await approveActivity(id, status);
            if (ok) router.refresh();
            setActionLoadingId(null);
        });
    };

    const emptyState = (
        <TableEmptyState
            title="No activities recorded yet"
            description="Add your first activity to start tracking emissions."
        />
    );

    return (
        <div className="space-y-4">
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Emissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {optimisticActivities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>{emptyState}</TableCell>
                            </TableRow>
                        ) : (
                            optimisticActivities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="font-medium">
                                        {getActivityLabel(activity, activityLabels)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {getActivityDetails(activity)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatTonCO2e(activity.calculatedEmissions)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`text-xs ${STATUS_BADGE_STYLES[activity.dataStatus]}`}
                                        >
                                            {DATA_STATUS_LABELS[activity.dataStatus]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActivityActionButtons
                                            activityId={activity.id}
                                            status={activity.dataStatus}
                                            canSubmit={canSubmit}
                                            canApprove={canApprove}
                                            isLoading={actionLoadingId === activity.id}
                                            onSubmit={handleSubmit}
                                            onApprove={handleApprove}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="md:hidden space-y-3">
                {optimisticActivities.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No activities recorded yet.
                        </CardContent>
                    </Card>
                ) : (
                    optimisticActivities.map((activity) => (
                        <Card key={activity.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">
                                        {getActivityLabel(activity, activityLabels)}
                                    </CardTitle>
                                    <Badge
                                        className={`text-xs ${STATUS_BADGE_STYLES[activity.dataStatus]}`}
                                    >
                                        {DATA_STATUS_LABELS[activity.dataStatus]}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2 text-sm">
                                {getActivityMobileRows(activity).map((row) => (
                                    <div
                                        key={row.label}
                                        className="grid grid-cols-2 gap-2"
                                    >
                                        <span className="text-muted-foreground">
                                            {row.label}:
                                        </span>
                                        <span className="font-medium">{row.value}</span>
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">
                                        Emissions:
                                    </span>
                                    <span className="font-medium">
                                        {formatTonCO2e(activity.calculatedEmissions)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total,
                        )}{" "}
                        of {pagination.total} results
                    </p>
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}
