"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        async function checkRole() {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.role !== "super_admin") {
                        router.push("/dashboard");
                    } else {
                        setAuthorized(true);
                    }
                } else {
                    router.push("/login");
                }
            } catch {
                router.push("/login");
            }
        }
        checkRole();
    }, [router]);

    if (!authorized) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return <>{children}</>;
}