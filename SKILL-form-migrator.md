# SKILL: form-migrator

## Purpose
Migrate forms from useState to react-hook-form with Zod validation.

## When to Use
- Any form component using useState
- Form validation needed
- Form state needs to be shared

## Migration Steps

### Step 1: Import Types and Schemas
```typescript
// Before
import { useState } from 'react'
import { Input } from '@/components/ui/input'

// After
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { vehicleSchema } from '@/modules/scope1/schemas'
import type { VehicleFormData } from '@/modules/scope1/types'
```

### Step 2: Replace useState with useForm
```typescript
// Before
const [formData, setFormData] = useState({ quantity: '', unit: 'gallon' })
const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

// After
const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { unit: 'gallon' }
})
```

### Step 3: Replace Controlled Inputs
```typescript
// Before
<Input 
    value={formData.quantity} 
    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
/>

// After (for text/number inputs)
<Input 
    type="number"
    {...form.register('quantity', { valueAsNumber: true })}
/>

// After (for Select components)
<Select 
    value={form.watch('vehicleType')}
    onValueChange={(v) => form.setValue('vehicleType', v)}
>
```

### Step 4: Handle Form Submission
```typescript
// Before
const handleSubmit = (e) => {
    e.preventDefault()
    // use formData directly
}

// After
const onSubmit = (data: VehicleFormData) => {
    // data is already typed and validated
}
<form onSubmit={form.handleSubmit(onSubmit)}>
```

### Step 5: Add Error Display
```typescript
// Inline error
{form.formState.errors.quantity && (
    <p className="text-sm text-destructive">
        {form.formState.errors.quantity.message}
    </p>
)}

// Error summary
{Object.keys(form.formState.errors).length > 0 && (
    <div className="p-3 bg-destructive/10 text-destructive text-sm">
        Please fix the errors below.
    </div>
)}
```

## Common Patterns

### Select Component with RHF
```typescript
<Controller
    name="vehicleType"
    control={form.control}
    render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
                <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
                {VEHICLE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                        {t.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )}
/>
```

### Form Reset
```typescript
form.reset({
    quantity: 0,
    unit: 'gallon',
})
// or
form.reset()
```

### Loading State
```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
        await submitToApi(data)
        form.reset()
    } finally {
        setIsSubmitting(false)
    }
}
```

## Form Structure Template
```typescript
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formSchema } from '@/modules/{module}/schemas'
import type { FormData } from '@/modules/{module}/types'

export function FormComponent() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { /* initial values */ }
    })

    const onSubmit = async (data: FormData) => {
        // Submit logic
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields */}
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
        </form>
    )
}
```

## Validation Checklist
- [ ] All inputs use `form.register` or `Controller`
- [ ] Number inputs have `valueAsNumber: true`
- [ ] Error messages displayed inline
- [ ] Submit button shows loading state
- [ ] Form resets after successful submission
- [ ] Types imported from module types file
- [ ] Schema imported from module schemas file