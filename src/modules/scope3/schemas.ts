import { z } from 'zod'

export const purchasedGoodsSchema = z.object({
    materialType: z.string().min(1, 'Material type is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.enum(['kg', 'lb', 'ton', 'unit'], {
        required_error: 'Unit is required',
        invalid_type_error: 'Invalid unit'
    }),
    supplier: z.string().optional(),
    supplierCountry: z.string().optional()
})

export const capitalGoodsSchema = z.object({
    equipmentType: z.enum(['machinery', 'precision_tooling', 'computer', 'vehicle', 'building', 'furniture', 'other'], {
        required_error: 'Equipment type is required',
        invalid_type_error: 'Invalid equipment type'
    }),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    purchaseYear: z.number().int().min(2000).max(2100, 'Invalid purchase year')
})

export const fuelEnergySchema = z.object({
    fuelType: z.enum(['natural_gas', 'diesel', 'gasoline', 'coal', 'biomass', 'electricity'], {
        required_error: 'Fuel type is required',
        invalid_type_error: 'Invalid fuel type'
    }),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    activityDescription: z.enum(['extraction', 'production', 'transmission', 'distribution'], {
        required_error: 'Activity description is required',
        invalid_type_error: 'Invalid activity description'
    })
})

export const transportSchema = z.object({
    mode: z.enum(['truck', 'rail', 'ship', 'aircraft', 'van'], {
        required_error: 'Transport mode is required',
        invalid_type_error: 'Invalid transport mode'
    }),
    weight: z.number().positive('Weight must be positive'),
    distance: z.number().positive('Distance must be positive'),
    transportCategory: z.enum(['upstream', 'downstream'], {
        required_error: 'Transport category is required',
        invalid_type_error: 'Invalid transport category'
    })
})

export const wasteSchema = z.object({
    wasteType: z.enum(['hazardous', 'non_hazardous', 'electronic', 'plastic', 'metal', 'organic'], {
        required_error: 'Waste type is required',
        invalid_type_error: 'Invalid waste type'
    }),
    disposalMethod: z.enum(['landfill', 'incineration', 'recycling', 'composting', 'energy_recovery', 'anaerobic_digestion'], {
        required_error: 'Disposal method is required',
        invalid_type_error: 'Invalid disposal method'
    }),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.enum(['kg', 'lb', 'ton'], {
        required_error: 'Unit is required',
        invalid_type_error: 'Invalid unit'
    })
})

export const businessTravelSchema = z.object({
    travelType: z.enum(['flight', 'train', 'taxi', 'bus', 'car', 'hotel'], {
        required_error: 'Travel type is required',
        invalid_type_error: 'Invalid travel type'
    }),
    distance: z.number().positive('Distance must be positive'),
    numberOfTrips: z.number().int().positive('Number of trips must be positive'),
    origin: z.string().optional(),
    destination: z.string().optional()
})

export const employeeCommutingSchema = z.object({
    transportMode: z.enum(['car', 'bus', 'train', 'motorcycle', 'bicycle', 'walking'], {
        required_error: 'Transport mode is required',
        invalid_type_error: 'Invalid transport mode'
    }),
    averageDistancePerDay: z.number().positive('Average distance per day must be positive'),
    daysPerYear: z.number().int().positive().min(1).max(365, 'Days per year must be between 1 and 365'),
    numberOfEmployees: z.number().int().positive('Number of employees must be positive')
})

export const upstreamLeasedSchema = z.object({
    assetType: z.enum(['vehicle', 'equipment', 'building', 'machinery'], {
        required_error: 'Asset type is required',
        invalid_type_error: 'Invalid asset type'
    }),
    leaseType: z.enum(['operational', 'financial'], {
        required_error: 'Lease type is required',
        invalid_type_error: 'Invalid lease type'
    }),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required')
})

export const productProcessingSchema = z.object({
    productType: z.string().min(1, 'Product type is required'),
    processingType: z.enum(['assembly', 'fabrication', 'refining', 'packaging', 'other'], {
        required_error: 'Processing type is required',
        invalid_type_error: 'Invalid processing type'
    }),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.enum(['kg', 'lb', 'ton', 'unit'], {
        required_error: 'Unit is required',
        invalid_type_error: 'Invalid unit'
    })
})

export const productUseSchema = z.object({
    productType: z.string().min(1, 'Product type is required'),
    annualEnergyKwh: z.number().positive('Annual energy must be positive'),
    lifetimeYears: z.number().int().positive('Lifetime must be positive'),
    unitsSold: z.number().int().positive('Units sold must be positive')
})

export const endOfLifeSchema = z.object({
    disposalType: z.enum(['landfill', 'incineration', 'recycling', 'composting', 'energy_recovery'], {
        required_error: 'Disposal type is required',
        invalid_type_error: 'Invalid disposal type'
    }),
    wasteQuantity: z.number().positive('Waste quantity must be positive'),
    unit: z.enum(['kg', 'lb', 'ton'], {
        required_error: 'Unit is required',
        invalid_type_error: 'Invalid unit'
    })
})

export const downstreamLeasedSchema = z.object({
    productType: z.string().min(1, 'Product type is required'),
    leaseType: z.enum(['operational', 'financial'], {
        required_error: 'Lease type is required',
        invalid_type_error: 'Invalid lease type'
    }),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required')
})

export type PurchasedGoodsInput = z.infer<typeof purchasedGoodsSchema>
export type CapitalGoodsInput = z.infer<typeof capitalGoodsSchema>
export type FuelEnergyInput = z.infer<typeof fuelEnergySchema>
export type TransportInput = z.infer<typeof transportSchema>
export type WasteInput = z.infer<typeof wasteSchema>
export type BusinessTravelInput = z.infer<typeof businessTravelSchema>
export type EmployeeCommutingInput = z.infer<typeof employeeCommutingSchema>
export type UpstreamLeasedInput = z.infer<typeof upstreamLeasedSchema>
export type ProductProcessingInput = z.infer<typeof productProcessingSchema>
export type ProductUseInput = z.infer<typeof productUseSchema>
export type EndOfLifeInput = z.infer<typeof endOfLifeSchema>
export type DownstreamLeasedInput = z.infer<typeof downstreamLeasedSchema>