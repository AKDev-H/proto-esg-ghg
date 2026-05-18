// Users Types

import type { UserRole } from '@/modules/auth/types'

export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    organizationId?: string | null
    createdAt: string
    updatedAt?: string
}

export interface CreateUserFormData {
    name: string
    email: string
    password: string
    role: UserRole
}

export interface UpdateUserFormData {
    name?: string
    email?: string
    role?: UserRole
}

export interface UserFilters {
    role?: UserRole
    search?: string
}

export interface UserListItem {
    id: string
    name: string
    email: string
    role: UserRole
    createdAt: string
}

export interface UserWithOrganization extends User {
    organization?: {
        id: string
        name: string
    }
}