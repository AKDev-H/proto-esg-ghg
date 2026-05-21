import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/components";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50">
            <Suspense
                fallback={
                    <div className="text-sm text-muted-foreground">
                        Loading...
                    </div>
                }
            >
                <LoginForm />
            </Suspense>
        </div>
    );
}
