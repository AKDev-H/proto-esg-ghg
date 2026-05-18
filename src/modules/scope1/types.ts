// Scope 1 Types - Direct Emissions

export type Scope1Subtype = 'vehicles' | 'stationary' | 'refrigerants'

export interface Activity {
    id: string
    scope: 'scope1'
    activityType: Scope1Subtype
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: DataStatus
    createdAt?: string
}

export interface EmissionFactor {
    id: string
    activityType: string
    factorValue: number
    activityUnit: string
    source?: string
    country?: string
}

export interface VehicleFormData {
    vehicleType: string
    fuelType: string
    quantity: number
    unit: string
    emissionFactorId?: string
}

export interface StationaryFormData {
    equipmentType: string
    fuelType: string
    quantity: number
    unit: string
    emissionFactorId?: string
}

export interface RefrigerantFormData {
    refrigerantType: string
    quantity: number
    emissionFactorId?: string
}

export interface Scope1Filters {
    subtype?: Scope1Subtype
    status?: DataStatus
    facilityId?: string
}

export interface VehicleActivity extends Activity {
    activityType: 'vehicles'
    scope1Vehicles?: Scope1Vehicle[]
}

export interface StationaryActivity extends Activity {
    activityType: 'stationary'
    scope1Stationary?: Scope1Stationary[]
}

export interface RefrigerantActivity extends Activity {
    activityType: 'refrigerants'
    scope1Refrigerants?: Scope1Refrigerant[]
}

export interface Scope1Vehicle {
    id: string
    vehicleType: string
    fuelType: string
    quantity: number
    unit: string
}

export interface Scope1Stationary {
    id: string
    equipmentType: string
    fuelType: string
    quantity: number
    unit: string
}

export interface Scope1Refrigerant {
    id: string
    refrigerantType: string
    quantity: number
    unit: string
}

export type DataStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export type FuelUnit = 'gallon' | 'liter' | 'scf'
export type WeightUnit = 'kg' | 'lb' | 'ton'