import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Helvetica",
        fontSize: 9,
        backgroundColor: "#ffffff",
    },
    header: {
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: "#3b82f6",
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 3,
    },
    headerSubtitle: {
        fontSize: 10,
        color: "#6b7280",
    },
    section: {
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    grid2: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    col: {
        width: "48%",
    },
    card: {
        backgroundColor: "#f9fafb",
        padding: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        marginBottom: 8,
    },
    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    metricBox: {
        width: "31%",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 8,
        color: "#6b7280",
        marginBottom: 3,
        textTransform: "uppercase",
    },
    metricValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111827",
    },
    metricUnit: {
        fontSize: 8,
        color: "#9ca3af",
        marginTop: 1,
    },
    metricYoY: {
        fontSize: 7.5,
        fontWeight: "bold",
        marginTop: 2,
    },
    progressBar: {
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 3,
        marginTop: 4,
        overflow: "hidden",
        width: "100%",
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
    },
    table: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 4,
        overflow: "hidden",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        paddingVertical: 6,
        paddingHorizontal: 8,
        alignItems: "center",
    },
    tableHeader: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
    },
    tableCell: {
        fontSize: 8,
        color: "#374151",
    },
    bold: {
        fontWeight: "bold",
    },
    // Flex widths
    w40: { width: "40%" },
    w30: { width: "30%" },
    w20: { width: "20%" },
    w15: { width: "15%" },
    w10: { width: "10%" },
    textRight: { textAlign: "right" },
    textCenter: { textAlign: "center" },
    
    badgeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginVertical: 6,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 7.5,
        fontWeight: "bold",
        borderWidth: 1,
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 7.5,
        color: "#9ca3af",
    },
});

interface PDFData {
    reportingYear: number;
    organization: {
        name: string;
        country: string;
        currency: string;
        reportingStatus: string;
    };
    totalTonCO2e: number;
    metrics: {
        emissions: { value: number; unit: string; yoy: { text: string; isIncrease: boolean } };
        intensity: { value: number; unit: string; yoy: { text: string; isIncrease: boolean } };
        energy: { value: number; unit: string; yoy: { text: string; isIncrease: boolean } };
        renewable: { value: number; unit: string; yoy: { text: string; isIncrease: boolean } };
        water: { value: number; unit: string; yoy: { text: string; isIncrease: boolean } };
        waste: { value: number; unit: string; yoy: { text: string; isIncrease: boolean } };
    };
    details: {
        scope1: { generators: number; refrigerants: number; fleet: number; processGases: number };
        scope2: { gridLocal: number; gridMarket: number; purchasedSteam: number; reCertificates: number };
        scope3: {
            purchasedGoods: number;
            capitalGoods: number;
            fuelEnergy: number;
            upstreamTransport: number;
            waste: number;
            businessTravel: number;
            employeeCommute: number;
            downstreamTransport: number;
            productUse: number;
            endOfLife: number;
        };
    };
    energyMix: Array<{ name: string; value: number; color: string }>;
    reductionTarget: {
        baseYear: number;
        scope1: { actual: number; target: number };
        scope2: { actual: number; target: number };
        scope3: { actual: number; target: number };
    };
    workforce: {
        headcount: number;
        femalePercent: number;
        localHiresPercent: number;
        trainingHours: number;
        lostTimeInjuryRate: number;
        voluntaryTurnover: number;
    };
    supplyChain: {
        totalSuppliers: number;
        screenedPercent: number;
        cocSignedPercent: number;
        highRiskAuditedPercent: number;
    };
    governance: {
        badges: Array<{ label: string; active: boolean; color: string }>;
        boardEsgOversight: string;
        esgLinkedRemuneration: string;
        dataPrivacyIncidents: number;
        environmentalFines: number;
        pendingApprovalsCount: number;
    };
    trendData: Array<{ year: number; scope1: number; scope2: number; scope3: number; total: number }>;
}

