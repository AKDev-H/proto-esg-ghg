import { z } from 'zod'

export const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['org_admin', 'sustainability_manager', 'data_entry_staff', 'viewer'], {
        required_error: 'Role is required',
        invalid_type_error: 'Invalid role'
    })
})

export const updateUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.enum(['org_admin', 'sustainability_manager', 'data_entry_staff', 'viewer']).optional()
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>