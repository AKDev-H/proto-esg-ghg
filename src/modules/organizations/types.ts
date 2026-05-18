// Organizations Types

import type { Country } from '@/modules/auth/types'

export type IndustryType = 
    | 'automotive'
    | 'electronics'
    | 'food_beverage'
    | 'chemicals'
    | 'textiles'
    | 'plastics'
    | 'metals'
    | 'machinery'
    | 'paper_packaging'
    | 'other'

export interface Organization {
    id: string
    name: string
    slug: string
    country: Country
    currency: string
    reportingYear: number
    industryType: IndustryType
    settings?: OrganizationSettings
    createdAt: string
    updatedAt?: string
}

export interface OrganizationSettings {
    distanceUnit: 'mile' | 'km'
    weightUnit: 'lb' | 'kg'
    fuelUnit: 'gallon' | 'liter'
    currency: 'USD' | 'MYR'
    factorSource: string
}

export interface OrganizationFormData {
    name: string
    country: Country
    reportingYear: number
    industryType: IndustryType
    adminEmail: string
    adminPassword: string
    adminName: string
}

export interface OrganizationListItem {
    id: string
    name: string
    slug: string
    country: Country
    currency: string
    industryType: IndustryType
    createdAt: string
    userCount?: number
    facilityCount?: number
}

export interface OrganizationDetail extends Organization {
    facilities?: Facility[]
    users?: OrganizationUser[]
    reportingYears?: ReportingYear[]
}

export interface Facility {
    id: string
    name: string
    location: string
    address?: string
    facilityType?: string
}

export interface OrganizationUser {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
}

export interface ReportingYear {
    id: string
    year: number
    status: 'draft' | 'submitted' | 'approved' | 'verified'
    submittedAt?: string
    approvedBy?: string
    approvedAt?: string
}