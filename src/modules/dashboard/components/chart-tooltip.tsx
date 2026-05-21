"use client";

import type { TooltipProps } from "recharts";
import { formatChartValue, formatPercent } from "@/lib/emissions-display";

interface ChartTooltipRow {
    label: string;
    value: number;
    color?: string;
    total?: number;
}

export function ChartTooltip({
    active,
    label,
    title,
    rows,
}: TooltipProps<number, string> & {
    title?: string;
    rows?: ChartTooltipRow[];
}) {
    if (!active || !rows?.length) return null;

    const total = rows.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
            {(title ?? label) && (
                <p className="mb-2 font-semibold text-foreground">{title ?? label}</p>
            )}
            <div className="space-y-1">
                {rows.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between gap-4"
                    >
                        <span className="flex items-center gap-2 text-muted-foreground">
                            {item.color && (
                                <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                            )}
                            {item.label}
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                            {formatChartValue(item.value)}
                            {item.total != null && item.total > 0 && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                    ({formatPercent(item.value, item.total)})
                                </span>
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
