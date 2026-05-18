import { z } from 'zod'

export const EMISSION_SCOPES_ZOD = ['scope1', 'scope2', 'scope3'] as const
export const SCOPE3_CATEGORIES_ZOD = [
    'cat1_purchased_goods',
    'cat2_capital_goods',
    'cat3_fuel_energy',
    'cat4_upstream_transport',
    'cat5_waste',
    'cat6_business_travel',
    'cat7_employee_commuting',
    'cat8_upstream_leased',
    'cat9_downstream_transport',
    'cat10_product_processing',
    'cat11_product_use',
    'cat12_end_of_life',
    'cat13_downstream_leased'
] as const

export const factorSchema = z.object({
    category: z.enum(EMISSION_SCOPES_ZOD, {
        required_error: 'Category is required',
        invalid_type_error: 'Invalid category'
    }),
    activityType: z.string().min(1, 'Activity type is required'),
    activityUnit: z.string().min(1, 'Activity unit is required'),
    factorValue: z.number().positive('Factor value must be positive'),
    source: z.string().min(1, 'Source is required'),
    country: z.enum(['US', 'MY'], {
        required_error: 'Country is required',
        invalid_type_error: 'Invalid country'
    }),
    validFrom: z.string().min(1, 'Valid from date is required'),
    validTo: z.string().optional(),
    scope3Category: z.enum(SCOPE3_CATEGORIES_ZOD).optional(),
    isCustom: z.boolean().optional(),
    organizationId: z.string().optional(),
})

export type FactorInput = z.infer<typeof factorSchema>

export const factorFilterSchema = z.object({
    category: z.enum(EMISSION_SCOPES_ZOD).optional(),
    country: z.enum(['US', 'MY']).optional(),
    activityType: z.string().optional()
})

export type FactorFilterInput = z.infer<typeof factorFilterSchema>