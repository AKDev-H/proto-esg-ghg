// Emission Factors Types
import { z } from 'zod'
import { EMISSION_SCOPES_ZOD, SCOPE3_CATEGORIES_ZOD, factorSchema } from './schemas'
export type { EmissionScope, Scope3Category } from '@/modules/auth/types'
export { EMISSION_SCOPES_ZOD, SCOPE3_CATEGORIES_ZOD }

export type FactorFormData = z.infer<typeof factorSchema>

export interface EmissionFactor {
    id: string
    category: string
    scope3Category?: string
    activityType: string
    activityUnit: string
    factorValue: number
    source: string
    country: 'US' | 'MY'
    validFrom: string
    validTo?: string | null
    isCustom?: boolean
    organizationId?: string | null
    sourceRef?: FactorSource
}

export interface FactorSource {
    id: string
    name: string
    abbreviation: string
    description?: string
    url?: string
}

export type Country = 'US' | 'MY'

export interface FactorFilters {
    category?: string
    country?: Country
    activityType?: string
    scope3Category?: string
}

export interface FactorListItem {
    id: string
    activityType: string
    activityUnit: string
    factorValue: number
    source: string
    country: Country
    validFrom: string
}