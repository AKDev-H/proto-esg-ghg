"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatPercent } from "@/lib/emissions-display"
import { ChartTooltip } from "./chart-tooltip"

interface EnergyMixItem {
    name: string
    value: number
    color: string
}

interface EnergyMixChartProps {
    data: EnergyMixItem[]
}

export function EnergyMixChart({ data }: EnergyMixChartProps) {
    if (data.length === 0) return null

    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Format energy values for display (convert to kWh format or just numbers)
    const formatEnergyValue = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M kWh`
        if (value >= 1000) return `${(value / 1000).toFixed(1)}k kWh`
        return `${value} kWh`
    }

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Distribution of energy consumption (kWh equivalent)
            </p>
            <div className="mx-auto w-full max-w-sm">
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null
                                const item = payload[0]?.payload as EnergyMixItem
                                return (
                                    <ChartTooltip
                                        active={active}
                                        title={item.name}
                                        rows={[
                                            {
                                                label: "Energy Consumed",
                                                value: item.value,
                                                color: item.color,
                                                total,
                                            },
                                        ]}
                                    />
                                )
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            formatter={(value, entry) => {
                                const item = entry.payload as EnergyMixItem | undefined
                                const percent = item ? formatPercent(item.value, total) : ""
                                return (
                                    <span className="text-[11px] text-muted-foreground font-medium">
                                        {value} ({percent})
                                    </span>
                                )
                            }}
                        />
                        <text
                            x="50%"
                            y="45%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-foreground text-lg font-bold"
                        >
                            {formatEnergyValue(total)}
                        </text>
                        <text
                            x="50%"
                            y="55%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-muted-foreground text-xs"
                        >
                            Total Energy
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
