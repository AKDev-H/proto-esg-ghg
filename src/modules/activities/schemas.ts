// Activity Data Schemas

import { z } from 'zod'
import { EMISSION_SCOPES_ZOD, SCOPE3_CATEGORIES_ZOD } from '@/modules/emission-factors/schemas'

export const activityFilterSchema = z.object({
    scope: z.enum(EMISSION_SCOPES_ZOD).optional(),
    year: z.string().optional(),
    organizationId: z.string().optional(),
})

export type ActivityFilterInput = z.infer<typeof activityFilterSchema>

export const createActivitySchema = z.object({
    organizationId: z.string().min(1, 'Organization is required'),
    reportingYearId: z.string().min(1, 'Reporting year is required'),
    facilityId: z.string().optional(),
    scope: z.enum(EMISSION_SCOPES_ZOD, {
        required_error: 'Scope is required',
    }),
    scope3Category: z.enum(SCOPE3_CATEGORIES_ZOD).optional(),
    activityType: z.string().min(1, 'Activity type is required'),
    inputValue: z.number().positive('Input value must be positive'),
    inputUnit: z.string().min(1, 'Input unit is required'),
    emissionFactorId: z.string().optional(),
    comments: z.string().optional(),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>