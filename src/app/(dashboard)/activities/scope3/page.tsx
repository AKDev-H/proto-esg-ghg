import { Scope3Forms } from "@/components/scope3/Scope3Forms";
import {
    ScopeActivitiesSection,
    fetchScopeActivitiesPageData,
} from "@/modules/activities";
import { auth } from "@/lib/auth";
import { canCreateActivities } from "@/lib/permissions";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{ page?: string }>;
}

export default async function Scope3Page({ searchParams }: Props) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const isSuperAdmin = session?.user?.role === "super_admin";
    const showActivityForm = canCreateActivities(session?.user?.role);

    const { activities, factors, pagination } =
        await fetchScopeActivitiesPageData(
            "scope3",
            organizationId,
            isSuperAdmin,
            page,
        );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">
                Scope 3: Value Chain Emissions
            </h1>

            {showActivityForm && <Scope3Forms factors={factors} />}

            <ScopeActivitiesSection
                key={`scope3-${page}`}
                activities={activities}
                pagination={pagination}
                user={session?.user}
                scope="scope3"
            />
        </div>
    );
}
