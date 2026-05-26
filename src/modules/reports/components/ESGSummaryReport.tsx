import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    pdf,
} from "@react-pdf/renderer";
import type { Country } from "@prisma/client";
import type { GHGActionPlan } from "@/modules/reports/services/generate-ghg-action-plan";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 10,
        backgroundColor: "#ffffff",
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 3,
        borderBottomColor: "#059669",
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: "#6b7280",
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    rowLabel: {
        color: "#6b7280",
        width: "50%",
    },
    rowValue: {
        fontWeight: "bold",
        color: "#111827",
        width: "50%",
        textAlign: "right",
    },
    card: {
        backgroundColor: "#f9fafb",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    statGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 15,
    },
    statBox: {
        width: "48%",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        marginRight: "2%",
    },
    statLabel: {
        fontSize: 9,
        color: "#6b7280",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111827",
    },
    statUnit: {
        fontSize: 9,
        color: "#9ca3af",
        marginTop: 2,
    },
    greenText: { color: "#059669" },
    yellowText: { color: "#d97706" },
    redText: { color: "#dc2626" },
    blueText: { color: "#2563eb" },
    progressBar: {
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 3,
        marginTop: 5,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
    },
    table: {
        marginTop: 10,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        paddingVertical: 10,
    },
    tableHeader: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    tableCell: {
        fontSize: 9,
        color: "#374151",
    },
    col1: { width: "40%" },
    col2: { width: "25%" },
    col3: { width: "35%", textAlign: "right" },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 8,
        fontWeight: "bold",
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 8,
        color: "#9ca3af",
    },
    pageNumber: {
        fontSize: 9,
        color: "#9ca3af",
    },
    infoBox: {
        backgroundColor: "#eff6ff",
        borderLeftWidth: 4,
        borderLeftColor: "#2563eb",
        padding: 12,
        marginBottom: 10,
    },
    warningBox: {
        backgroundColor: "#fffbeb",
        borderLeftWidth: 4,
        borderLeftColor: "#f59e0b",
        padding: 12,
        marginBottom: 10,
    },
    successBox: {
        backgroundColor: "#ecfdf5",
        borderLeftWidth: 4,
        borderLeftColor: "#059669",
        padding: 12,
        marginBottom: 10,
    },
    infoBoxText: {
        fontSize: 9,
        color: "#4b5563",
        lineHeight: 1.5,
    },
    heroCard: {
        backgroundColor: "#059669",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        color: "#ffffff",
    },
    heroValue: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#ffffff",
    },
    heroUnit: {
        fontSize: 12,
        color: "#a7f3d0",
    },
    insightBox: {
        backgroundColor: "#f0fdf4",
        borderWidth: 1,
        borderColor: "#059669",
        borderRadius: 8,
        padding: 15,
        marginTop: 15,
    },
    insightTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#059669",
        marginBottom: 5,
    },
    recommendationItem: {
        marginBottom: 15,
        paddingLeft: 15,
        borderLeftWidth: 3,
        borderLeftColor: "#8b5cf6",
    },
    recommendationTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 4,
    },
    recommendationText: {
        fontSize: 9,
        color: "#6b7280",
        lineHeight: 1.4,
    },
    scopeCard: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    scopeCardTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 5,
    },
    scopeCardDesc: {
        fontSize: 8,
        marginTop: 5,
    },
    kpiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    kpiBox: {
        width: "23%",
        marginRight: "2%",
        backgroundColor: "#f9fafb",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    kpiValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111827",
    },
    kpiLabel: {
        fontSize: 8,
        color: "#6b7280",
        marginTop: 3,
    },
});

const COLORS = {
    scope1: "#ef4444",
    scope2: "#f59e0b",
    scope3: "#8b5cf6",
    low: "#059669",
    medium: "#d97706",
    high: "#dc2626",
};

const TOTAL_PAGES = 6;

const PDF = {
    co2: "CO2e",
    tco2: "tCO2e",
    bullet: "- ",
    ok: "OK: ",
    warn: "Note: ",
    insightTitle: "Management Insight",
    nextStep: "Next Step:",
} as const;

