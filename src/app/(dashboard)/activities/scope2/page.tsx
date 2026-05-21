import { Scope2Form } from "@/components/scope2/Scope2Form";
import {
    ScopeActivitiesSection,
    ScopeFormSection,
    fetchScopeActivitiesPageData,
    SCOPE2_ACTIVITY_LABELS,
} from "@/modules/activities";
import { auth } from "@/lib/auth";
import { canCreateActivities } from "@/lib/permissions";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{ page?: string }>;
}

export default async function Scope2Page({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const isSuperAdmin = session?.user?.role === "super_admin";
    const showActivityForm = canCreateActivities(session?.user?.role);

    const { activities, factors, pagination } =
        await fetchScopeActivitiesPageData(
            "scope2",
            organizationId,
            isSuperAdmin,
            page,
        );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">
                Scope 2: Indirect Energy Emissions
            </h1>

            {showActivityForm && (
                <ScopeFormSection title="Add Electricity Consumption">
                    <Scope2Form factors={factors} />
                </ScopeFormSection>
            )}

            <ScopeActivitiesSection
                key={`scope2-${page}`}
                activities={activities}
                pagination={pagination}
                user={session?.user}
                scope="scope2"
                activityLabels={SCOPE2_ACTIVITY_LABELS}
            />
        </div>
    );
}
