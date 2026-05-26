import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageSuppliers } from "@/lib/permissions";
import { SupplierEngagement } from "@/modules/suppliers/components/supplier-engagement";

export default async function SuppliersPage() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect("/login");
    }

    return (
        <SupplierEngagement
            canManage={canManageSuppliers(session.user.role)}
        />
    );
}
