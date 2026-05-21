"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
} from "recharts";
import { formatChartAxis, formatChartValue } from "@/lib/emissions-display";
import { ChartTooltip } from "./chart-tooltip";

interface TrendData {
    year: number;
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
}

interface TrendLineChartProps {
    data: TrendData[];
}

const SERIES = [
    { key: "scope1", label: "Scope 1 · Direct", color: "#ef4444" },
    { key: "scope2", label: "Scope 2 · Energy", color: "#22c55e" },
    { key: "scope3", label: "Scope 3 · Value Chain", color: "#3b82f6" },
    { key: "total", label: "Total", color: "#1f2937" },
] as const;

export function TrendLineChart({ data }: TrendLineChartProps) {
    if (data.length === 0) return null;

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Compare emissions across the last 3 reporting years (tCO2e)
            </p>
            <ResponsiveContainer width="100%" height={320}>
                <LineChart
                    data={data}
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        className="stroke-border/60"
                    />
                    <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        padding={{ left: 16, right: 16 }}
                    />
                    <YAxis
                        tickFormatter={formatChartAxis}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                        label={{
                            value: "tCO2e",
                            angle: -90,
                            position: "insideLeft",
                            style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                        }}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                                <ChartTooltip
                                    active={active}
                                    label={label}
                                    title={`Year ${label}`}
                                    rows={SERIES.map((series) => ({
                                        label: series.label,
                                        value: Number(
                                            payload.find((p) => p.dataKey === series.key)
                                                ?.value ?? 0,
                                        ),
                                        color: series.color,
                                    }))}
                                />
                            );
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={40}
                        formatter={(value) => (
                            <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                    />
                    {SERIES.map((series) => (
                        <Line
                            key={series.key}
                            type="monotone"
                            dataKey={series.key}
                            name={series.label}
                            stroke={series.color}
                            strokeWidth={series.key === "total" ? 2.5 : 2}
                            strokeDasharray={series.key === "total" ? "6 4" : undefined}
                            dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
