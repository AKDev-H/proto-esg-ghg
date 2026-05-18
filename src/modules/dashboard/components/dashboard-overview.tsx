"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatKgCO2 } from "@/lib/utils"
import { SCOPE_LABELS, SCOPE3_CATEGORY_LABELS } from "@/lib/constants"
import {
  StatCard,
  YearSelector,
  EmptyState,
  ScopePieChart,
  CategoryBarChart,
  TrendLineChart,
} from "./index"

const SCOPE_COLORS = {
  scope1: "#ef4444",
  scope2: "#22c55e",
  scope3: "#3b82f6",
}

const CATEGORY_COLORS = {
  cat1_purchased_goods: "#8b5cf6",
  cat4_upstream_transport: "#06b6d4",
  cat9_downstream_transport: "#f59e0b",
  cat11_product_use: "#ec4899",
  cat12_end_of_life: "#10b981",
}

interface DashboardData {
  total: number
  totalTonCO2e: number
  byScope: Record<string, number>
  byCategory: Record<string, number>
  activityCount: number
}

interface TrendData {
  year: number
  total: number
  scope1: number
  scope2: number
  scope3: number
}

export function DashboardOverview() {
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [data, setData] = useState<DashboardData | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [summaryRes, trendRes] = await Promise.all([
          fetch(`/api/dashboard/summary?year=${year}`),
          fetch(`/api/dashboard/trend?years=${new Date().getFullYear() - 2},${new Date().getFullYear() - 1},${new Date().getFullYear()}`),
        ])

        if (summaryRes.ok) {
          setData(await summaryRes.json())
        }
        if (trendRes.ok) {
          setTrendData(await trendRes.json())
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [year])

  const scopeChartData = data
    ? Object.entries(data.byScope).map(([scope, value]) => ({
        name: SCOPE_LABELS[scope as keyof typeof SCOPE_LABELS],
        value,
        color: SCOPE_COLORS[scope as keyof typeof SCOPE_COLORS],
      }))
    : []

  const categoryChartData = data
    ? Object.entries(data.byCategory).map(([category, value]) => ({
        name: SCOPE3_CATEGORY_LABELS[category as keyof typeof SCOPE3_CATEGORY_LABELS]?.replace("Category ", "").replace(/:.*/, ""),
        value,
        color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
      }))
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const totalTonCO2e = data?.totalTonCO2e ?? 0
  const scope1Ton = ((data?.byScope.scope1 ?? 0) / 1000).toFixed(2)
  const scope2Ton = ((data?.byScope.scope2 ?? 0) / 1000).toFixed(2)
  const scope3Ton = ((data?.byScope.scope3 ?? 0) / 1000).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Emissions Overview</h2>
        <YearSelector value={year} onValueChange={setYear} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Emissions" value={totalTonCO2e.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} unit="tCO2e" />
        <StatCard title="Scope 1" value={scope1Ton} unit="tCO2e (Direct)" />
        <StatCard title="Scope 2" value={scope2Ton} unit="tCO2e (Energy)" />
        <StatCard title="Scope 3" value={scope3Ton} unit="tCO2e (Value Chain)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Scope</CardTitle>
          </CardHeader>
          <CardContent>
            {scopeChartData.length > 0 ? (
              <ScopePieChart data={scopeChartData} />
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scope 3 by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <CategoryBarChart data={categoryChartData} />
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Year-over-Year Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <TrendLineChart data={trendData} />
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Badge variant="outline">{data?.activityCount || 0} activities</Badge>
        <Badge variant="secondary">Last updated: {new Date().toLocaleDateString()}</Badge>
      </div>
    </div>
  )
}