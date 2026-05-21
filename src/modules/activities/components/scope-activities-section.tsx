import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivitiesList } from "@/modules/activities/components/activities-list";
import type { ActivityListItem } from "@/modules/activities/types";
import type { PaginationInfo } from "@/types/pagination";
import type { EmissionScope, SessionUser } from "@/types";

interface ScopeActivitiesSectionProps {
    activities: ActivityListItem[];
    pagination: PaginationInfo;
    user?: SessionUser | null;
    scope: EmissionScope;
    activityLabels?: Record<string, string>;
    title?: string;
}

export function ScopeActivitiesSection({
    activities,
    pagination,
    user,
    scope,
    activityLabels,
    title = "Recent Activities",
}: ScopeActivitiesSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ActivitiesList
                    activities={activities}
                    pagination={pagination}
                    user={user}
                    activityLabels={activityLabels}
                />
            </CardContent>
        </Card>
    );
}

interface ScopeFormSectionProps {
    title: string;
    children: React.ReactNode;
}

export function ScopeFormSection({ title, children }: ScopeFormSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