function ReportFooter({
    data,
    page,
}: {
    data: ESGSummaryData;
    page: number;
}) {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>
                Generated: {new Date(data.generatedAt).toLocaleDateString()}{" "}
                | {data.organization.name}
            </Text>
            <Text style={styles.pageNumber}>
                Page {page} of {TOTAL_PAGES}
            </Text>
        </View>
    );
}

function getEmissionStatus(value: number, total: number, country: Country) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    if (country === "US") {
        if (percentage < 25) return { status: "good", color: COLORS.low };
        if (percentage < 50) return { status: "warning", color: COLORS.medium };
        return { status: "critical", color: COLORS.high };
    } else {
        if (percentage < 20) return { status: "good", color: COLORS.low };
        if (percentage < 40) return { status: "warning", color: COLORS.medium };
        return { status: "critical", color: COLORS.high };
    }
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(2) + "K";
    return num.toFixed(2);
}

interface ESGSummaryData {
    organization: { name: string; country: Country; industryType: string };
    reportingYear: number;
    generatedAt: string;
    totalEmissions: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    activityCount: number;
    scope1Percentage: number;
    scope2Percentage: number;
    scope3Percentage: number;
    scope3Categories: Array<{
        categoryKey?: string;
        category: string;
        emissions: number;
        percentage: number;
        activityCount: number;
    }>;
    topActivities: Array<{
        activityType: string;
        emissions: number;
        scope: string;
    }>;
    actionPlan: GHGActionPlan;
    countryContext: {
        benchmark: string;
        unit: string;
        threshold: { low: number; medium: number; high: number };
    };
}

