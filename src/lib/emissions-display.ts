export function formatTonCO2e(kgCO2e: number | null | undefined): string {
    if (kgCO2e == null) return "—";
    return `${(kgCO2e / 1000).toFixed(3)} tCO2e`;
}

export function kgToTonnes(kg: number): number {
    return kg / 1000;
}

export function formatChartValue(kg: number): string {
    const tonnes = kg / 1000;
    if (Math.abs(tonnes) >= 1) {
        return `${tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO2e`;
    }
    return `${kg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kgCO2e`;
}

export function formatChartAxis(kg: number): string {
    const tonnes = kg / 1000;
    if (tonnes === 0) return "0";
    if (Math.abs(tonnes) >= 1000) {
        return `${(tonnes / 1000).toFixed(1)}k t`;
    }
    if (Math.abs(tonnes) >= 1) {
        return `${tonnes.toFixed(tonnes >= 10 ? 0 : 1)} t`;
    }
    return `${kg.toFixed(0)} kg`;
}

export function formatPercent(value: number, total: number): string {
    if (total <= 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
}