function getBadgeColors(colorName: string, active: boolean) {
    if (!active) return { bg: "#f3f4f6", text: "#9ca3af", border: "#e5e7eb" };
    switch (colorName) {
        case "green":
            return { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" };
        case "brown":
            return { bg: "#fffbeb", text: "#b45309", border: "#fde68a" };
        case "blue":
            return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
        default:
            return { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" };
    }
}

function getYoYColor(text: string, isIncrease: boolean, isGoodIncrease = false) {
    if (text.toLowerCase().includes("no change")) return "#6b7280";
    const isBeneficial = isGoodIncrease ? isIncrease : !isIncrease;
    return isBeneficial ? "#059669" : "#dc2626";
}

function PageFooter({ organizationName, year, pageNum }: { organizationName: string; year: number; pageNum: number }) {
    return (
        <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
                {organizationName} · ESG Performance Report FY{year}
            </Text>
            <Text style={styles.footerText}>Page {pageNum}</Text>
        </View>
    );
}

export function DashboardPDFDocument({ data }: { data: PDFData }) {
    return (
        <Document>
            {/* PAGE 1: OVERVIEW, TREND, REDUCTION TARGETS, ENERGY MIX */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>ESG Dashboard Performance Report</Text>
                    <Text style={styles.headerSubtitle}>
                        {data.organization.name} · FY{data.reportingYear} · Scopes 1-3 · Country: {data.organization.country}
                    </Text>
                </View>

                {/* 6 Summary Metrics Cards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview Key Metrics</Text>
                    <View style={styles.metricsGrid}>
                        {/* Emissions */}
                        <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>GHG emissions</Text>
                            <Text style={styles.metricValue}>
                                {data.metrics.emissions.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </Text>
                            <Text style={styles.metricUnit}>{data.metrics.emissions.unit} / year</Text>
                            <Text style={[styles.metricYoY, { color: getYoYColor(data.metrics.emissions.yoy.text, data.metrics.emissions.yoy.isIncrease, false) }]}>
                                {data.metrics.emissions.yoy.text}
                            </Text>
                        </View>
                        {/* Intensity */}
                        <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>Emission intensity</Text>
                            <Text style={styles.metricValue}>{data.metrics.intensity.value.toFixed(2)}</Text>
                            <Text style={styles.metricUnit}>{data.metrics.intensity.unit}</Text>
                            <Text style={[styles.metricYoY, { color: getYoYColor(data.metrics.intensity.yoy.text, data.metrics.intensity.yoy.isIncrease, false) }]}>
                                {data.metrics.intensity.yoy.text}
                            </Text>
                        </View>
                        {/* Energy */}
                        <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>Energy consumed</Text>
                            <Text style={styles.metricValue}>
                                {data.metrics.energy.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </Text>
                            <Text style={styles.metricUnit}>{data.metrics.energy.unit}</Text>
                            <Text style={[styles.metricYoY, { color: getYoYColor(data.metrics.energy.yoy.text, data.metrics.energy.yoy.isIncrease, false) }]}>
                                {data.metrics.energy.yoy.text}
                            </Text>
                        </View>
                        {/* Renewable */}
                        <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>Renewable energy</Text>
                            <Text style={styles.metricValue}>{data.metrics.renewable.value}%</Text>
                            <Text style={styles.metricUnit}>{data.metrics.renewable.unit}</Text>
                            <Text style={[styles.metricYoY, { color: getYoYColor(data.metrics.renewable.yoy.text, data.metrics.renewable.yoy.isIncrease, true) }]}>
                                {data.metrics.renewable.yoy.text}
                            </Text>
                        </View>
                        {/* Water */}
                        <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>Water withdrawn</Text>
                            <Text style={styles.metricValue}>{data.metrics.water.value.toLocaleString()}</Text>
                            <Text style={styles.metricUnit}>{data.metrics.water.unit}</Text>
                            <Text style={[styles.metricYoY, { color: getYoYColor(data.metrics.water.yoy.text, data.metrics.water.yoy.isIncrease, false) }]}>
                                {data.metrics.water.yoy.text}
                            </Text>
                        </View>
                        {/* Waste */}
                        <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>Waste recycled</Text>
                            <Text style={styles.metricValue}>{data.metrics.waste.value}%</Text>
                            <Text style={styles.metricUnit}>{data.metrics.waste.unit}</Text>
                            <Text style={[styles.metricYoY, { color: getYoYColor(data.metrics.waste.yoy.text, data.metrics.waste.yoy.isIncrease, true) }]}>
                                {data.metrics.waste.yoy.text}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Grid for Trend and Target Progress */}
                <View style={styles.grid2}>
                    {/* Trend Table */}
                    <View style={styles.col}>
                        <Text style={[styles.sectionTitle, { fontSize: 10 }]}>Emissions Trend (tCO2e)</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCell, styles.w30, styles.bold]}>Year</Text>
                                <Text style={[styles.tableCell, styles.w20, styles.bold, styles.textRight]}>S1</Text>
                                <Text style={[styles.tableCell, styles.w20, styles.bold, styles.textRight]}>S2</Text>
                                <Text style={[styles.tableCell, styles.w20, styles.bold, styles.textRight]}>S3</Text>
                                <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>Total</Text>
                            </View>
                            {data.trendData.map((item, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.w30]}>FY{item.year}</Text>
                                    <Text style={[styles.tableCell, styles.w20, styles.textRight]}>
                                        {Math.round(item.scope1 / 1000).toLocaleString()}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.w20, styles.textRight]}>
                                        {Math.round(item.scope2 / 1000).toLocaleString()}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.w20, styles.textRight]}>
                                        {Math.round(item.scope3 / 1000).toLocaleString()}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>
                                        {Math.round(item.total / 1000).toLocaleString()}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Target Progress */}
                    <View style={styles.col}>
                        <Text style={[styles.sectionTitle, { fontSize: 10 }]}>Target Reduction Progress</Text>
                        <View style={styles.card}>
                            {/* Scope 1 */}
                            <View style={{ marginBottom: 6 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ fontSize: 8 }}>Scope 1 (vs {data.reductionTarget.baseYear})</Text>
                                    <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                                        {data.reductionTarget.scope1.actual}% / {data.reductionTarget.scope1.target}%
                                    </Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, (data.reductionTarget.scope1.actual / data.reductionTarget.scope1.target) * 100))}%`, backgroundColor: "#f97316" }]} />
                                </View>
                            </View>
                            {/* Scope 2 */}
                            <View style={{ marginBottom: 6 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ fontSize: 8 }}>Scope 2 (vs {data.reductionTarget.baseYear})</Text>
                                    <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                                        {data.reductionTarget.scope2.actual}% / {data.reductionTarget.scope2.target}%
                                    </Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, (data.reductionTarget.scope2.actual / data.reductionTarget.scope2.target) * 100))}%`, backgroundColor: "#3b82f6" }]} />
                                </View>
                            </View>
                            {/* Scope 3 */}
                            <View style={{ marginBottom: 6 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ fontSize: 8 }}>Scope 3 (vs {data.reductionTarget.baseYear})</Text>
                                    <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                                        {data.reductionTarget.scope3.actual}% / {data.reductionTarget.scope3.target}%
                                    </Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, (data.reductionTarget.scope3.actual / data.reductionTarget.scope3.target) * 100))}%`, backgroundColor: "#10b981" }]} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Energy Mix */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Energy Consumption Mix</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.w40, styles.bold]}>Energy Source</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>Consumption (kWh equiv.)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>Proportion (%)</Text>
                        </View>
                        {data.energyMix.map((source, idx) => {
                            const totalEnergy = data.energyMix.reduce((sum, s) => sum + s.value, 0);
                            const proportion = totalEnergy > 0 ? (source.value / totalEnergy) * 100 : 0;
                            return (
                                <View key={idx} style={styles.tableRow}>
                                    <View style={[styles.w40, { flexDirection: "row", alignItems: "center" }]}>
                                        <View style={{ width: 8, height: 8, backgroundColor: source.color, marginRight: 5, borderRadius: 2 }} />
                                        <Text style={styles.tableCell}>{source.name}</Text>
                                    </View>
                                    <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{Math.round(source.value).toLocaleString()}</Text>
                                    <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{proportion.toFixed(1)}%</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <PageFooter organizationName={data.organization.name} year={data.reportingYear} pageNum={1} />
            </Page>

            {/* PAGE 2: GHG EMISSIONS DETAILED SCOPE BREAKDOWNS */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>GHG Emissions Detailed breakdown</Text>
                    <Text style={styles.headerSubtitle}>
                        {data.organization.name} · FY{data.reportingYear} · Detailed Scope Subcategories (tCO2e)
                    </Text>
                </View>

                {/* Scope 1 Table */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { borderBottomColor: "#f97316" }]}>Scope 1 - Direct Emissions</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.w40, styles.bold]}>Emissions Source</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>Emissions (tCO2e)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>% of Scope 1</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Diesel generators (Stationary)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope1.generators) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope1 > 0 ? ((data.details.scope1.generators / data.byScope.scope1) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Refrigerants (AC & Cooling)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope1.refrigerants) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope1 > 0 ? ((data.details.scope1.refrigerants / data.byScope.scope1) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Company fleet (Vehicles)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope1.fleet) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope1 > 0 ? ((data.details.scope1.fleet / data.byScope.scope1) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Process gases / Furnaces</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope1.processGases) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope1 > 0 ? ((data.details.scope1.processGases / data.byScope.scope1) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={[styles.tableRow, { backgroundColor: "#fafafa" }]}>
                            <Text style={[styles.tableCell, styles.w40, styles.bold]}>Scope 1 Total</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>{((data.byScope.scope1) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>100.0%</Text>
                        </View>
                    </View>
                </View>

                {/* Scope 2 Table */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { borderBottomColor: "#3b82f6" }]}>Scope 2 - Energy Indirect Emissions</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.w40, styles.bold]}>Emissions Source</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>Emissions (tCO2e)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>% of Scope 2</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Grid electricity (Location-based)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope2.gridLocal) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope2 > 0 ? ((data.details.scope2.gridLocal / data.byScope.scope2) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Grid electricity (Market-based estimate)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope2.gridMarket) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>—</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Purchased steam / Heat</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope2.purchasedSteam) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope2 > 0 ? ((data.details.scope2.purchasedSteam / data.byScope.scope2) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>RE certificates offset</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight, { color: "#059669" }]}>-{((data.details.scope2.reCertificates) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>—</Text>
                        </View>
                        <View style={[styles.tableRow, { backgroundColor: "#fafafa" }]}>
                            <Text style={[styles.tableCell, styles.w40, styles.bold]}>Scope 2 Total</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>{((data.byScope.scope2) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>100.0%</Text>
                        </View>
                    </View>
                </View>

                {/* Scope 3 Table */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { borderBottomColor: "#10b981" }]}>Scope 3 - Value Chain Emissions</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.w40, styles.bold]}>Category Source</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>Emissions (tCO2e)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>% of Scope 3</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Purchased Goods & Services</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope3.purchasedGoods) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope3 > 0 ? ((data.details.scope3.purchasedGoods / data.byScope.scope3) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Capital Goods</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope3.capitalGoods) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope3 > 0 ? ((data.details.scope3.capitalGoods / data.byScope.scope3) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Logistics (Cat. 4 & 9 Transportation)</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {(((data.details.scope3.upstreamTransport ?? 0) + (data.details.scope3.downstreamTransport ?? 0)) / 1000).toFixed(2)}
                            </Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope3 > 0 ? ((((data.details.scope3.upstreamTransport ?? 0) + (data.details.scope3.downstreamTransport ?? 0)) / data.byScope.scope3) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Waste Generated in Operations</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope3.waste) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope3 > 0 ? ((data.details.scope3.waste / data.byScope.scope3) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Business Travel</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope3.businessTravel) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope3 > 0 ? ((data.details.scope3.businessTravel / data.byScope.scope3) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.w40]}>Employee Commuting</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>{((data.details.scope3.employeeCommute) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.textRight]}>
                                {data.byScope.scope3 > 0 ? ((data.details.scope3.employeeCommute / data.byScope.scope3) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                        <View style={[styles.tableRow, { backgroundColor: "#fafafa" }]}>
                            <Text style={[styles.tableCell, styles.w40, styles.bold]}>Scope 3 Total</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>{((data.byScope.scope3) / 1000).toFixed(2)}</Text>
                            <Text style={[styles.tableCell, styles.w30, styles.bold, styles.textRight]}>100.0%</Text>
                        </View>
                    </View>
                </View>

                <PageFooter organizationName={data.organization.name} year={data.reportingYear} pageNum={2} />
            </Page>

            {/* PAGE 3: SUPPLY CHAIN, WORKFORCE, AND GOVERNANCE */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>ESG Supply Chain, Social & Governance</Text>
                    <Text style={styles.headerSubtitle}>
                        {data.organization.name} · FY{data.reportingYear} · Disclosures for Bursa SR / GRI Standards
                    </Text>
                </View>

                {/* Supply Chain Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Supply Chain ESG Performance</Text>
                    <View style={styles.card}>
                        <View style={{ marginBottom: 6 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ fontSize: 8.5 }}>Suppliers screened on ESG criteria</Text>
                                <Text style={{ fontSize: 8.5, fontWeight: "bold" }}>{data.supplyChain.screenedPercent}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${data.supplyChain.screenedPercent}%`, backgroundColor: "#10b981" }]} />
                            </View>
                        </View>
                        <View style={{ marginBottom: 6 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ fontSize: 8.5 }}>Suppliers signed Code of Conduct</Text>
                                <Text style={{ fontSize: 8.5, fontWeight: "bold" }}>{data.supplyChain.cocSignedPercent}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${data.supplyChain.cocSignedPercent}%`, backgroundColor: "#3b82f6" }]} />
                            </View>
                        </View>
                        <View style={{ marginBottom: 6 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ fontSize: 8.5 }}>High-risk suppliers audited</Text>
                                <Text style={{ fontSize: 8.5, fontWeight: "bold" }}>{data.supplyChain.highRiskAuditedPercent}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${data.supplyChain.highRiskAuditedPercent}%`, backgroundColor: "#f59e0b" }]} />
                            </View>
                        </View>
                        <View style={{ marginTop: 6, fontSize: 8, color: "#6b7280" }}>
                            <Text>Total active suppliers in reporting system: {data.supplyChain.totalSuppliers}</Text>
                        </View>
                    </View>
                </View>

                {/* Grid for Workforce and Governance */}
                <View style={styles.grid2}>
                    {/* Workforce Card */}
                    <View style={styles.col}>
                        <Text style={[styles.sectionTitle, { fontSize: 10 }]}>Workforce & Social Metrics</Text>
                        <View style={styles.card}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>Total headcount</Text>
                                <Text style={styles.bold}>{data.workforce.headcount} employees</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>Female employees</Text>
                                <Text style={styles.bold}>{data.workforce.femalePercent}%</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>Local hires ({data.organization.country === "MY" ? "MY" : "US"})</Text>
                                <Text style={styles.bold}>{data.workforce.localHiresPercent}%</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>Training / employee</Text>
                                <Text style={styles.bold}>{data.workforce.trainingHours} hrs</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>Lost-time injury rate</Text>
                                <Text style={styles.bold}>{data.workforce.lostTimeInjuryRate}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ color: "#6b7280" }}>Voluntary turnover</Text>
                                <Text style={styles.bold}>{data.workforce.voluntaryTurnover}%</Text>
                            </View>
                        </View>
                    </View>

                    {/* Governance Metrics */}
                    <View style={styles.col}>
                        <Text style={[styles.sectionTitle, { fontSize: 10 }]}>Governance & Compliance</Text>
                        <View style={styles.card}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>Board ESG oversight</Text>
                                <Text style={styles.bold}>{data.governance.boardEsgOversight}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>ESG exec remuneration</Text>
                                <Text style={styles.bold}>{data.governance.esgLinkedRemuneration}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>Data privacy incidents</Text>
                                <Text style={styles.bold}>{data.governance.dataPrivacyIncidents}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text style={{ color: "#6b7280" }}>Regulatory fines</Text>
                                <Text style={styles.bold}>{data.organization.currency} {data.governance.environmentalFines}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ color: "#6b7280" }}>Pending approvals</Text>
                                <Text style={[styles.bold, { color: data.governance.pendingApprovalsCount > 0 ? "#b45309" : "#047857" }]}>
                                    {data.governance.pendingApprovalsCount} logs pending
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Disclosure badges */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Disclosure & Assurance Status</Text>
                    <View style={styles.badgeGrid}>
                        {data.governance.badges.map((badge, idx) => {
                            const colors = getBadgeColors(badge.color, badge.active);
                            return (
                                <Text
                                    key={idx}
                                    style={[
                                        styles.badge,
                                        {
                                            backgroundColor: colors.bg,
                                            color: colors.text,
                                            borderColor: colors.border,
                                            opacity: badge.active ? 1 : 0.4,
                                        },
                                    ]}
                                >
                                    {badge.label}
                                </Text>
                            );
                        })}
                    </View>
                </View>

                <PageFooter organizationName={data.organization.name} year={data.reportingYear} pageNum={3} />
            </Page>
        </Document>
    );
}
