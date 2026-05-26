import type { Scope3Category } from "@/types";
export type { Scope3Category };
import { SCOPE3_CATEGORIES } from "@/types";
export { SCOPE3_CATEGORIES };

export type DataStatus = "draft" | "submitted" | "approved" | "rejected";
export type WeightUnit = "kg" | "lb" | "ton" | "unit";
export type DistanceUnit = "km" | "mile" | "m";
export type EnergyUnit = "kWh" | "MWh" | "MJ";
export type TransportMode = "truck" | "rail" | "ship" | "aircraft" | "van";
export type DisposalType = "landfill" | "incineration" | "recycling" | "composting" | "energy_recovery";
export type WasteType = "hazardous" | "non_hazardous" | "electronic" | "plastic" | "metal" | "organic";
export type DisposalMethod = "landfill" | "incineration" | "recycling" | "composting" | "energy_recovery" | "anaerobic_digestion";
export type TravelType = "flight" | "train" | "taxi" | "bus" | "car" | "hotel";
export type CommuteTransportMode = "car" | "bus" | "train" | "motorcycle" | "bicycle" | "walking";
export type LeaseType = "operational" | "financial";
export type ProcessingType = "assembly" | "fabrication" | "refining" | "packaging" | "other";
export type FuelType = "natural_gas" | "diesel" | "gasoline" | "coal" | "biomass" | "electricity";
export type ActivityDescription = "extraction" | "production" | "transmission" | "distribution";
export type EquipmentType =
    | "machinery"
    | "precision_tooling"
    | "computer"
    | "vehicle"
    | "building"
    | "furniture"
    | "other";
export type AssetType = "vehicle" | "equipment" | "building" | "machinery";

export interface Activity {
    id: string;
    scope: "scope3";
    scope3Category: Scope3Category;
    activityType: string;
    inputValue: number;
    inputUnit: string;
    calculatedEmissions: number | null;
    dataStatus: DataStatus;
    createdAt?: string;
}

export interface PurchasedGoodsFormData {
    materialType: string;
    quantity: number;
    unit: WeightUnit;
    supplier?: string;
    supplierCountry?: string;
}

export interface CapitalGoodsFormData {
    equipmentType: EquipmentType;
    quantity: number;
    unit: string;
    purchaseYear: number;
}

export interface FuelEnergyFormData {
    fuelType: FuelType;
    quantity: number;
    unit: string;
    activityDescription: ActivityDescription;
}

export interface TransportFormData {
    mode: TransportMode;
    weight: number;
    distance: number;
    transportCategory: "upstream" | "downstream";
}

export interface WasteFormData {
    wasteType: WasteType;
    disposalMethod: DisposalMethod;
    quantity: number;
    unit: WeightUnit;
}

export interface BusinessTravelFormData {
    travelType: TravelType;
    distance: number;
    numberOfTrips: number;
    origin?: string;
    destination?: string;
}

export interface EmployeeCommutingFormData {
    transportMode: CommuteTransportMode;
    averageDistancePerDay: number;
    daysPerYear: number;
    numberOfEmployees: number;
}

export interface UpstreamLeasedFormData {
    assetType: AssetType;
    leaseType: LeaseType;
    quantity: number;
    unit: string;
}

export interface ProductProcessingFormData {
    productType: string;
    processingType: ProcessingType;
    quantity: number;
    unit: WeightUnit;
}

export interface ProductUseFormData {
    productType: string;
    annualEnergyKwh: number;
    lifetimeYears: number;
    unitsSold: number;
}

export interface EndOfLifeFormData {
    disposalType: DisposalType;
    wasteQuantity: number;
    unit: WeightUnit;
}

export interface DownstreamLeasedFormData {
    productType: string;
    leaseType: LeaseType;
    quantity: number;
    unit: string;
}

export interface Scope3PurchasedGoods {
    id: string;
    materialType: string;
    quantity: number;
    unit: string;
    supplier?: string;
    supplierCountry?: string;
}

export interface Scope3CapitalGoods {
    id: string;
    equipmentType: EquipmentType;
    quantity: number;
    unit: string;
    purchaseYear: number;
}

