"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
} from "recharts"
import { formatChartAxis } from "@/lib/emissions-display"
import { ChartTooltip } from "./chart-tooltip"

interface TrendItem {
    year: number
    total: number
    scope1: number
    scope2: number
    scope3: number
}

interface TrendStackedBarChartProps {
    data: TrendItem[]
}

const SERIES = [
    { key: "scope1", label: "Scope 1 · Direct", color: "#f97316" }, // Orange-red
    { key: "scope2", label: "Scope 2 · Energy", color: "#3b82f6" }, // Blue
    { key: "scope3", label: "Scope 3 · Value Chain", color: "#10b981" }, // Green
] as const

export function TrendStackedBarChart({ data }: TrendStackedBarChartProps) {
    if (data.length === 0) return null

    // Convert values from kg to tons for display
    const chartData = data.map((item) => ({
        year: `FY${item.year}`,
        scope1: Math.round((item.scope1 / 1000) * 10) / 10,
        scope2: Math.round((item.scope2 / 1000) * 10) / 10,
        scope3: Math.round((item.scope3 / 1000) * 10) / 10,
        total: Math.round((item.total / 1000) * 10) / 10,
    }))

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Emissions trend by scope (tCO2e)
            </p>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={chartData}
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
                            if (!active || !payload?.length) return null
                            return (
                                <ChartTooltip
                                    active={active}
                                    label={label}
                                    title={`Year ${label}`}
                                    rows={[
                                        ...SERIES.map((series) => ({
                                            label: series.label,
                                            value: Number(
                                                payload.find((p) => p.dataKey === series.key)
                                                    ?.value ?? 0,
                                            ),
                                            color: series.color,
                                        })),
                                        {
                                            label: "Total Emissions",
                                            value: chartData.find((d) => d.year === label)?.total ?? 0,
                                            color: "#1f2937",
                                        }
                                    ]}
                                />
                            )
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={40}
                        iconType="rect"
                        iconSize={12}
                        formatter={(value) => (
                            <span className="text-xs text-muted-foreground font-medium">{value}</span>
                        )}
                    />
                    {SERIES.map((series) => (
                        <Bar
                            key={series.key}
                            dataKey={series.key}
                            name={series.label}
                            fill={series.color}
                            stackId="a"
                            maxBarSize={48}
                            radius={series.key === "scope3" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
