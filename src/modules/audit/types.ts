// Audit Types

export type AuditAction = 
    | 'create'
    | 'update'
    | 'delete'
    | 'submit'
    | 'approve'
    | 'reject'
    | 'login'
    | 'logout'

export interface AuditLog {
    id: string
    organizationId: string
    userId?: string
    action: AuditAction
    entityType: string
    entityId: string
    oldValue?: Record<string, unknown>
    newValue?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    createdAt: string
    user?: AuditUser
}

export interface AuditUser {
    id?: string
    name: string
    email: string
}

export interface AuditFilter {
    action?: AuditAction | 'all'
    entityType?: string | 'all'
    search?: string
    startDate?: string
    endDate?: string
}

export interface AuditLogEntry {
    id: string
    timestamp: string
    user: string
    action: string
    entityType: string
    details?: string
}