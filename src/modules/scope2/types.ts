// Scope 2 Types - Indirect Energy Emissions

export interface Activity {
    id: string
    scope: 'scope2'
    activityType: 'electricity'
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: DataStatus
    scope2Electricity?: Scope2Electricity
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

export interface ElectricityFormData {
    consumption: number
    unit: EnergyUnit
    gridRegion: string
    emissionFactorId?: string
}

export interface Scope2Electricity {
    id: string
    consumption: number
    unit: string
    gridRegion?: string
}

export type DataStatus = 'draft' | 'submitted' | 'approved' | 'rejected'
export type EnergyUnit = 'kWh' | 'MWh' | 'MJ'

export interface Scope2Filters {
    gridRegion?: string
    status?: DataStatus
    facilityId?: string
}

export interface ElectricityActivity extends Activity {
    scope2Electricity: Scope2Electricity
}