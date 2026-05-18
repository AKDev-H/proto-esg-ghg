# ESG Carbon Accounting Platform - Quality Assurance Skill

## Overview
This skill provides comprehensive guidelines for ensuring all APIs, fetches, server requests, responses, validation, backend logic, and client-side integrations work correctly in this Next.js 16 + Prisma + PostgreSQL project.

---

## API Route Best Practices

### 1. Always Handle Authentication
```typescript
// ALWAYS include auth check at the start of every API route
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ... rest of handler
}
```

### 2. Consistent Error Response Format
```typescript
// Always return consistent error structure
return NextResponse.json({ error: "Descriptive error message" }, { status: 400 });
```

### 3. Always Use try-catch
```typescript
export async function GET() {
    try {
        // ... logic
        return NextResponse.json(data);
    } catch (error) {
        console.error("Feature error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
```

### 4. Always Validate Inputs
```typescript
import { z } from "zod";

const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["admin", "user"]),
});

export async function POST(request: NextRequest) {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }
    // ... proceed with validated data
}
```

### 5. Return Appropriate Status Codes
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### 6. Always Return JSON (Even for Errors)
```typescript
// GOOD
return NextResponse.json({ error: "Not found" }, { status: 404 });

// BAD - Don't do this
return new Response("Not found", { status: 404 });
```

---

## Client-Side Fetch Best Practices

### 1. Always Check Response Status
```typescript
async function fetchData() {
    const res = await fetch("/api/endpoint");
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
    }
    return res.json();
}
```

### 2. Handle Loading States
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    async function load() {
        try {
            setLoading(true);
            const data = await fetchData();
            setData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }
    load();
}, []);
```

### 3. Handle Null/Undefined Gracefully
```typescript
// BAD - causes NaN
<div>{data.value.toLocaleString()}</div>

// GOOD - provides defaults
<div>{data?.value?.toLocaleString() ?? "0"}</div>

// Or use optional chaining with fallback
<div>{(data?.value ?? 0).toFixed(2)}</div>
```

### 4. Handle Empty States
```typescript
if (loading) return <Spinner />;
if (!data?.length) return <EmptyState message="No items found" />;
return <DataList data={data} />;
```

### 5. Display Error States
```typescript
if (error) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
}
```

---

## TypeScript Best Practices

### 1. Define Interfaces for API Responses
```typescript
interface Organization {
    id: string;
    name: string;
    country: string;
    _count?: {
        users: number;
        facilities: number;
    };
}
```

### 2. Use Type Guards for Fetch Responses
```typescript
const isValidData = (data: unknown): data is DashboardData => {
    return (
        typeof data === "object" &&
        data !== null &&
        "total" in data &&
        "byScope" in data
    );
};

const res = await fetch("/api/dashboard/summary");
if (res.ok) {
    const data = await res.json();
    if (isValidData(data)) {
        setData(data);
    }
}
```

### 3. Always Handle Nullable Fields
```typescript
// Prisma returns optional fields as undefined
const total = activity.calculatedEmissions ?? 0; // Always provide default
```

---

## Form Validation Best Practices

### 1. Use Zod Schemas
```typescript
import { z } from "zod";

export const organizationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    country: z.enum(["US", "MY"]),
    reportingYear: z.number().min(2000).max(2100),
}).required();

type OrganizationFormData = z.infer<typeof organizationSchema>;
```

### 2. Use React Hook Form + Zod
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
        country: "US",
        reportingYear: new Date().getFullYear(),
    },
});
```

### 3. Display Validation Errors
```typescript
<Input {...register("name")} />
{errors.name && (
    <p className="text-sm text-destructive">{errors.name.message}</p>
)}
```

---

## Common Issues & Fixes

### NaN Display Issues
```typescript
// PROBLEM: data.value is undefined, causing NaN
{(data.value / 1000).toFixed(2)} // NaN if undefined

// SOLUTION 1: Optional chaining with fallback
{((data?.value ?? 0) / 1000).toFixed(2)}

// SOLUTION 2: Use nullish coalescing
{(data?.value ?? 0).toLocaleString()}
```

### Division by Zero
```typescript
// PROBLEM
const percentage = (value / total) * 100; // Infinity if total is 0

// SOLUTION
const percentage = total > 0 ? (value / total) * 100 : 0;
```

### Array Index Access
```typescript
// PROBLEM
users[0].email; // TypeError if array is empty

// SOLUTION
users[0]?.email ?? "N/A";
```

### Promise.all Error Handling
```typescript
// PROBLEM: One failure stops all
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// SOLUTION: Use allSettled or handle individually
const results = await Promise.allSettled([fetchA(), fetchB()]);
const a = results[0].status === "fulfilled" ? results[0].value : null;
```

---

## Debugging Checklist

When something isn't working, verify:

1. **API Route** - Does it return valid JSON?
2. **Network Tab** - Is the request hitting the correct endpoint?
3. **Response** - Is the data structure what you expect?
4. **Auth** - Is the user authenticated?
5. **DB** - Does Prisma query work correctly?
6. **Types** - Are you handling undefined/null?
7. **Console** - Any TypeErrors?
8. **Network** - 401/403 errors?

---

## Testing Checklist Before Each PR

- [ ] All API routes have auth checks
- [ ] All API routes have try-catch
- [ ] All API routes return consistent error format
- [ ] All inputs are validated
- [ ] Client components handle loading states
- [ ] Client components handle error states
- [ ] Client components handle empty states
- [ ] Null/undefined values have fallbacks
- [ ] No NaN or Infinity values can appear
- [ ] TypeScript compiles without errors