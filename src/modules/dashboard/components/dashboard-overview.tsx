"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  TrendingDown, 
  Zap, 
  Trash2, 
  Droplet,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  FileDown
} from "lucide-react"
import { SCOPE_LABELS } from "@/lib/constants"
import { SCOPE3_CATEGORY_LABELS, SCOPE3_CATEGORY_SHORT_LABELS, type Scope3Category } from "@/types"
import {
  StatCard,
  YearSelector,
  EmptyState,
  ScopePieChart,
  CategoryBarChart,
  TrendStackedBarChart,
  EnergyMixChart,
  ReductionTargetProgress,
} from "./index"

interface MetricInfo {
  value: number
  unit: string
  yoy: {
    percent: number
    text: string
    isIncrease: boolean
  }
}

interface DashboardData {
  reportingYear: number
  organization: {
    name: string
    country: string
    currency: string
    reportingStatus: string
  }
  total: number
  totalTonCO2e: number
  byScope: Record<string, number>
  byCategory: Record<string, number>
  activityCount: number
  metrics: {
    emissions: MetricInfo
    intensity: MetricInfo
    energy: MetricInfo
    renewable: MetricInfo
    water: MetricInfo
    waste: MetricInfo
  }
  details: {
    scope1: {
      generators: number
      refrigerants: number
      fleet: number
      processGases: number
    }
    scope2: {
      gridLocal: number
      gridMarket: number
      purchasedSteam: number
      reCertificates: number
    }
    scope3: {
      purchasedGoods: number
      capitalGoods: number
      fuelEnergy: number
      upstreamTransport: number
      waste: number
      businessTravel: number
      employeeCommute: number
      downstreamTransport: number
      productUse: number
      endOfLife: number
    }
  }
  energyMix: Array<{ name: string; value: number; color: string }>
  reductionTarget: {
    baseYear: number
    scope1: { actual: number; target: number }
    scope2: { actual: number; target: number }
    scope3: { actual: number; target: number }
  }
  workforce: {
    headcount: number
    femalePercent: number
    localHiresPercent: number
    trainingHours: number
    lostTimeInjuryRate: number
    voluntaryTurnover: number
  }
  supplyChain: {
    totalSuppliers: number
    screenedPercent: number
    cocSignedPercent: number
    highRiskAuditedPercent: number
  }
  governance: {
    badges: Array<{ label: string; active: boolean; color: string }>
    boardEsgOversight: string
    esgLinkedRemuneration: string
    dataPrivacyIncidents: number
    environmentalFines: number
    pendingApprovalsCount: number
  }
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
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/dashboard/export-pdf?year=${year}`)
      if (res.ok) {
        const result = await res.json()
        if (result.pdfBase64) {
          const binaryString = atob(result.pdfBase64)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const blob = new Blob([bytes], { type: "application/pdf" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = result.fileName || `ESG_Dashboard_Report_${year}.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      } else {
        console.error("Failed to export PDF: API error status", res.status)
      }
    } catch (error) {
      console.error("Failed to export PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

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

  const categoryChartData = useMemo(() => {
    if (!data) return []
    const colors = [
      "#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899", "#10b981", 
      "#6366f1", "#14b8a6", "#f97316", "#a855f7", "#22c55e"
    ]
    return Object.entries(data.byCategory)
      .map(([category, value], index) => {
        const key = category as Scope3Category
        return {
          name: SCOPE3_CATEGORY_SHORT_LABELS[key] ?? category.replace(/_/g, " "),
          fullName: SCOPE3_CATEGORY_LABELS[key] ?? category,
          value: Math.round((value / 1000) * 10) / 10,
          color: colors[index % colors.length],
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

  const hasEmissions = data && data.total > 0
  const hasTrendData = trendData && trendData.some(d => d.total > 0)

  // Helpers for badge styles
  const getBadgeStyle = (color: string) => {
    switch (color) {
      case "green":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
      case "brown":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Helper for trend arrow and color
  // decrease is GOOD for: emissions, intensity, energy, water
  // increase is GOOD for: renewable, waste
  const renderYoY = (yoy: MetricInfo["yoy"], isMetricIncreaseGood = false) => {
    if (!yoy || yoy.percent === 0) return <span className="text-xs text-muted-foreground">No change</span>
    
    const isBeneficial = isMetricIncreaseGood ? yoy.isIncrease : !yoy.isIncrease
    const colorClass = isBeneficial ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
    
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${colorClass}`}>
        {yoy.isIncrease ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {yoy.text}
      </span>
    )
  }

  return (
    <section className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {data?.organization?.name || "Organization"}
            </h2>
            <Badge variant="outline" className="text-xs capitalize">
              FY{year} · Scopes 1–3
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {year} Reporting Year · Data Status: <span className="font-semibold capitalize text-foreground">{data?.organization?.reportingStatus}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <YearSelector value={year} onValueChange={setYear} />
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {isExporting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-muted-foreground" />
                <span>Export PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Overview & Emissions</TabsTrigger>
          <TabsTrigger value="supplyChain">Supply Chain ESG</TabsTrigger>
          <TabsTrigger value="socialGovernance">Social & Governance</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & EMISSIONS */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          {/* Top 6 Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Card 1: Total GHG emissions */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground">Total GHG emissions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {data?.metrics.emissions.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) ?? 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium mb-2">{data?.metrics.emissions.unit ?? "tCO2e"} / year</div>
                {data?.metrics.emissions.yoy && renderYoY(data.metrics.emissions.yoy, false)}
              </CardContent>
            </Card>

            {/* Card 2: Emission intensity */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground">Emission intensity</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {data?.metrics.intensity.value.toFixed(2) ?? "0.00"}
                </div>
                <div className="text-xs text-muted-foreground font-medium mb-2">{data?.metrics.intensity.unit ?? "tCO2e/m"}</div>
                {data?.metrics.intensity.yoy && renderYoY(data.metrics.intensity.yoy, false)}
              </CardContent>
            </Card>

            {/* Card 3: Energy consumed */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground">Energy consumed</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {data?.metrics.energy.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium mb-2">{data?.metrics.energy.unit ?? "GJ"}</div>
                {data?.metrics.energy.yoy && renderYoY(data.metrics.energy.yoy, false)}
              </CardContent>
            </Card>

            {/* Card 4: Renewable energy */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground">Renewable energy</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {data?.metrics.renewable.value ?? 0}%
                </div>
                <div className="text-xs text-muted-foreground font-medium mb-2">{data?.metrics.renewable.unit ?? "%"}</div>
                {data?.metrics.renewable.yoy && renderYoY(data.metrics.renewable.yoy, true)}
              </CardContent>
            </Card>

            {/* Card 5: Water withdrawn */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground">Water withdrawn</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {data?.metrics.water.value.toLocaleString() ?? 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium mb-2">{data?.metrics.water.unit ?? "m³"}</div>
                {data?.metrics.water.yoy && renderYoY(data.metrics.water.yoy, false)}
              </CardContent>
            </Card>

            {/* Card 6: Waste recycled */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium text-muted-foreground">Waste recycled</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {data?.metrics.waste.value ?? 0}%
                </div>
                <div className="text-xs text-muted-foreground font-medium mb-2">{data?.metrics.waste.unit ?? "%"}</div>
                {data?.metrics.waste.yoy && renderYoY(data.metrics.waste.yoy, true)}
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Emissions Trend</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                {hasTrendData ? (
                  <TrendStackedBarChart data={trendData} />
                ) : (
                  <EmptyState message="No emissions trend data available yet." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Reduction Target Progress</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                {hasEmissions && data ? (
                  <ReductionTargetProgress
                    baseYear={data.reductionTarget.baseYear}
                    scope1={data.reductionTarget.scope1}
                    scope2={data.reductionTarget.scope2}
                    scope3={data.reductionTarget.scope3}
                  />
                ) : (
                  <EmptyState message="No reduction targets target progress available for this year." />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Energy Mix</CardTitle>
              </CardHeader>
              <CardContent className="pb-6 flex justify-center">
                {data && data.energyMix.length > 0 ? (
                  <EnergyMixChart data={data.energyMix} />
                ) : (
                  <EmptyState message="No energy consumption recorded for this year yet." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Scope 3 Categories</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                {categoryChartData.length > 0 ? (
                  <CategoryBarChart data={categoryChartData} />
                ) : (
                  <EmptyState message="No Scope 3 category data available for this year" />
                )}
              </CardContent>
            </Card>
          </div>


            {/* GHG EMISSIONS BY SCOPE Detailed Lists */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">GHG Emissions by Scope</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Scope 1: Direct */}
                <Card className="flex flex-col">
                  <CardHeader className="bg-orange-50/20 dark:bg-orange-950/5 p-4 pb-3 border-b border-orange-100/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">Scope 1</Badge>
                      <CardTitle className="text-sm font-semibold">Direct Emissions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Diesel generators</span>
                        <span className="font-medium">{((data?.details.scope1.generators ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Refrigerants (HFCs)</span>
                        <span className="font-medium">{((data?.details.scope1.refrigerants ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Company fleet</span>
                        <span className="font-medium">{((data?.details.scope1.fleet ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Process gases</span>
                        <span className="font-medium">{((data?.details.scope1.processGases ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t flex justify-between items-center text-sm font-bold text-orange-600 dark:text-orange-400">
                      <span>Total</span>
                      <span>
                        {((data?.byScope.scope1 ?? 0) / 1000).toFixed(1)} tCO2e · {data && data.total > 0 ? ((data.byScope.scope1 / data.total) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Scope 2: Indirect */}
                <Card className="flex flex-col">
                  <CardHeader className="bg-blue-50/20 dark:bg-blue-950/5 p-4 pb-3 border-b border-blue-100/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Scope 2</Badge>
                      <CardTitle className="text-sm font-semibold">Energy Indirect</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Grid electricity (loc.)</span>
                        <span className="font-medium">{((data?.details.scope2.gridLocal ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Grid electricity (mkt.)</span>
                        <span className="font-medium">{((data?.details.scope2.gridMarket ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Purchased steam</span>
                        <span className="font-medium">{((data?.details.scope2.purchasedSteam ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">RE certificates</span>
                        <span className="font-medium text-emerald-600">-{((data?.details.scope2.reCertificates ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t flex justify-between items-center text-sm font-bold text-blue-600 dark:text-blue-400">
                      <span>Total</span>
                      <span>
                        {((data?.byScope.scope2 ?? 0) / 1000).toFixed(1)} tCO2e · {data && data.total > 0 ? ((data.byScope.scope2 / data.total) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Scope 3: Value Chain */}
                <Card className="flex flex-col">
                  <CardHeader className="bg-emerald-50/20 dark:bg-emerald-950/5 p-4 pb-3 border-b border-emerald-100/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Scope 3</Badge>
                      <CardTitle className="text-sm font-semibold">Value Chain</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Purchased goods & svcs</span>
                        <span className="font-medium">{((data?.details.scope3.purchasedGoods ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Capital goods</span>
                        <span className="font-medium">{((data?.details.scope3.capitalGoods ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Business travel</span>
                        <span className="font-medium">{((data?.details.scope3.businessTravel ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Employee commute</span>
                        <span className="font-medium">{((data?.details.scope3.employeeCommute ?? 0) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Logistics (Cat. 4 & 9)</span>
                        <span className="font-medium">{(((data?.details.scope3.upstreamTransport ?? 0) + (data?.details.scope3.downstreamTransport ?? 0)) / 1000).toFixed(1)} tCO2e</span>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t flex justify-between items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Total</span>
                      <span>
                        {((data?.byScope.scope3 ?? 0) / 1000).toFixed(1)} tCO2e · {data && data.total > 0 ? ((data.byScope.scope3 / data.total) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: SUPPLY CHAIN ESG */}
          <TabsContent value="supplyChain" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Supply Chain ESG Metrics</CardTitle>
                  <CardDescription>ESG Performance & Screening across the supply chain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  {/* Metric 1 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Suppliers screened on ESG criteria</span>
                      <span className="font-bold text-foreground">{data?.supplyChain?.screenedPercent ?? 0}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-600" 
                        style={{ width: `${data?.supplyChain?.screenedPercent ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Suppliers signed Code of Conduct</span>
                      <span className="font-bold text-foreground">{data?.supplyChain?.cocSignedPercent ?? 0}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-blue-600" 
                        style={{ width: `${data?.supplyChain?.cocSignedPercent ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">High-risk suppliers audited</span>
                      <span className="font-bold text-foreground">{data?.supplyChain?.highRiskAuditedPercent ?? 0}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-amber-500" 
                        style={{ width: `${data?.supplyChain?.highRiskAuditedPercent ?? 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Supply Chain Status</CardTitle>
                  <CardDescription>Overview of active vendors and questionnaire response</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div>
                      <h4 className="text-sm font-semibold">Total Suppliers registered</h4>
                      <p className="text-xs text-muted-foreground">Vendor profiles active in system</p>
                    </div>
                    <span className="text-2xl font-bold">{data?.supplyChain?.totalSuppliers ?? 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div>
                      <h4 className="text-sm font-semibold">High-Risk Materials Vendors</h4>
                      <p className="text-xs text-muted-foreground">Metals and chemical suppliers screened</p>
                    </div>
                    <span className="text-sm font-bold px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 rounded-full">
                      Priority Screened
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div>
                      <h4 className="text-sm font-semibold">SBTi Target Alignment</h4>
                      <p className="text-xs text-muted-foreground">Suppliers with approved targets committed</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 border-emerald-200">
                        Active commitment
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: SOCIAL & GOVERNANCE */}
          <TabsContent value="socialGovernance" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Workforce (Social) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Workforce Metrics</CardTitle>
                  <CardDescription>Social disclosures and training parameters</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Total headcount</span>
                      <span className="font-semibold">{data?.workforce?.headcount ?? 0} employees</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Female employees</span>
                      <span className="font-semibold">{data?.workforce?.femalePercent ?? 0}%</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Local hires ({data?.organization?.country === "MY" ? "MY" : "US"})</span>
                      <span className="font-semibold">{data?.workforce?.localHiresPercent ?? 0}%</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Training hours / employee</span>
                      <span className="font-semibold">{data?.workforce?.trainingHours ?? 0} hrs</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Lost-time injury rate</span>
                      <span className="font-semibold">{data?.workforce?.lostTimeInjuryRate ?? 0}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Voluntary turnover</span>
                      <span className="font-semibold">{data?.workforce?.voluntaryTurnover ?? 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Governance & Compliance */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Governance & Compliance</CardTitle>
                  <CardDescription>Corporate governance oversight & legal compliance</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2 flex-grow flex flex-col justify-between space-y-6">
                  {/* Badges block */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disclosure & assurance status</h4>
                    <div className="flex flex-wrap gap-2">
                      {data?.governance?.badges?.map((badge, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className={`text-[11px] px-2 py-0.5 font-medium border ${getBadgeStyle(badge.color)} ${!badge.active ? "opacity-50" : ""}`}
                        >
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Metrics list */}
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Board members with ESG oversight</span>
                      <span className="font-semibold">{data?.governance?.boardEsgOversight ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">ESG-linked executive remuneration</span>
                      <span className="font-semibold">{data?.governance?.esgLinkedRemuneration ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Data privacy incidents</span>
                      <span className="font-semibold">{data?.governance?.dataPrivacyIncidents ?? 0}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Regulatory fines (environmental)</span>
                      <span className="font-semibold">
                        {data?.organization?.currency} {data?.governance?.environmentalFines ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Pending activity data approvals</span>
                      <span className="font-semibold inline-flex items-center gap-1">
                        {(data?.governance?.pendingApprovalsCount ?? 0) > 0 ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            {data?.governance?.pendingApprovalsCount} pending
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            All approved
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      {/* Footer statistics counter */}
      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Badge variant="outline">{data?.activityCount || 0} activity logs</Badge>
        <Badge variant="secondary">Reporting year {year}</Badge>
        <Badge variant="secondary" className="capitalize">Industry: {data?.organization?.name ? "Metal & Machinery" : "Manufacturing"}</Badge>
      </div>
    </section>
  )
}
