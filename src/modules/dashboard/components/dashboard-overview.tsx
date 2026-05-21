"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SCOPE_LABELS } from "@/lib/constants"
import { SCOPE3_CATEGORY_LABELS, SCOPE3_CATEGORY_SHORT_LABELS, type Scope3Category } from "@/types"
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
} as const

const CATEGORY_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ec4899",
  "#10b981",
  "#6366f1",
  "#14b8a6",
  "#f97316",
  "#a855f7",
  "#22c55e",
  "#3b82f6",
  "#ef4444",
  "#64748b",
]

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

function buildTrendYears() {
  const currentYear = new Date().getFullYear()
  return [currentYear - 2, currentYear - 1, currentYear]
}

function fillTrendYears(data: TrendData[]): TrendData[] {
  return buildTrendYears().map((year) => {
    const existing = data.find((item) => item.year === year)
    return (
      existing ?? {
        year,
        total: 0,
        scope1: 0,
        scope2: 0,
        scope3: 0,
      }
    )
  })
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
        const trendYears = buildTrendYears().join(",")
        const [summaryRes, trendRes] = await Promise.all([
          fetch(`/api/dashboard/summary?year=${year}`),
          fetch(`/api/dashboard/trend?years=${trendYears}`),
        ])

        if (summaryRes.ok) {
          setData(await summaryRes.json())
        }
        if (trendRes.ok) {
          setTrendData(fillTrendYears(await trendRes.json()))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [year])

  const scopeChartData = useMemo(() => {
    if (!data) return []
    return (["scope1", "scope2", "scope3"] as const)
      .map((scope) => ({
        name: SCOPE_LABELS[scope],
        value: data.byScope[scope] ?? 0,
        color: SCOPE_COLORS[scope],
      }))
      .filter((item) => item.value > 0)
  }, [data])

  const categoryChartData = useMemo(() => {
    if (!data) return []
    return Object.entries(data.byCategory)
      .map(([category, value], index) => {
        const key = category as Scope3Category
        return {
          name: SCOPE3_CATEGORY_SHORT_LABELS[key] ?? category.replace(/_/g, " "),
          fullName: SCOPE3_CATEGORY_LABELS[key] ?? category,
          value,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [data])

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
  const hasEmissions = totalTonCO2e > 0

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {year} reporting year · approved and draft activities
        </p>
        <YearSelector value={year} onValueChange={setYear} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Emissions"
          value={totalTonCO2e.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          unit="tCO2e"
          description="All scopes combined"
        />
        <StatCard title="Scope 1" value={scope1Ton} unit="tCO2e" description="Direct emissions" />
        <StatCard title="Scope 2" value={scope2Ton} unit="tCO2e" description="Purchased energy" />
        <StatCard title="Scope 3" value={scope3Ton} unit="tCO2e" description="Value chain" />
      </div>

      {!hasEmissions ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState message="No emissions recorded for this year yet. Add Scope 1, 2, or 3 activities to see charts." />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Emissions by Scope</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-6 sm:px-6">
                {scopeChartData.length > 0 ? (
                  <ScopePieChart data={scopeChartData} />
                ) : (
                  <EmptyState message="No scope breakdown available" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scope 3 by Category</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-6 sm:px-6">
                {categoryChartData.length > 0 ? (
                  <CategoryBarChart data={categoryChartData} />
                ) : (
                  <EmptyState message="No Scope 3 category data yet" />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Trend</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-6 sm:px-6">
              <TrendLineChart data={trendData} />
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{data?.activityCount || 0} activities</Badge>
        <Badge variant="secondary">Reporting year {year}</Badge>
      </div>
    </section>
  )
}
