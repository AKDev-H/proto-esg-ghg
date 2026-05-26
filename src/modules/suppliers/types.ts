export type SupplierCategory =
    | "stainless_steel"
    | "aluminum"
    | "chemicals"
    | "logistics"
    | "other";

export type QuestionnaireType =
    | "carbon_disclosure"
    | "pcf"
    | "energy_usage";

export type QuestionnaireInviteStatus =
    | "pending"
    | "opened"
    | "submitted"
    | "expired"
    | "revoked";

export interface CarbonDisclosureData {
    reportingYear?: number;
    scope1Emissions?: number;
    scope2Emissions?: number;
    scope3Emissions?: number;
    hasSbtiCommitment?: boolean;
    cdpDisclosure?: boolean;
    thirdPartyVerified?: boolean;
    reductionTargetPercent?: number;
    comments?: string;
}

export interface PcfData {
    productName?: string;
    productUnit?: string;
    cradleToGateEmissions?: number;
    systemBoundary?: string;
    dataQuality?: "primary" | "secondary" | "mixed";
    methodology?: string;
    allocationMethod?: string;
    comments?: string;
}

export interface EnergyUsageData {
    annualElectricityKwh?: number;
    annualNaturalGas?: number;
    naturalGasUnit?: string;
    annualDieselLiters?: number;
    renewableEnergyPercent?: number;
    energyIntensity?: number;
    energyIntensityUnit?: string;
    comments?: string;
}

export interface SupplierRecord {
    id: string;
    name: string;
    country: string | null;
    contactEmail: string | null;
    categories: SupplierCategory[];
    otherCategoryType: string | null;
    createdAt: string;
    inviteCount?: number;
    latestInviteStatus?: QuestionnaireInviteStatus | null;
}

export interface QuestionnaireInviteRecord {
    id: string;
    supplierId: string;
    supplierName: string;
    supplierCategories: SupplierCategory[];
    supplierOtherCategoryType: string | null;
    questionnaireTypes: QuestionnaireType[];
    status: QuestionnaireInviteStatus;
    expiresAt: string;
    openedAt: string | null;
    submittedAt: string | null;
    createdAt: string;
    hasResponse: boolean;
}

export interface QuestionnaireResponseRecord {
    id: string;
    inviteId: string;
    supplierName: string;
    supplierCategories: SupplierCategory[];
    supplierOtherCategoryType: string | null;
    carbonDisclosure: CarbonDisclosureData | null;
    pcf: PcfData | null;
    energyUsage: EnergyUsageData | null;
    respondentName: string | null;
    respondentEmail: string | null;
    respondentTitle: string | null;
    submittedAt: string;
}

export interface PublicQuestionnaireContext {
    organizationName: string;
    supplierName: string;
    supplierCategories: SupplierCategory[];
    supplierOtherCategoryType: string | null;
    questionnaireTypes: QuestionnaireType[];
    status: QuestionnaireInviteStatus;
    expiresAt: string;
    alreadySubmitted: boolean;
}
