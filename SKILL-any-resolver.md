# SKILL: any-resolver

## Purpose
Replace `any` types with proper TypeScript types for type safety.

## When to Use
- Any occurrence of `any` type
- Type assertions that bypass TypeScript
- Generic object types

## Common Patterns to Fix

### 1. Session/User Types
```typescript
// Bad
(session.user as any).customField = value

// Good - Define proper types in auth/types.ts
export interface SessionUser {
    id: string
    email: string
    name: string
    role: UserRole
    organizationId: string | null
}

// Usage
const session = await auth()
if (session?.user) {
    session.user.id // typed
}
```

### 2. Prisma Where Clauses
```typescript
// Bad
const where: any = {}
where.scope = 'scope1'
activities.findMany({ where: where as any })

// Good - Use proper Prisma types
import type { Prisma } from '@prisma/client'

const where: Prisma.ActivityDataWhereInput = {}
where.scope = 'scope1'
activities.findMany({ where })
```

### 3. API Response Types
```typescript
// Bad
const data: any = await response.json()

// Good
interface ActivityResponse {
    id: string
    scope: string
    // ... exact fields
}
const data: ActivityResponse = await response.json()
```

### 4. Form Data State
```typescript
// Bad
const [data, setData] = useState<any>({})

// Good
interface FormData {
    name: string
    email: string
    quantity: number
}
const [data, setData] = useState<FormData>({ name: '', email: '', quantity: 0 })
```

### 5. Event Handlers
```typescript
// Bad
const handleChange = (e: any) => { ... }

// Good
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value // typed
}
```

### 6. Fetch Response Handling
```typescript
// Bad
fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data as any))

// Good
interface DataType { ... }
fetch('/api/data')
    .then((res: Response) => res.json() as Promise<DataType>)
    .then((data: DataType) => setData(data))
```

## Quick Fixes for Common Cases

### Replace `as any` in API Routes
```typescript
// Before
await prisma.activityData.findMany({
    where: where as any
})

// After - Import Prisma types
import type { Prisma } from '@prisma/client'

await prisma.activityData.findMany({
    where: where as Prisma.ActivityDataWhereInput
})
```

### Replace `as any` in Auth
```typescript
// Before
(session.user as any).organizationId = orgId

// After - Use proper session type
declare module 'next-auth' {
    interface Session {
        user: SessionUser  // Already defined in auth/types.ts
    }
}
```

### Replace inline object types
```typescript
// Bad
const data: { id: string; name: string } = { id: '1', name: 'Test' }

// Good - Use interface
interface Data {
    id: string
    name: string
}
const data: Data = { id: '1', name: 'Test' }

// Or use type alias
type Data = { id: string; name: string }
```

## Checklist for any Removal

| Location | Solution |
|----------|----------|
| `lib/auth.ts` | Define SessionUser type properly |
| `api/*/route.ts` | Use Prisma.WhereInput types |
| `page.tsx` | Use interface for form state |
| Event handlers | Use proper React types |
| API responses | Define response interfaces |

## TypeScript Strict Mode

Enable in `tsconfig.json`:
```json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true
    }
}
```

This will flag all `any` usages as errors during build.