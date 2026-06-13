import { Scope1Form } from "@/components/scope1/Scope1Form";
import { SeeFormulaeModal } from "@/components/calculations/SeeFormulaeModal";
import {
    ScopeActivitiesSection,
    ScopeFormSection,
    fetchScopeActivitiesPageData,
    SCOPE1_ACTIVITY_LABELS,
} from "@/modules/activities";
import { auth } from "@/lib/auth";
import { canCreateActivities } from "@/lib/permissions";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{ page?: string }>;
}

export default async function Scope1Page({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const isSuperAdmin = session?.user?.role === "super_admin";
    const showActivityForm = canCreateActivities(session?.user?.role);

    const { activities, factors, pagination } =
        await fetchScopeActivitiesPageData(
            "scope1",
            organizationId,
            isSuperAdmin,
            page,
        );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold">Scope 1: Direct Emissions</h1>
                <SeeFormulaeModal scope="scope1" />
            </div>

            {showActivityForm && (
                <ScopeFormSection title="Add Activity">
                    <Scope1Form factors={factors} />
                </ScopeFormSection>
            )}

            <ScopeActivitiesSection
                key={`scope1-${page}`}
                activities={activities}
                pagination={pagination}
                user={session?.user}
                scope="scope1"
                activityLabels={SCOPE1_ACTIVITY_LABELS}
            />
        </div>
    );
}
