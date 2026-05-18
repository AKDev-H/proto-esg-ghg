# SKILL: schema-generator

## Purpose
Generate Zod validation schemas for form validation and API request validation.

## When to Use
- Creating form validation for any page
- Validating API request bodies
- Defining shared validation rules

## Convention

### File Location
```
src/modules/{module-name}/schemas.ts
```

### Schema Organization
```typescript
import { z } from 'zod'

// 1. Input schemas (for forms)
// 2. Query schemas (for API params)
// 3. Response schemas (rarely needed)

// Schema naming:
// - Form schemas: `{action}{Entity}Schema` (e.g., `createActivitySchema`)
// - Form types: inferred from schema using `z.infer<typeof schema>`

export const createActivitySchema = z.object({
    scope: z.enum(['scope1', 'scope2', 'scope3']),
    activityType: z.string().min(1),
    inputValue: z.number().positive(),
    inputUnit: z.string().min(1),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>
```

### Validation Patterns

#### String validation
```typescript
z.string()
  .min(1, 'Required')
  .max(255)
  .email('Invalid email')
```

#### Number validation
```typescript
z.number()
  .positive('Must be positive')
  .min(0)
  .max(1000000)
```

#### Enum validation
```typescript
z.enum(['scope1', 'scope2', 'scope3'])
z.nativeEnum(EmissionScope) // If using Prisma enum
```

#### Optional fields
```typescript
z.string().optional()
z.string().nullable()
```

#### Conditional validation
```typescript
z.object({
    type: z.enum(['A', 'B']),
    value: z.string().when('type', {
        is: 'A',
        then: z.string().min(1),
        otherwise: z.string().optional()
    })
})
```

### Error Messages
- Always provide custom error messages
- Use natural language: "Email is required" not "string.empty"
- Be specific: "Password must be at least 6 characters"

## Common Patterns

### Form Schema with React Hook Form
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createActivitySchema } from '@/modules/scope1/schemas'
import type { CreateActivityInput } from '@/modules/scope1/schemas'

export function ActivityForm() {
    const form = useForm<CreateActivityInput>({
        resolver: zodResolver(createActivitySchema),
        defaultValues: {
            scope: 'scope1',
            inputValue: 0,
        }
    })
    
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <input {...form.register('inputValue', { valueAsNumber: true })} />
            {form.formState.errors.inputValue && (
                <span>{form.formState.errors.inputValue.message}</span>
            )}
        </form>
    )
}
```

## Validation Checklist
- [ ] All required fields validated
- [ ] Custom error messages for all validations
- [ ] Number fields use `valueAsNumber: true` in register
- [ ] Schema inferred type used in form component
- [ ] Optional chaining for nullable fields