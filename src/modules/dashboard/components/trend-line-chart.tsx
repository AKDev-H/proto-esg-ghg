"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatKgCO2 } from "@/lib/utils"

interface TrendData {
  year: number
  total: number
  scope1: number
  scope2: number
  scope3: number
}

interface TrendLineChartProps {
  data: TrendData[]
}

const SCOPE_COLORS = {
  scope1: "#ef4444",
  scope2: "#22c55e",
  scope3: "#3b82f6",
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="year" />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatKgCO2(Number(value))} />
        <Legend />
        <Line type="monotone" dataKey="scope1" stroke={SCOPE_COLORS.scope1} name="Scope 1" strokeWidth={2} />
        <Line type="monotone" dataKey="scope2" stroke={SCOPE_COLORS.scope2} name="Scope 2" strokeWidth={2} />
        <Line type="monotone" dataKey="scope3" stroke={SCOPE_COLORS.scope3} name="Scope 3" strokeWidth={2} />
        <Line type="monotone" dataKey="total" stroke="#1f2937" name="Total" strokeWidth={3} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  )
}