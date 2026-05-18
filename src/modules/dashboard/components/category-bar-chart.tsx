"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { formatKgCO2 } from "@/lib/utils"

interface CategoryData {
  name: string
  value: number
  color?: string
}

interface CategoryBarChartProps {
  data: CategoryData[]
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
        <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => formatKgCO2(Number(value))} />
        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}