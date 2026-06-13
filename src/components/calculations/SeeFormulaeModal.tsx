"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Calculator,
    Info,
    Flame,
    Zap,
    RefreshCw,
    ShieldAlert,
    Milestone,
    BookOpen,
} from "lucide-react";

interface SeeFormulaeModalProps {
    scope: "scope1" | "scope2" | "scope3";
}

export function SeeFormulaeModal({ scope }: SeeFormulaeModalProps) {
    const getScopeTitle = () => {
        if (scope === "scope1") return "Scope 1 Direct Emissions Formulas & Examples";
        if (scope === "scope2") return "Scope 2 Indirect Purchased Energy Formulas & Examples";
        return "Scope 3 Value Chain Emissions Formulas & Examples";
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 text-primary font-medium transition-all duration-300">
                    <Calculator className="h-4 w-4 text-primary animate-pulse" />
                    See Formulae
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] md:w-full md:max-w-5xl h-[92vh] max-h-[92vh] flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-0 overflow-hidden">
                {/* Header Section */}
                <DialogHeader className="border-b border-slate-200 dark:border-slate-800 p-6 bg-slate-100/50 dark:bg-slate-950/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <Calculator className="h-6 w-6 text-primary" />
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-primary">
                            {getScopeTitle()}
                        </DialogTitle>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                        Compliant with GHG Protocol Corporate Standard, Scope 3 Value Chain Standard, IPCC AR6 Global Warming Potentials, and Malaysia Grid factors.
                    </p>
                </DialogHeader>

                {/* Content Area (Scrollable page) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 text-sm">
                    {/* General Base Formula Card */}
                    <div className="bg-gradient-to-r from-blue-50/80 to-slate-50 dark:from-blue-950/20 dark:to-slate-950 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-primary border border-blue-500/20 mt-1 shrink-0">
                            <Info className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-primary dark:text-blue-300 mb-1 flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Calculation Foundation & Unit Conversions
                            </h4>
                            <div className="bg-white dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-800 dark:text-slate-200 my-2 text-xs sm:text-sm overflow-x-auto shadow-sm">
                                Emissions (tCO₂e) = [ Activity Value (converted to standard unit) × Emission Factor ] ÷ 1,000
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Physical inputs are converted to standard storage units (<strong>Weight</strong>: kg, <strong>Distance</strong>: km, <strong>Fuel</strong>: liter, <strong>Energy</strong>: kWh) before emission factor multiplication. The result is divided by 1,000 to convert kgCO₂e into tonnes of CO₂e.
                            </p>
                        </div>
                    </div>

                    {scope === "scope1" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Stationary Combustion */}
                            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <Flame className="h-5 w-5 animate-pulse" />
                                        Stationary Combustion (Boilers, Generators, Furnaces)
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                        Emissions = Fuel Consumed (L/m³) × EF (kgCO₂e/unit) ÷ 1,000
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50/55 dark:bg-slate-950/20 p-3 rounded border border-slate-200 dark:border-slate-800/45">
                                        <p>• <strong>Standard Units</strong>: Liter (for diesel/gasoline) or m³ (for natural gas).</p>
                                        <p>• <strong>Conversions</strong>: 1 US Gallon = 3.78541 L | 1 SCF = 0.0283168 m³.</p>
                                        <p>• <strong>Factors (EPA)</strong>: Diesel: 2.68 kgCO₂e/L | Gasoline: 2.31 kgCO₂e/L | Natural Gas: 2.03 kgCO₂e/m³.</p>
                                    </div>
                                </div>

                                <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800/60 bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded border border-blue-500/10 space-y-2">
                                    <span className="font-semibold text-primary dark:text-blue-400 text-xs block uppercase tracking-wider">Example Calculation</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        A facility combusts <strong>5,000 Liters</strong> of Diesel in a backup generator:
                                    </p>
                                    <div className="bg-white dark:bg-slate-950/80 p-2 rounded font-mono text-primary dark:text-blue-400 text-[11px] leading-relaxed border border-slate-200 dark:border-slate-800 shadow-sm">
                                        Emissions = [ 5,000 L × 2.68 kgCO₂e/L ] ÷ 1,000 <br />
                                        Emissions = 13,400 kgCO₂e ÷ 1,000 = <strong>13.40 tCO₂e</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Combustion */}
                            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <Milestone className="h-5 w-5" />
                                        Mobile Combustion (Company Vehicles, Forklifts)
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                        Emissions = Fuel Consumed (Liters) × EF (kgCO₂e/L) ÷ 1,000
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50/55 dark:bg-slate-950/20 p-3 rounded border border-slate-200 dark:border-slate-800/45">
                                        <p>• <strong>Primary</strong>: Fuel-based tracking is preferred for high accuracy.</p>
                                        <p>• <strong>Fallback</strong>: Distance-based calculation is used if fuel logs are missing: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/60 px-1 py-0.5 rounded">Distance (km) × Vehicle EF (kgCO₂e/km) ÷ 1,000</code>.</p>
                                    </div>
                                </div>

                                <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800/60 bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded border border-blue-500/10 space-y-2">
                                    <span className="font-semibold text-primary dark:text-blue-400 text-xs block uppercase tracking-wider">Example Calculation</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        A petrol-powered company delivery van consumes <strong>2,000 Liters</strong> of gasoline:
                                    </p>
                                    <div className="bg-white dark:bg-slate-950/80 p-2 rounded font-mono text-primary dark:text-blue-400 text-[11px] leading-relaxed border border-slate-200 dark:border-slate-800 shadow-sm">
                                        Emissions = [ 2,000 L × 2.31 kgCO₂e/L ] ÷ 1,000 <br />
                                        Emissions = 4,620 kgCO₂e ÷ 1,000 = <strong>4.62 tCO₂e</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Fugitive Emissions */}
                            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:col-span-2 flex flex-col justify-between space-y-4 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <ShieldAlert className="h-5 w-5" />
                                        Fugitive Emissions (HVAC & Chillers Refrigerant Leakage)
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                        Emissions = Refrigerant Purchased/Replaced (kg) × GWP (CO₂e multiplier) ÷ 1,000
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                        <div className="bg-slate-100 dark:bg-slate-950/60 p-2 rounded text-center border border-slate-200 dark:border-slate-800/40">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">R-410A GWP</div>
                                            <div className="font-mono text-primary dark:text-blue-400 font-semibold text-xs mt-0.5">2,256</div>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-950/60 p-2 rounded text-center border border-slate-200 dark:border-slate-800/40">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">R-32 GWP</div>
                                            <div className="font-mono text-primary dark:text-blue-400 font-semibold text-xs mt-0.5">771</div>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-950/60 p-2 rounded text-center border border-slate-200 dark:border-slate-800/40">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">R-134a GWP</div>
                                            <div className="font-mono text-primary dark:text-blue-400 font-semibold text-xs mt-0.5">1,530</div>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-950/60 p-2 rounded text-center border border-slate-200 dark:border-slate-800/40">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">R-22 GWP</div>
                                            <div className="font-mono text-primary dark:text-blue-400 font-semibold text-xs mt-0.5">1,960</div>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-950/60 p-2 rounded text-center border border-slate-200 dark:border-slate-800/40">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">R-407C GWP</div>
                                            <div className="font-mono text-primary dark:text-blue-400 font-semibold text-xs mt-0.5">1,908</div>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-950/60 p-2 rounded text-center border border-slate-200 dark:border-slate-800/40">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">R-507A GWP</div>
                                            <div className="font-mono text-primary dark:text-blue-400 font-semibold text-xs mt-0.5">4,835</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800/60 bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded border border-blue-500/10 space-y-2">
                                    <span className="font-semibold text-primary dark:text-blue-400 text-xs block uppercase tracking-wider">Example Calculation</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        An office HVAC chiller system requires topping up with <strong>15 kg</strong> of R-410A refrigerant due to a leak:
                                    </p>
                                    <div className="bg-white dark:bg-slate-950/80 p-2 rounded font-mono text-primary dark:text-blue-400 text-[11px] leading-relaxed border border-slate-200 dark:border-slate-800 shadow-sm">
                                        Emissions = [ 15 kg × 2,256 GWP ] ÷ 1,000 <br />
                                        Emissions = 33,840 kgCO₂e ÷ 1,000 = <strong>33.84 tCO₂e</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {scope === "scope2" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Location-Based */}
                            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <Zap className="h-5 w-5" />
                                        Location-Based Method (Grid Average)
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                        Emissions = Purchased Electricity (kWh) × Grid EF (kgCO₂e/kWh) ÷ 1,000
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                        <div className="bg-slate-100 dark:bg-slate-950/60 p-2.5 rounded border border-slate-200 dark:border-slate-800/60 shadow-sm">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Malaysia Grid EF</div>
                                            <div className="text-sm font-mono text-primary dark:text-blue-400 font-bold mt-0.5">0.58 <span className="text-[10px] font-normal text-slate-500 dark:text-slate-300">kgCO₂e/kWh</span></div>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-950/60 p-2.5 rounded border border-slate-200 dark:border-slate-800/60 shadow-sm">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">US EPA eGRID (Avg)</div>
                                            <div className="text-sm font-mono text-primary dark:text-blue-400 font-bold mt-0.5">0.385 <span className="text-[10px] font-normal text-slate-500 dark:text-slate-300">kgCO₂e/kWh</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800/60 bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded border border-blue-500/10 space-y-2">
                                    <span className="font-semibold text-primary dark:text-blue-400 text-xs block uppercase tracking-wider">Example Calculation</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        A factory located in Peninsular Malaysia consumes <strong>100,000 kWh</strong> of grid electricity:
                                    </p>
                                    <div className="bg-white dark:bg-slate-950/80 p-2 rounded font-mono text-primary dark:text-blue-400 text-[11px] leading-relaxed border border-slate-200 dark:border-slate-800 shadow-sm">
                                        Emissions = [ 100,000 kWh × 0.58 kgCO₂e/kWh ] ÷ 1,000 <br />
                                        Emissions = 58,000 kgCO₂e ÷ 1,000 = <strong>58.00 tCO₂e</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Market-Based */}
                            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-primary font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <RefreshCw className="h-5 w-5" />
                                        Market-Based Method (Contractual Instruments)
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                        Emissions = [ (Uncovered Usage × Residual EF) + (Green Purchases × 0) ] ÷ 1,000
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/55 dark:bg-slate-950/20 p-3 rounded border border-slate-200 dark:border-slate-800/40">
                                        Reflects green tariffs (GET), solar power purchase agreements (PPA), or mREC/I-REC purchase instruments. Certified green purchases are computed with a zero-emissions factor.
                                    </p>
                                </div>

                                <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800/60 bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded border border-blue-500/10 space-y-2">
                                    <span className="font-semibold text-primary dark:text-blue-400 text-xs block uppercase tracking-wider">Example Calculation</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        A factory consumes 100,000 kWh, with <strong>60,000 kWh</strong> purchased through Green Tariff (GET) and <strong>40,000 kWh</strong> standard grid (Residual EF: 0.58):
                                    </p>
                                    <div className="bg-white dark:bg-slate-950/80 p-2 rounded font-mono text-primary dark:text-blue-400 text-[11px] leading-relaxed border border-slate-200 dark:border-slate-800 shadow-sm">
                                        Emissions = [ (40,000 kWh × 0.58) + (60,000 kWh × 0) ] ÷ 1,000 <br />
                                        Emissions = 23,200 kgCO₂e ÷ 1,000 = <strong>23.20 tCO₂e</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {scope === "scope3" && (
                        <div className="space-y-6">
                            {/* Scope 3 categories grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cat 1: Goods */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 1: Purchased Goods & Services
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Emissions = Material Quantity (kg) × EF (kgCO₂e/kg) ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Includes raw materials. Ecoinvent factors: Stainless Steel: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">6.15</code> | Aluminum: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">8.24</code> | Chemicals: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">3.20</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (10,000 kg Stainless Steel)</span>
                                        Emissions = [ 10,000 kg × 6.15 ] ÷ 1,000 = <strong>61.50 tCO₂e</strong>
                                    </div>
                                </div>

                                {/* Cat 2: Capital Goods */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 2: Capital Goods
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Emissions = Equipment Weight (kg) × EF (kgCO₂e/kg) ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            SMT machinery, tooling, CNC machinery, and office infrastructure. CNC/tooling machinery factor (USEEIO): <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">2.85</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (2,000 kg CNC Machine)</span>
                                        Emissions = [ 2,000 kg × 2.85 ] ÷ 1,000 = <strong>5.70 tCO₂e</strong>
                                    </div>
                                </div>

                                {/* Cat 3: Fuel & Energy Upstream */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 3: Fuel & Energy Related Activities
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Emissions = Grid Electricity (kWh) × Upstream Loss EF ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Accounts for upstream transmission and distribution (T&D) losses. DEFRA default factor: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">0.0496 kgCO₂e/kWh</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (100,000 kWh Grid Usage)</span>
                                        Emissions = [ 100,000 kWh × 0.0496 ] ÷ 1,000 = <strong>4.96 tCO₂e</strong>
                                    </div>
                                </div>

                                {/* Cat 4 & 9: Transportation */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 4 & 9: Upstream & Downstream Transport
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Emissions = [ Mass (ton) × Distance (km) ] × Mode EF ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Inbound and outbound logistics using `ton-km`. Default Road Freight factor (DEFRA): <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">0.11191 kgCO₂e/ton-km</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (5 tons Aluminum over 1,200 km)</span>
                                        Emissions = [ (5 × 1,200) t-km × 0.11191 ] ÷ 1,000 = <strong>0.67 tCO₂e</strong>
                                    </div>
                                </div>

                                {/* Cat 5: Waste */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 5: Waste Generated in Operations
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Emissions = Waste Quantity (kg) × Disposal Treatment EF ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Tracks chemical and metal scrap waste. Incineration EF: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">0.907</code> | Recycling EF: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">0.021</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (1,500 kg Waste Incinerated)</span>
                                        Emissions = [ 1,500 kg × 0.907 ] ÷ 1,000 = <strong>1.36 tCO₂e</strong>
                                    </div>
                                </div>

                                {/* Cat 6: Business Travel */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 6: Business Travel
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Stay: Nights × Hotel EF ÷ 1,000 | Travel: Dist (km) × Trips × EF ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Flights, cars, hotels. Flight factor: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">0.15 kg/km</code> | Hotel factor: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">25.0 kg/night</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (3,000 km Flight & 4 Hotel Nights)</span>
                                        Emissions = [ (3,000 × 0.15) + (4 × 25) ] ÷ 1,000 = <strong>0.55 tCO₂e</strong>
                                    </div>
                                </div>

                                {/* Cat 7: Employee Commuting */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 7: Employee Commuting
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Emissions = [ Employees × Avg Dist (km/day) × Days ] × Car EF ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Daily staff travel. Passenger Petrol Car average factor (DEFRA): <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">0.17 kgCO₂e/km</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (50 Staff Commuting 20 km for 220 Days)</span>
                                        Emissions = [ (50 × 20 × 220) pkm × 0.17 ] ÷ 1,000 = <strong>37.40 tCO₂e</strong>
                                    </div>
                                </div>

                                {/* Cat 11: Product Use */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 11: Use of Sold Products
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Emissions = Units Sold × Lifetime Years × Annual Energy (kWh) × Grid EF ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Lifetime energy use of sold goods. Regional grid electricity factor (EPA): <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">0.50 kgCO₂e/kWh</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (1,000 Devices, 5 yr Life, 50 kWh/yr)</span>
                                        Emissions = [ (1,000 × 5 × 50) kWh × 0.50 ] ÷ 1,000 = <strong>125.00 tCO₂e</strong>
                                    </div>
                                </div>

                                {/* Cat 12: End of Life */}
                                <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 md:col-span-2 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider text-primary">
                                            Category 12: End-of-Life Treatment of Sold Products
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-center text-slate-700 dark:text-slate-300 text-xs">
                                            Emissions = Product Quantity (kg) × End-of-Life Disposal EF ÷ 1,000
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Recycling, landfills, and disposal of sold products. Average electronic product landfill/disposal factor: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/65 px-1 rounded">0.45 kgCO₂e/kg</code>.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-2.5 rounded border border-blue-500/10 text-xs font-mono text-primary dark:text-blue-400 shadow-sm">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Example (5,000 kg Products Disposed)</span>
                                        Emissions = [ 5,000 kg × 0.45 ] ÷ 1,000 = <strong>2.25 tCO₂e</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 bg-slate-100/50 dark:bg-slate-950/40 flex justify-end">
                    <Button
                        onClick={() => {
                            const closeBtn = document.querySelector('[data-state="open"] button[class*="absolute"]');
                            if (closeBtn instanceof HTMLElement) closeBtn.click();
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors duration-200 shadow-sm"
                    >
                        Got it, thanks!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
