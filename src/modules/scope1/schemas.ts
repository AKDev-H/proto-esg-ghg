import { z } from 'zod'

export const vehicleSchema = z.object({
    vehicleType: z.string().min(1, 'Vehicle type is required'),
    fuelType: z.string().min(1, 'Fuel type is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.enum(['gallon', 'liter'], {
        required_error: 'Unit is required',
        invalid_type_error: 'Invalid unit'
    }),
    emissionFactorId: z.string().min(1, 'Emission factor is required')
})

export const stationarySchema = z.object({
    equipmentType: z.string().min(1, 'Equipment type is required'),
    fuelType: z.string().min(1, 'Fuel type is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.enum(['gallon', 'liter', 'scf'], {
        required_error: 'Unit is required',
        invalid_type_error: 'Invalid unit'
    }),
    emissionFactorId: z.string().min(1, 'Emission factor is required')
})

export const refrigerantSchema = z.object({
    refrigerantType: z.string().min(1, 'Refrigerant type is required'),
    quantity: z.number().positive('Quantity must be positive'),
    emissionFactorId: z.string().min(1, 'Emission factor is required')
})

export type VehicleInput = z.infer<typeof vehicleSchema>
export type StationaryInput = z.infer<typeof stationarySchema>
export type RefrigerantInput = z.infer<typeof refrigerantSchema>