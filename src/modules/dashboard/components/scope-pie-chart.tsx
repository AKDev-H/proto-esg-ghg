"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatKgCO2 } from "@/lib/utils"

interface ScopeData {
  name: string
  value: number
  color: string
}

interface ScopePieChartProps {
  data: ScopeData[]
}

export function ScopePieChart({ data }: ScopePieChartProps) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatKgCO2(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}