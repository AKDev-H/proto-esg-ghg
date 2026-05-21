"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
    LabelList,
} from "recharts";
import { formatChartAxis, formatChartValue } from "@/lib/emissions-display";
import { ChartTooltip } from "./chart-tooltip";

interface CategoryData {
    name: string;
    fullName?: string;
    value: number;
    color?: string;
}

interface CategoryBarChartProps {
    data: CategoryData[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
    if (data.length === 0) return null;

    const chartHeight = Math.max(260, data.length * 44);

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Top Scope 3 categories by emissions (tCO2e)
            </p>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        className="stroke-border/60"
                    />
                    <XAxis
                        type="number"
                        tickFormatter={formatChartAxis}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={128}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const item = payload[0]?.payload as CategoryData;
                            return (
                                <ChartTooltip
                                    active={active}
                                    label={label}
                                    title={item.fullName ?? item.name}
                                    rows={[
                                        {
                                            label: "Emissions",
                                            value: item.value,
                                            color: item.color,
                                        },
                                    ]}
                                />
                            );
                        }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={entry.color ?? "#3b82f6"} />
                        ))}
                        <LabelList
                            dataKey="value"
                            position="right"
                            formatter={(value: number) => formatChartValue(Number(value))}
                            className="fill-foreground text-[11px] font-medium"
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