export interface Scope3FuelEnergy {
    id: string;
    fuelType: FuelType;
    quantity: number;
    unit: string;
    activityDescription: ActivityDescription;
}

export interface Scope3Transport {
    id: string;
    transportMode: TransportMode;
    weight: number;
    distance: number;
    distanceUnit: string;
    transportCategory: "upstream" | "downstream";
}

export interface Scope3Waste {
    id: string;
    wasteType: WasteType;
    disposalMethod: DisposalMethod;
    quantity: number;
    unit: string;
}

export interface Scope3BusinessTravel {
    id: string;
    travelType: TravelType;
    distance: number;
    numberOfTrips: number;
    origin?: string;
    destination?: string;
}

export interface Scope3EmployeeCommuting {
    id: string;
    transportMode: CommuteTransportMode;
    averageDistancePerDay: number;
    daysPerYear: number;
    numberOfEmployees: number;
}

export interface Scope3UpstreamLeased {
    id: string;
    assetType: AssetType;
    leaseType: LeaseType;
    quantity: number;
    unit: string;
}

export interface Scope3ProductProcessing {
    id: string;
    productType: string;
    processingType: ProcessingType;
    quantity: number;
    unit: string;
}

export interface Scope3ProductUse {
    id: string;
    productType: string;
    annualEnergyKwh: number;
    lifetimeYears: number;
    unitsSold: number;
}

export interface Scope3EndOfLife {
    id: string;
    disposalType: DisposalType;
    wasteQuantity: number;
    unit: string;
}

export interface Scope3DownstreamLeased {
    id: string;
    productType: string;
    leaseType: LeaseType;
    quantity: number;
    unit: string;
}

export type PurchasedGoodsActivity = Activity & {
    scope3Category: "cat1_purchased_goods";
    scope3PurchasedGoods?: Scope3PurchasedGoods[];
};

export type CapitalGoodsActivity = Activity & {
    scope3Category: "cat2_capital_goods";
    scope3CapitalGoods?: Scope3CapitalGoods[];
};

export type FuelEnergyActivity = Activity & {
    scope3Category: "cat3_fuel_energy";
    scope3FuelEnergy?: Scope3FuelEnergy[];
};

export type TransportActivity = Activity & {
    scope3Category: "cat4_upstream_transport" | "cat9_downstream_transport";
    scope3Transport?: Scope3Transport[];
};

export type WasteActivity = Activity & {
    scope3Category: "cat5_waste";
    scope3Waste?: Scope3Waste[];
};

export type BusinessTravelActivity = Activity & {
    scope3Category: "cat6_business_travel";
    scope3BusinessTravel?: Scope3BusinessTravel[];
};

export type EmployeeCommutingActivity = Activity & {
    scope3Category: "cat7_employee_commuting";
    scope3EmployeeCommuting?: Scope3EmployeeCommuting[];
};

export type UpstreamLeasedActivity = Activity & {
    scope3Category: "cat8_upstream_leased";
    scope3UpstreamLeased?: Scope3UpstreamLeased[];
};

export type ProductProcessingActivity = Activity & {
    scope3Category: "cat10_product_processing";
    scope3ProductProcessing?: Scope3ProductProcessing[];
};

export type ProductUseActivity = Activity & {
    scope3Category: "cat11_product_use";
    scope3ProductUse?: Scope3ProductUse[];
};

export type EndOfLifeActivity = Activity & {
    scope3Category: "cat12_end_of_life";
    scope3EndOfLife?: Scope3EndOfLife[];
};

export type DownstreamLeasedActivity = Activity & {
    scope3Category: "cat13_downstream_leased";
    scope3DownstreamLeased?: Scope3DownstreamLeased[];
};

export type Scope3Activity =
    | PurchasedGoodsActivity
    | CapitalGoodsActivity
    | FuelEnergyActivity
    | TransportActivity
    | WasteActivity
    | BusinessTravelActivity
    | EmployeeCommutingActivity
    | UpstreamLeasedActivity
    | ProductProcessingActivity
    | ProductUseActivity
    | EndOfLifeActivity
    | DownstreamLeasedActivity;