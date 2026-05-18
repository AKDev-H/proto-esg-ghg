import { z } from 'zod'

export const onboardingSchema = z.object({
    name: z.string().min(2, 'Organization name is required'),
    country: z.enum(['US', 'MY'], {
        required_error: 'Country is required',
        invalid_type_error: 'Invalid country'
    }),
    reportingYear: z.number().int().min(2020, 'Year must be 2020 or later'),
    industryType: z.string().min(1, 'Industry type is required'),
    adminEmail: z.string().email('Valid email is required'),
    adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
    adminName: z.string().min(2, 'Admin name is required')
})

export const updateOrganizationSchema = z.object({
    name: z.string().min(2).optional(),
    settings: z.object({
        distanceUnit: z.enum(['mile', 'km']).optional(),
        weightUnit: z.enum(['lb', 'kg']).optional(),
        fuelUnit: z.enum(['gallon', 'liter']).optional(),
        currency: z.enum(['USD', 'MYR']).optional(),
        factorSource: z.string().optional()
    }).optional()
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>