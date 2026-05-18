# SKILL: types-generator

## Purpose
Generate centralized TypeScript type definitions for ESG Carbon Accounting modules.

## When to Use
- Creating new types for any module
- Refactoring inline types to centralized locations
- Adding types for API responses, form data, or component props

## Convention

### File Structure
```
src/modules/{module-name}/
├── types.ts      # All types for this module
└── schemas.ts   # All Zod schemas (if applicable)
```

### Naming Conventions
- Types: PascalCase (e.g., `Activity`, `EmissionFactor`)
- Interfaces: prefixed with `I` only if needed (prefer type aliases)
- Form data types: suffixed with `FormData` (e.g., `ElectricityFormData`)
- API response types: suffixed with `Response` (e.g., `ActivityResponse`)

### Type Organization
```typescript
// 1. Base types from Prisma (re-export if needed)
// 2. UI/Component types
// 3. Form data types
// 4. API request/response types
// 5. Utility types

// Example structure:
export interface Activity {
    id: string
    scope: 'scope1' | 'scope2' | 'scope3'
    // ...
}

export interface ActivityFilters {
    scope?: string
    year?: number
}

export type ActivityStatus = 'draft' | 'submitted' | 'approved'
```

## Files to Create

### src/modules/scope1/types.ts
```typescript
// Activity types
export interface Activity {
    id: string
    scope: 'scope1'
    activityType: string
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: 'draft' | 'submitted' | 'approved' | 'rejected'
}

// Emission factor type
export interface EmissionFactor {
    id: string
    activityType: string
    factorValue: number
    activityUnit: string
}

// Form data types
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
```

## Re-export Pattern
```typescript
// From auth/types.ts
export type { UserRole, Country } from '@/modules/auth/types'
```

## Validation Checklist
- [ ] All types have proper TypeScript types (no `any`)
- [ ] Optional fields marked with `?`
- [ ] Union types use literal types
- [ ] Form data uses proper number types (not strings)