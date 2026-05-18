"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Leaf } from "lucide-react"
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

const COLORS = {
    scope1: "#ef4444",
    scope2: "#f59e0b",
    scope3: "#8b5cf6",
}

interface ReportDetailModalProps {
    reportId: string
    onClose: () => void
    onDownload: () => void
}

interface ReportData {
    id: string
    organization: {
        name: string
        country: string
        industryType: string
    }
    reportingYear: number
    reportType: string
    status: string
    summary: {
        totalEmissionsKg: number
        totalEmissionsTon: string
        activityCount: number
        byScope: {
            scope1: { emissionsKg: number; emissionsTon: string; percentage: string }
            scope2: { emissionsKg: number; emissionsTon: string; percentage: string }
            scope3: { emissionsKg: number; emissionsTon: string; percentage: string }
        }
        byCategory: Record<string, { count: number; emissions: number }>
    }
}

export function ReportDetailModal({ reportId, onClose, onDownload }: ReportDetailModalProps) {
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("summary")

    useState(() => {
        fetch(`/api/reports/${reportId}`)
            .then((res) => res.json())
            .then((data) => {
                setData(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    })

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-4xl m-4">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-2xl m-4">
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">Failed to load report data</p>
                        <Button variant="outline" className="mt-4" onClick={onClose}>
                            Close
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const totalEmissions = data.summary.totalEmissionsKg
    const scope1Data = data.summary.byScope.scope1
    const scope2Data = data.summary.byScope.scope2
    const scope3Data = data.summary.byScope.scope3

    const pieData = [
        { name: "Scope 1", value: parseFloat(scope1Data.emissionsTon), percentage: parseFloat(scope1Data.percentage), color: COLORS.scope1 },
        { name: "Scope 2", value: parseFloat(scope2Data.emissionsTon), percentage: parseFloat(scope2Data.percentage), color: COLORS.scope2 },
        { name: "Scope 3", value: parseFloat(scope3Data.emissionsTon), percentage: parseFloat(scope3Data.percentage), color: COLORS.scope3 },
    ].filter(d => d.value > 0)

    const categoryData = Object.entries(data.summary.byCategory)
        .map(([key, val]) => ({
            name: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            emissions: val.emissions / 1000,
            count: val.count,
        }))
        .sort((a, b) => b.emissions - a.emissions)

    const getStatusColor = (percentage: number, threshold: number) => {
        if (percentage < threshold * 0.5) return "text-green-600"
        if (percentage < threshold) return "text-yellow-600"
        return "text-red-600"
    }

    const getStatusLabel = (percentage: number, threshold: number) => {
        if (percentage < threshold * 0.5) return { label: "Good", icon: CheckCircle, color: "text-green-600" }
        if (percentage < threshold) return { label: "Monitor", icon: AlertTriangle, color: "text-yellow-600" }
        return { label: "Action Needed", icon: AlertTriangle, color: "text-red-600" }
    }

    const threshold = data.organization.country === "US" ? 25 : 20

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Leaf className="w-6 h-6 text-green-600" />
                                ESG Emissions Report
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {data.organization.name} • {data.organization.country === "US" ? "United States" : "Malaysia"} • {data.reportingYear}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <div className="flex-shrink-0 border-b bg-white px-6 py-2">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Scope 1: {scope1Data.percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span>Scope 2: {scope2Data.percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                            <span>Scope 3: {scope3Data.percentage}%</span>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                            {data.summary.activityCount} Activities
                        </Badge>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="flex-shrink-0 mx-6 mt-4 grid grid-cols-4 w-auto">
                        <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                        <TabsTrigger value="scope">Scope Analysis</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="action">Action Plan</TabsTrigger>
                    </TabsList>

                    <CardContent className="flex-1 overflow-y-auto p-6">
                        <TabsContent value="summary" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6">
                                    <p className="text-green-100 text-sm font-medium">Total GHG Emissions</p>
                                    <p className="text-4xl font-bold mt-2">{data.summary.totalEmissionsTon}</p>
                                    <p className="text-green-200 text-sm mt-1">tonnes CO₂e (tCO₂e)</p>
                                    <div className="flex items-center gap-2 mt-4 text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Base year emission baseline</span>
                                    </div>
                                </div>
                                <div className="bg-white border rounded-xl p-5">
                                    <p className="text-muted-foreground text-sm">Carbon Intensity</p>
                                    <p className="text-3xl font-bold mt-2">
                                        {data.summary.activityCount > 0 
                                            ? (totalEmissions / data.summary.activityCount).toFixed(0)
                                            : "—"}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-1">kg CO₂e per activity</p>
                                    <div className="mt-3">
                                        {data.summary.activityCount > 30 ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                                <TrendingDown className="w-3 h-3" /> Good coverage
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                                                <AlertTriangle className="w-3 h-3" /> Needs more data
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white border rounded-xl p-5">
                                    <p className="text-muted-foreground text-sm">Data Quality</p>
                                    <p className="text-3xl font-bold mt-2">{data.summary.activityCount}</p>
                                    <p className="text-muted-foreground text-xs mt-1">activities recorded</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${Math.min((data.summary.activityCount / 50) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white border rounded-xl p-6">
                                    <h3 className="font-semibold text-lg mb-4">Emissions by Scope</h3>
                                    <div className="h-64">
                                        {pieData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} tCO₂e`} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                No emissions data available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white border rounded-xl p-6">
                                    <h3 className="font-semibold text-lg mb-4">Scope Breakdown</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Scope 1 - Direct", data: scope1Data, color: "bg-red-500" },
                                            { label: "Scope 2 - Energy", data: scope2Data, color: "bg-amber-500" },
                                            { label: "Scope 3 - Value Chain", data: scope3Data, color: "bg-violet-500" },
                                        ].map((scope) => (
                                            <div key={scope.label} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">{scope.label}</span>
                                                    <span className="text-muted-foreground">
                                                        {scope.data.emissionsTon} tCO₂e ({scope.data.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div 
                                                        className="bg-current h-3 rounded-full" 
                                                        style={{ width: `${parseFloat(scope.data.percentage)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Insight:</strong> {parseFloat(scope3Data.percentage) > 60 
                                                ? "Your Scope 3 emissions are dominant. Focus on supply chain engagement for biggest impact."
                                                : parseFloat(scope1Data.percentage) > 50 
                                                ? "Direct emissions are your largest source. Consider fleet electrification and equipment upgrades."
                                                : "Balanced emissions profile across all scopes. Good foundation for targeted reductions."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="scope" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-red-900">Scope 1</h3>
                                        <Badge variant={parseFloat(scope1Data.percentage) > 50 ? "destructive" : "secondary"}>
                                            {getStatusLabel(parseFloat(scope1Data.percentage), 50).label}
                                        </Badge>
                                    </div>
                                    <p className="text-3xl font-bold text-red-700 mt-3">{scope1Data.emissionsTon}</p>
                                    <p className="text-sm text-red-600">tCO₂e ({scope1Data.percentage}%)</p>
                                    <p className="text-xs text-red-500 mt-3">
                                        Direct emissions from vehicles, stationary combustion, refrigerants
                                    </p>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-amber-900">Scope 2</h3>
                                        <Badge variant={parseFloat(scope2Data.percentage) > 30 ? "destructive" : "secondary"}>
                                            {getStatusLabel(parseFloat(scope2Data.percentage), 30).label}
                                        </Badge>
                                    </div>
                                    <p className="text-3xl font-bold text-amber-700 mt-3">{scope2Data.emissionsTon}</p>
                                    <p className="text-sm text-amber-600">tCO₂e ({scope2Data.percentage}%)</p>
                                    <p className="text-xs text-amber-500 mt-3">
                                        Indirect emissions from purchased electricity
                                    </p>
                                </div>
                                <div className="bg-violet-50 border border-violet-100 rounded-xl p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-violet-900">Scope 3</h3>
                                        <Badge variant={parseFloat(scope3Data.percentage) > 60 ? "destructive" : "secondary"}>
                                            {getStatusLabel(parseFloat(scope3Data.percentage), 60).label}
                                        </Badge>
                                    </div>
                                    <p className="text-3xl font-bold text-violet-700 mt-3">{scope3Data.emissionsTon}</p>
                                    <p className="text-sm text-violet-600">tCO₂e ({scope3Data.percentage}%)</p>
                                    <p className="text-xs text-violet-500 mt-3">
                                        Value chain emissions from suppliers to end-of-life
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border rounded-xl p-6">
                                <h3 className="font-semibold text-lg mb-4">Scope Comparison</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: "Scope 1", emissions: parseFloat(scope1Data.emissionsTon), color: COLORS.scope1 },
                                            { name: "Scope 2", emissions: parseFloat(scope2Data.emissionsTon), color: COLORS.scope2 },
                                            { name: "Scope 3", emissions: parseFloat(scope3Data.emissionsTon), color: COLORS.scope3 },
                                        ]} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" tickFormatter={(v) => `${v} tCO₂e`} />
                                            <YAxis type="category" dataKey="name" width={100} />
                                            <Tooltip formatter={(value: number) => `${value.toFixed(2)} tCO₂e`} />
                                            <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                                                {[
                                                    { name: "Scope 1", emissions: parseFloat(scope1Data.emissionsTon), color: COLORS.scope1 },
                                                    { name: "Scope 2", emissions: parseFloat(scope2Data.emissionsTon), color: COLORS.scope2 },
                                                    { name: "Scope 3", emissions: parseFloat(scope3Data.emissionsTon), color: COLORS.scope3 },
                                                ].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white border rounded-xl p-5">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-red-500" />
                                        Scope 1 Recommendations
                                    </h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500">•</span>
                                            {parseFloat(scope1Data.percentage) > 50 
                                                ? "Priority: Fleet electrification or fuel switching"
                                                : "Maintain vehicle maintenance programs"}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500">•</span>
                                            Equipment upgrades for stationary combustion
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500">•</span>
                                            Refrigerant leak detection and management
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white border rounded-xl p-5">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-amber-500" />
                                        Scope 2 Recommendations
                                    </h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            {parseFloat(scope2Data.percentage) > 30 
                                                ? "Priority: Energy efficiency audit"
                                                : "Explore renewable energy options"}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            LED lighting and HVAC optimization
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Solar installation or power purchase agreements
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="categories" className="space-y-6 mt-0">
                            {categoryData.length > 0 ? (
                                <>
                                    <div className="bg-white border rounded-xl p-6">
                                        <h3 className="font-semibold text-lg mb-4">Scope 3 Category Breakdown</h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={categoryData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tickFormatter={(v) => `${v} tCO₂e`} />
                                                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                                                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} tCO₂e`} />
                                                    <Bar dataKey="emissions" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white border rounded-xl p-6">
                                        <h3 className="font-semibold text-lg mb-4">Category Details</h3>
                                        <div className="space-y-3">
                                            {categoryData.map((cat, idx) => {
                                                const pct = totalEmissions > 0 ? ((cat.emissions * 1000) / totalEmissions * 100).toFixed(1) : "0"
                                                return (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{cat.name}</p>
                                                                <p className="text-xs text-muted-foreground">{cat.count} activities</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold">{cat.emissions.toFixed(2)} tCO₂e</p>
                                                            <p className="text-xs text-muted-foreground">{pct}% of total</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No Scope 3 categories recorded yet
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="action" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                                    <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                                        Immediate (0-3 months)
                                    </h4>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li>• Complete energy audit</li>
                                        <li>• Identify quick wins in operations</li>
                                        <li>• Engage top 5 suppliers on sustainability</li>
                                    </ul>
                                </div>
                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                                    <h4 className="font-semibold text-purple-900 flex items-center gap-2 mb-3">
                                        <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">2</span>
                                        Short-term (3-12 months)
                                    </h4>
                                    <ul className="space-y-2 text-sm text-purple-800">
                                        <li>• Implement energy efficiency measures</li>
                                        <li>• Set science-based targets</li>
                                        <li>• Supplier sustainability program</li>
                                    </ul>
                                </div>
                                <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                                    <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-3">
                                        <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">3</span>
                                        Long-term (1-3 years)
                                    </h4>
                                    <ul className="space-y-2 text-sm text-green-800">
                                        <li>• Renewable energy transition</li>
                                        <li>• Product lifecycle improvements</li>
                                        <li>• Net-zero target alignment</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white border rounded-xl p-6">
                                <h3 className="font-semibold text-lg mb-4">Key Performance Indicators</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-2xl font-bold">{data.summary.activityCount}</p>
                                        <p className="text-xs text-muted-foreground">Activities Tracked</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-2xl font-bold">
                                            {data.summary.activityCount > 0 
                                                ? (totalEmissions / data.summary.activityCount).toFixed(0)
                                                : "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">kg CO₂e/Activity</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-2xl font-bold">{data.organization.country}</p>
                                        <p className="text-xs text-muted-foreground">Benchmark Region</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-2xl font-bold">Baseline</p>
                                        <p className="text-xs text-muted-foreground">Reporting Status</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border rounded-xl p-6">
                                <h3 className="font-semibold text-lg mb-4">Methodology</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Emission Factors Source</p>
                                        <p className="font-medium">
                                            {data.organization.country === "US" ? "EPA (United States)" : "Malaysia Grid / DEFRA"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Standard</p>
                                        <p className="font-medium">GHG Protocol Corporate Standard</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Industry</p>
                                        <p className="font-medium capitalize">{data.organization.industryType?.replace(/_/g, " ")}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Data Coverage</p>
                                        <p className="font-medium">{data.organization.country === "US" ? "United States" : "Malaysia"} operations</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    )
}