import { cn } from "@/lib/utils";

export const pageContainerClassName =
    "mx-auto w-full max-w-6xl px-6 sm:px-8 md:px-10 lg:px-12";

type PageContainerProps = {
    children: React.ReactNode;
    className?: string;
    as?: "div" | "main" | "header";
};

export function PageContainer({
    children,
    className,
    as: Component = "div",
}: PageContainerProps) {
    return (
        <Component className={cn(pageContainerClassName, className)}>
            {children}
        </Component>
    );
}
