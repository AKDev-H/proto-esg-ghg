"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatChartValue, formatPercent } from "@/lib/emissions-display";
import { ChartTooltip } from "./chart-tooltip";

interface ScopeData {
    name: string;
    value: number;
    color: string;
}

interface ScopePieChartProps {
    data: ScopeData[];
}

export function ScopePieChart({ data }: ScopePieChartProps) {
    if (data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Share of total emissions by scope
            </p>
            <div className="mx-auto w-full max-w-sm">
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={108}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const item = payload[0]?.payload as ScopeData;
                            return (
                                <ChartTooltip
                                    active={active}
                                    title={item.name}
                                    rows={[
                                        {
                                            label: "Emissions",
                                            value: item.value,
                                            color: item.color,
                                            total,
                                        },
                                    ]}
                                />
                            );
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        formatter={(value, entry) => {
                            const item = entry.payload as ScopeData | undefined;
                            const percent = item ? formatPercent(item.value, total) : "";
                            return (
                                <span className="text-xs text-muted-foreground">
                                    {value} · {percent}
                                </span>
                            );
                        }}
                    />
                    <text
                        x="50%"
                        y="48%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-xl font-bold"
                    >
                        {formatChartValue(total)}
                    </text>
                    <text
                        x="50%"
                        y="58%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-xs"
                    >
                        Total
                    </text>
                </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