function Page1({ data }: { data: ESGSummaryData }) {
    const total = data.totalEmissions;

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ESG Emissions Report</Text>
                <Text style={styles.headerSubtitle}>
                    {data.organization.name} | Reporting Year{" "}
                    {data.reportingYear} |{" "}
                    {data.organization.country === "US"
                        ? "United States"
                        : "Malaysia"}
                </Text>
            </View>

            <View style={styles.section}>
                <View style={styles.heroCard}>
                    <Text style={{ fontSize: 11, color: "#a7f3d0" }}>
                        Total GHG Emissions
                    </Text>
                    <Text style={styles.heroValue}>
                        {formatNumber(total / 1000)}
                    </Text>
                    <Text style={styles.heroUnit}>
                        tonnes {PDF.co2} ({PDF.tco2})
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            marginTop: 12,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ fontSize: 10, color: "#a7f3d0" }}>
                            {PDF.ok}Base year emission baseline
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", marginBottom: 15 }}>
                    <View
                        style={[
                            styles.statBox,
                            {
                                backgroundColor: "#fef2f2",
                                borderColor: "#fecaca",
                            },
                        ]}
                    >
                        <Text style={[styles.statLabel, { color: "#991b1b" }]}>
                            Scope 1 - Direct
                        </Text>
                        <Text style={[styles.statValue, { color: "#dc2626" }]}>
                            {formatNumber(data.scope1Emissions / 1000)}
                        </Text>
                        <Text style={[styles.statUnit, { color: "#f87171" }]}>
                            {PDF.tco2} ( {data.scope1Percentage.toFixed(1)}% )
                        </Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(data.scope1Percentage, 100)}%`,
                                        backgroundColor: "#ef4444",
                                    },
                                ]}
                            />
                        </View>
                    </View>
                    <View
                        style={[
                            styles.statBox,
                            {
                                backgroundColor: "#fffbeb",
                                borderColor: "#fde68a",
                            },
                        ]}
                    >
                        <Text style={[styles.statLabel, { color: "#92400e" }]}>
                            Scope 2 - Energy
                        </Text>
                        <Text style={[styles.statValue, { color: "#d97706" }]}>
                            {formatNumber(data.scope2Emissions / 1000)}
                        </Text>
                        <Text style={[styles.statUnit, { color: "#fbbf24" }]}>
                            {PDF.tco2} ( {data.scope2Percentage.toFixed(1)}% )
                        </Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(data.scope2Percentage, 100)}%`,
                                        backgroundColor: "#f59e0b",
                                    },
                                ]}
                            />
                        </View>
                    </View>
                    <View
                        style={[
                            styles.statBox,
                            {
                                backgroundColor: "#f5f3ff",
                                borderColor: "#c4b5fd",
                            },
                        ]}
                    >
                        <Text style={[styles.statLabel, { color: "#5b21b6" }]}>
                            Scope 3 - Value Chain
                        </Text>
                        <Text style={[styles.statValue, { color: "#8b5cf6" }]}>
                            {formatNumber(data.scope3Emissions / 1000)}
                        </Text>
                        <Text style={[styles.statUnit, { color: "#a78bfa" }]}>
                            {PDF.tco2} ( {data.scope3Percentage.toFixed(1)}% )
                        </Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(data.scope3Percentage, 100)}%`,
                                        backgroundColor: "#8b5cf6",
                                    },
                                ]}
                            />
                        </View>
                    </View>
                    <View
                        style={[
                            styles.statBox,
                            {
                                backgroundColor: "#f0fdf4",
                                borderColor: "#bbf7d0",
                            },
                        ]}
                    >
                        <Text style={[styles.statLabel, { color: "#166534" }]}>
                            Activities
                        </Text>
                        <Text style={[styles.statValue, { color: "#059669" }]}>
                            {data.activityCount}
                        </Text>
                        <Text style={[styles.statUnit, { color: "#6ee7b7" }]}>
                            records
                        </Text>
                        <View style={{ marginTop: 8 }}>
                            <Text
                                style={{
                                    fontSize: 8,
                                    color:
                                        data.activityCount > 30
                                            ? "#059669"
                                            : "#d97706",
                                }}
                            >
                                {data.activityCount > 30
                                    ? `${PDF.ok}Good data coverage`
                                    : `${PDF.warn}Needs more data`}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.insightBox}>
                    <Text style={styles.insightTitle}>{PDF.insightTitle}</Text>
                    <Text style={styles.infoBoxText}>
                        {data.scope3Percentage > 60
                            ? "Your Scope 3 emissions dominate at " +
                              data.scope3Percentage.toFixed(0) +
                              "%. Focus on supply chain engagement for biggest impact reduction."
                            : data.scope1Percentage > 50
                              ? "Direct emissions (Scope 1) are your largest source at " +
                                data.scope1Percentage.toFixed(0) +
                                "%. Consider fleet electrification and equipment upgrades."
                              : "Balanced emissions profile across all scopes. Good foundation for targeted reduction strategies."}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emission Distribution</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text
                            style={[
                                styles.tableCell,
                                styles.col1,
                                { fontSize: 10 },
                            ]}
                        >
                            Scope
                        </Text>
                        <Text
                            style={[
                                styles.tableCell,
                                styles.col2,
                                { fontSize: 10 },
                            ]}
                        >
                            Emissions ({PDF.tco2})
                        </Text>
                        <Text
                            style={[
                                styles.tableCell,
                                styles.col3,
                                { fontSize: 10 },
                            ]}
                        >
                            Share
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col1]}>
                            Scope 1 - Direct Emissions
                        </Text>
                        <Text style={[styles.tableCell, styles.col2]}>
                            {formatNumber(data.scope1Emissions / 1000)}
                        </Text>
                        <Text
                            style={[
                                styles.badge,
                                { backgroundColor: "#fef2f2" },
                            ]}
                        >
                            <Text style={[styles.tableCell, styles.redText]}>
                                {data.scope1Percentage.toFixed(1)}%
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col1]}>
                            Scope 2 - Indirect Energy
                        </Text>
                        <Text style={[styles.tableCell, styles.col2]}>
                            {formatNumber(data.scope2Emissions / 1000)}
                        </Text>
                        <Text
                            style={[
                                styles.badge,
                                { backgroundColor: "#fffbeb" },
                            ]}
                        >
                            <Text style={[styles.tableCell, styles.yellowText]}>
                                {data.scope2Percentage.toFixed(1)}%
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col1]}>
                            Scope 3 - Value Chain
                        </Text>
                        <Text style={[styles.tableCell, styles.col2]}>
                            {formatNumber(data.scope3Emissions / 1000)}
                        </Text>
                        <Text
                            style={[
                                styles.badge,
                                { backgroundColor: "#f5f3ff" },
                            ]}
                        >
                            <Text style={[styles.tableCell, styles.blueText]}>
                                {data.scope3Percentage.toFixed(1)}%
                            </Text>
                        </Text>
                    </View>
                </View>
            </View>

            <ReportFooter data={data} page={1} />
        </Page>
    );
}

function Page2({ data }: { data: ESGSummaryData }) {
    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Scope Analysis</Text>
                <Text style={styles.headerSubtitle}>
                    {data.organization.name} | Reporting Year{" "}
                    {data.reportingYear}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Scope 1: Direct Emissions
                </Text>
                <View
                    style={[
                        styles.scopeCard,
                        {
                            backgroundColor: "#fef2f2",
                            borderWidth: 1,
                            borderColor: "#fecaca",
                        },
                    ]}
                >
                    <Text style={[styles.scopeCardTitle, { color: "#991b1b" }]}>
                        Total: {formatNumber(data.scope1Emissions / 1000)} {PDF.tco2}
                        ( {data.scope1Percentage.toFixed(1)}% )
                    </Text>
                    <Text style={[styles.scopeCardDesc, { color: "#7f1d1d" }]}>
                        Direct emissions from owned sources: company vehicles,
                        stationary combustion (boilers, furnaces), and
                        refrigerant leaks.
                    </Text>
                </View>
                <View
                    style={
                        data.scope1Percentage >= 50
                            ? styles.warningBox
                            : styles.successBox
                    }
                >
                    <Text style={styles.infoBoxText}>
                        {data.scope1Percentage >= 50
                            ? `${PDF.warn}HIGH PRIORITY: Scope 1 is significant. Consider fleet electrification, equipment upgrades to lower-carbon fuels, or preventive maintenance programs.`
                            : `${PDF.ok}Direct emissions are well-controlled. Continue monitoring vehicle maintenance and equipment efficiency.`}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Scope 2: Indirect Energy
                </Text>
                <View
                    style={[
                        styles.scopeCard,
                        {
                            backgroundColor: "#fffbeb",
                            borderWidth: 1,
                            borderColor: "#fde68a",
                        },
                    ]}
                >
                    <Text style={[styles.scopeCardTitle, { color: "#92400e" }]}>
                        Total: {formatNumber(data.scope2Emissions / 1000)} {PDF.tco2}
                        ( {data.scope2Percentage.toFixed(1)}% )
                    </Text>
                    <Text style={[styles.scopeCardDesc, { color: "#78350f" }]}>
                        Indirect emissions from purchased electricity, steam,
                        heating & cooling.
                        {data.organization.country === "MY" &&
                            " Using Malaysia Grid emission factors."}
                    </Text>
                </View>
                {data.scope2Emissions > 0 && (
                    <View
                        style={
                            data.scope2Percentage >= 30
                                ? styles.warningBox
                                : styles.successBox
                        }
                    >
                        <Text style={styles.infoBoxText}>
                            {data.scope2Percentage >= 30
                                ? `${PDF.warn}Review electricity consumption patterns. Consider renewable energy procurement (solar PPA), energy efficiency upgrades, or grid region optimization.`
                                : `${PDF.ok}Good progress on energy efficiency. Explore renewable energy options for further reductions.`}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Scope 3: Value Chain</Text>
                <View
                    style={[
                        styles.scopeCard,
                        {
                            backgroundColor: "#f5f3ff",
                            borderWidth: 1,
                            borderColor: "#c4b5fd",
                        },
                    ]}
                >
                    <Text style={[styles.scopeCardTitle, { color: "#5b21b6" }]}>
                        Total: {formatNumber(data.scope3Emissions / 1000)} {PDF.tco2}
                        ( {data.scope3Percentage.toFixed(1)}% )
                    </Text>
                    <Text style={[styles.scopeCardDesc, { color: "#4c1d95" }]}>
                        All other indirect emissions: raw material sourcing,
                        transportation, business travel, product use, and
                        end-of-life.
                    </Text>
                </View>

                <View
                    style={
                        data.scope3Percentage >= 60
                            ? styles.warningBox
                            : styles.successBox
                    }
                >
                    <Text style={styles.infoBoxText}>
                        {data.scope3Percentage >= 60
                            ? `${PDF.warn}SCOPE 3 DOMINATES: Focus on supplier engagement, product design for longevity, and logistics optimization. This is typical for manufacturing.`
                            : `${PDF.ok}Manageable Scope 3 profile. Continue supplier sustainability programs and logistics efficiency initiatives.`}
                    </Text>
                </View>
            </View>

            <ReportFooter data={data} page={2} />
        </Page>
    );
}

function Page3CategoryBreakdown({ data }: { data: ESGSummaryData }) {
    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Scope 3 Category Breakdown</Text>
                <Text style={styles.headerSubtitle}>
                    {data.organization.name} | Reporting Year{" "}
                    {data.reportingYear}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Category Breakdown (Top 5)
                </Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text
                            style={[
                                styles.tableCell,
                                styles.col1,
                                { fontSize: 9 },
                            ]}
                        >
                            Category
                        </Text>
                        <Text
                            style={[
                                styles.tableCell,
                                styles.col2,
                                { fontSize: 9 },
                            ]}
                        >
                            {PDF.tco2}
                        </Text>
                        <Text
                            style={[
                                styles.tableCell,
                                styles.col3,
                                { fontSize: 9 },
                            ]}
                        >
                            %
                        </Text>
                    </View>
                    {data.scope3Categories.slice(0, 5).map((cat, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text
                                style={[
                                    styles.tableCell,
                                    styles.col1,
                                    { fontSize: 9 },
                                ]}
                            >
                                {cat.category}
                            </Text>
                            <Text
                                style={[
                                    styles.tableCell,
                                    styles.col2,
                                    { fontSize: 9 },
                                ]}
                            >
                                {formatNumber(cat.emissions / 1000)}
                            </Text>
                            <Text
                                style={[
                                    styles.tableCell,
                                    styles.col3,
                                    { fontSize: 9 },
                                ]}
                            >
                                {cat.percentage.toFixed(1)}%
                            </Text>
                        </View>
                    ))}
                </View>

                {data.scope3Categories.length === 0 && (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxText}>
                            No Scope 3 category data recorded for this reporting
                            year. Add activities under Scope 3 to populate this
                            breakdown.
                        </Text>
                    </View>
                )}
            </View>

            <ReportFooter data={data} page={3} />
        </Page>
    );
}

function Page4ManagementInsights({ data }: { data: ESGSummaryData }) {
    const total = data.totalEmissions;
    const scope1Pct = data.scope1Percentage;
    const scope2Pct = data.scope2Percentage;
    const scope3Pct = data.scope3Percentage;

    const getMainDriver = () => {
        if (scope3Pct > 60)
            return {
                scope: "Scope 3 - Value Chain",
                pct: scope3Pct,
                message:
                    "Your value chain emissions are the dominant source. Focus on supply chain engagement, sustainable sourcing, and product lifecycle improvements.",
            };
        if (scope1Pct > 50)
            return {
                scope: "Scope 1 - Direct Emissions",
                pct: scope1Pct,
                message:
                    "Direct emissions from owned sources are your largest impact area. Consider fleet electrification, equipment upgrades, and fuel switching.",
            };
        if (scope2Pct > 40)
            return {
                scope: "Scope 2 - Energy",
                pct: scope2Pct,
                message:
                    "Purchased electricity is significant. Explore renewable energy options and energy efficiency improvements.",
            };
        return {
            scope: "All Scopes Balanced",
            pct: 0,
            message:
                "Your emissions are well-balanced across all scopes. This provides a good foundation for targeted reduction strategies.",
        };
    };

    const mainDriver = getMainDriver();

    const getRecommendations = () => {
        const recs = [];

        if (scope3Pct > 60) {
            recs.push("Engage top 5 suppliers on sustainability commitments");
            recs.push(
                "Implement supplier sustainability questionnaire and tracking",
            );
            recs.push(
                "Consider product design for longevity and recyclability",
            );
            recs.push("Review logistics and transportation efficiency");
        }

        if (scope1Pct > 30) {
            recs.push(
                "Conduct fleet assessment for electrification opportunities",
            );
            recs.push("Schedule equipment maintenance to optimize efficiency");
            recs.push("Review refrigerant management practices");
        }

        if (scope2Pct > 20) {
            recs.push(
                "Complete energy audit to identify efficiency opportunities",
            );
            recs.push("Evaluate solar or renewable energy procurement");
            recs.push("Implement LED lighting and HVAC optimization");
        }

        if (recs.length < 3) {
            recs.push("Set science-based emission reduction targets");
            recs.push("Establish baseline for year-over-year tracking");
            recs.push("Develop carbon reduction roadmap");
        }

        return recs;
    };

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Management Insights</Text>
                <Text style={styles.headerSubtitle}>
                    {data.organization.name} | Reporting Year{" "}
                    {data.reportingYear}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Executive Summary</Text>

                <View
                    style={[
                        styles.card,
                        { backgroundColor: "#059669", color: "#ffffff" },
                    ]}
                >
                    <Text style={{ fontSize: 11, color: "#a7f3d0" }}>
                        Total GHG Emissions
                    </Text>
                    <Text
                        style={{
                            fontSize: 32,
                            fontWeight: "bold",
                            color: "#ffffff",
                            marginTop: 5,
                        }}
                    >
                        {formatNumber(total / 1000)}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#a7f3d0" }}>
                        tonnes {PDF.co2} ({PDF.tco2})
                    </Text>
                    <Text
                        style={{
                            fontSize: 10,
                            color: "#d1fae5",
                            marginTop: 10,
                        }}
                    >
                        {PDF.bullet}
                        {data.activityCount} activities tracked
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Findings</Text>

                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Primary Emission Source</Text>
                    <Text style={[styles.rowValue, { color: "#059669" }]}>
                        {mainDriver.scope}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Carbon Intensity</Text>
                    <Text style={styles.rowValue}>
                        {data.activityCount > 0
                            ? (total / data.activityCount).toFixed(0)
                            : "—"}{" "}
                        kg {PDF.co2} per activity
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Data Quality Score</Text>
                    <Text
                        style={[
                            styles.rowValue,
                            {
                                color:
                                    data.activityCount > 30
                                        ? "#059669"
                                        : "#d97706",
                            },
                        ]}
                    >
                        {data.activityCount > 50
                            ? "Excellent"
                            : data.activityCount > 20
                              ? "Good"
                              : "Needs Improvement"}
                    </Text>
                </View>

                <View style={[styles.insightBox, { marginTop: 15 }]}>
                    <Text style={styles.insightTitle}>{PDF.insightTitle}</Text>
                    <Text style={styles.infoBoxText}>{mainDriver.message}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Priority Actions</Text>

                {getRecommendations().map((rec, idx) => (
                    <View
                        key={idx}
                        style={{
                            flexDirection: "row",
                            marginBottom: 8,
                            alignItems: "flex-start",
                        }}
                    >
                        <Text
                            style={{
                                width: 25,
                                fontSize: 10,
                                color: "#059669",
                                fontWeight: "bold",
                            }}
                        >
                            {idx + 1}.
                        </Text>
                        <Text
                            style={{ flex: 1, fontSize: 10, color: "#374151" }}
                        >
                            {rec}
                        </Text>
                    </View>
                ))}

                <View
                    style={[
                        styles.infoBox,
                        {
                            marginTop: 15,
                            backgroundColor: "#f0fdf4",
                            borderColor: "#059669",
                        },
                    ]}
                >
                    <Text style={[styles.infoBoxText, { color: "#166534" }]}>
                        <Text style={{ fontWeight: "bold" }}>
                            {PDF.nextStep}
                        </Text>{" "}
                        Schedule a sustainability review meeting to prioritize
                        these actions based on your organization&apos;s capacity
                        and budget.
                    </Text>
                </View>
            </View>

            <ReportFooter data={data} page={4} />
        </Page>
    );
}

function Page5CountryBenchmark({ data }: { data: ESGSummaryData }) {
    const scope2Pct = data.scope2Percentage;
    const scope3Pct = data.scope3Percentage;

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Country Benchmark</Text>
                <Text style={styles.headerSubtitle}>
                    {data.organization.name} | Reporting Year{" "}
                    {data.reportingYear}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Emission Status by Country Benchmark
                </Text>
                <View style={styles.card}>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.col1]}>
                                Country
                            </Text>
                            <Text style={[styles.tableCell, styles.col2]}>
                                Your Status
                            </Text>
                            <Text style={[styles.tableCell, styles.col3]}>
                                Threshold
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.col1]}>
                                United States (EPA)
                            </Text>
                            <Text
                                style={[
                                    styles.tableCell,
                                    styles.col2,
                                    scope3Pct > 60
                                        ? styles.redText
                                        : scope3Pct > 30
                                          ? styles.yellowText
                                          : styles.greenText,
                                ]}
                            >
                                {scope3Pct > 60
                                    ? "High"
                                    : scope3Pct > 30
                                      ? "Moderate"
                                      : "Good"}
                            </Text>
                            <Text style={[styles.tableCell, styles.col3]}>
                                {"<"} 25% = Good
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.col1]}>
                                Malaysia (Grid)
                            </Text>
                            <Text
                                style={[
                                    styles.tableCell,
                                    styles.col2,
                                    scope2Pct > 40
                                        ? styles.redText
                                        : scope2Pct > 20
                                          ? styles.yellowText
                                          : styles.greenText,
                                ]}
                            >
                                {scope2Pct > 40
                                    ? "High"
                                    : scope2Pct > 20
                                      ? "Moderate"
                                      : "Good"}
                            </Text>
                            <Text style={[styles.tableCell, styles.col3]}>
                                {"<"} 20% = Good
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.infoBox, { marginTop: 15 }]}>
                    <Text style={styles.infoBoxText}>
                        Benchmarks compare your scope mix against typical
                        manufacturing profiles in each region. Scope 3 share is
                        evaluated for US (EPA) operations; Scope 2 share for
                        Malaysia grid operations.
                    </Text>
                </View>
            </View>

            <ReportFooter data={data} page={5} />
        </Page>
    );
}

function Page6ActionPlan({ data }: { data: ESGSummaryData }) {
    const { actionPlan } = data;
    const phaseColors = ["#2563eb", "#7c3aed", "#059669"];

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    Action Plan & Methodology
                </Text>
                <Text style={styles.headerSubtitle}>
                    {data.organization.name} | Reporting Year{" "}
                    {data.reportingYear}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    GHG Protocol Prioritization
                </Text>
                <View style={styles.infoBox}>
                    <Text style={styles.infoBoxText}>
                        {actionPlan.prioritizationSummary}
                    </Text>
                </View>
                {actionPlan.materialFocusAreas.length > 0 && (
                    <View style={[styles.card, { marginTop: 10 }]}>
                        <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 6 }}>
                            Material focus areas:
                        </Text>
                        {actionPlan.materialFocusAreas.map((area) => (
                            <Text key={area} style={styles.recommendationText}>
                                {PDF.bullet}
                                {area}
                            </Text>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiBox}>
                        <Text style={styles.kpiValue}>{data.activityCount}</Text>
                        <Text style={styles.kpiLabel}>Activities Tracked</Text>
                    </View>
                    <View style={styles.kpiBox}>
                        <Text style={styles.kpiValue}>
                            {data.activityCount > 0
                                ? (data.totalEmissions / data.activityCount).toFixed(0)
                                : "—"}
                        </Text>
                        <Text style={styles.kpiLabel}>kg {PDF.co2} / Activity</Text>
                    </View>
                    <View style={styles.kpiBox}>
                        <Text style={styles.kpiValue}>{data.organization.country}</Text>
                        <Text style={styles.kpiLabel}>Inventory Region</Text>
                    </View>
                    <View style={styles.kpiBox}>
                        <Text style={[styles.kpiValue, { color: "#059669" }]}>
                            {data.reportingYear}
                        </Text>
                        <Text style={styles.kpiLabel}>Base Year</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Action Plan Timeline</Text>
                {actionPlan.phases.map((phase, index) => (
                    <View
                        key={phase.title}
                        style={[
                            styles.recommendationItem,
                            { borderLeftColor: phaseColors[index] ?? "#2563eb" },
                        ]}
                    >
                        <Text style={styles.recommendationTitle}>
                            {phase.title} ({phase.timeframe})
                        </Text>
                        <Text style={[styles.recommendationText, { marginBottom: 4, fontStyle: "italic" }]}>
                            GHG Protocol focus: {phase.protocolFocus}
                        </Text>
                        {phase.actions.map((action) => (
                            <Text key={action} style={styles.recommendationText}>
                                {PDF.bullet}
                                {action}
                            </Text>
                        ))}
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Scope-Specific Reduction Measures</Text>
                <View style={styles.card}>
                    <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 4, color: COLORS.scope1 }}>
                        Scope 1 — Direct emissions
                    </Text>
                    {actionPlan.scopeActions.scope1.map((action) => (
                        <Text key={action} style={styles.recommendationText}>
                            {PDF.bullet}
                            {action}
                        </Text>
                    ))}
                    <Text style={{ fontSize: 9, fontWeight: "bold", marginTop: 8, marginBottom: 4, color: COLORS.scope2 }}>
                        Scope 2 — Purchased energy
                    </Text>
                    {actionPlan.scopeActions.scope2.map((action) => (
                        <Text key={action} style={styles.recommendationText}>
                            {PDF.bullet}
                            {action}
                        </Text>
                    ))}
                    <Text style={{ fontSize: 9, fontWeight: "bold", marginTop: 8, marginBottom: 4, color: COLORS.scope3 }}>
                        Scope 3 — Value chain
                    </Text>
                    {actionPlan.scopeActions.scope3.map((action) => (
                        <Text key={action} style={styles.recommendationText}>
                            {PDF.bullet}
                            {action}
                        </Text>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Methodology & Disclaimer</Text>
                <View style={styles.card}>
                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        <Text
                            style={{
                                width: "40%",
                                fontSize: 9,
                                color: "#6b7280",
                            }}
                        >
                            Standard:
                        </Text>
                        <Text style={{ width: "60%", fontSize: 9 }}>
                            GHG Protocol Corporate Standard
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        <Text
                            style={{
                                width: "40%",
                                fontSize: 9,
                                color: "#6b7280",
                            }}
                        >
                            Emission Factors:
                        </Text>
                        <Text style={{ width: "60%", fontSize: 9 }}>
                            {data.organization.country === "US"
                                ? "EPA (United States)"
                                : "Malaysia Grid / DEFRA"}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        <Text
                            style={{
                                width: "40%",
                                fontSize: 9,
                                color: "#6b7280",
                            }}
                        >
                            Industry:
                        </Text>
                        <Text style={{ width: "60%", fontSize: 9 }}>
                            {data.organization.industryType}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{
                                width: "40%",
                                fontSize: 9,
                                color: "#6b7280",
                            }}
                        >
                            Data Coverage:
                        </Text>
                        <Text style={{ width: "60%", fontSize: 9 }}>
                            {data.organization.country === "US"
                                ? "United States"
                                : "Malaysia"}{" "}
                            operations
                        </Text>
                    </View>
                </View>

                <View style={[styles.infoBox, { marginTop: 15 }]}>
                    <Text style={styles.infoBoxText}>
                        <Text style={{ fontWeight: "bold" }}>Target setting:</Text>{" "}
                        {actionPlan.targetSettingGuidance}
                    </Text>
                </View>

                <View style={[styles.infoBox, { marginTop: 10 }]}>
                    <Text style={styles.infoBoxText}>
                        <Text style={{ fontWeight: "bold" }}>Disclaimer:</Text>{" "}
                        This report has been prepared in accordance with the GHG
                        Protocol Corporate Standard. Emission factors are
                        sourced from{" "}
                        {data.organization.country === "US"
                            ? "EPA"
                            : "Malaysia Grid/DEFRA"}{" "}
                        for{" "}
                        {data.organization.country === "US"
                            ? "United States"
                            : "Malaysia"}{" "}
                        operations. Data quality is dependent on activity data
                        entered by the organization. Report generated on{" "}
                        {new Date(data.generatedAt).toLocaleDateString()}.
                    </Text>
                </View>
            </View>

            <ReportFooter data={data} page={6} />
        </Page>
    );
}

export function ESGSummaryDocument({ data }: { data: ESGSummaryData }) {
    return (
        <Document>
            <Page1 data={data} />
            <Page2 data={data} />
            <Page3CategoryBreakdown data={data} />
            <Page4ManagementInsights data={data} />
            <Page5CountryBenchmark data={data} />
            <Page6ActionPlan data={data} />
        </Document>
    );
}

export async function generateESGSummaryPDF(data: ESGSummaryData) {
    const blob = await pdf(<ESGSummaryDocument data={data} />).toBlob();
    return blob;
}
