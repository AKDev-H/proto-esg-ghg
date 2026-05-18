import { z } from 'zod'

export const electricitySchema = z.object({
    consumption: z.number().positive('Consumption must be positive'),
    unit: z.enum(['kWh', 'MWh', 'MJ'], {
        required_error: 'Unit is required',
        invalid_type_error: 'Invalid unit'
    }),
    gridRegion: z.string().optional(),
    emissionFactorId: z.string().min(1, 'Emission factor is required')
})

export type ElectricityInput = z.infer<typeof electricitySchema>