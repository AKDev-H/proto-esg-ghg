---
name: react-refactor
description: Refactor React components to move state locally, pass only needed props, and extract reusable components. Use when user asks to refactor, simplify, or clean up component code.
---

# React Component Refactoring Skill

## Overview

This skill guides the refactoring of React components to follow best practices:
1. **Local state**: Keep state where it's used (component owns its own state)
2. **Minimal props**: Pass only what the child needs, not entire objects
3. **Extract reusable**: Separate single-purpose components and reuse them

---

## Refactoring Steps

### Step 1: Analyze the Component

Read the component file and identify:
- What state exists (`useState`, `useReducer`)
- Where state is initialized and modified
- What props are passed in
- Which props are actually used in sub-components
- What UI parts are repeated or could be standalone

### Step 2: Move State to Local Component

**Rule**: State should live in the component that uses it, unless multiple components need to share it.

- If only one component uses the state → keep it there
- If child components need to modify parent state → pass setter or use callback
- If siblings need to share state → lift to common parent
- If deeply nested components need same state → consider context

**Before** (state in parent):
```tsx
// Parent component
function FormPage({ user }: { user: User }) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
    </div>
  )
}
```

**After** (state in child):
```tsx
// Keep state where it's used - no need to lift if parent doesn't need it
function FormPage({ user }: { user: User }) {
  return (
    <div>
      <NameInput defaultValue={user.name} />
      <EmailInput defaultValue={user.email} />
    </div>
  )
}

function NameInput({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue)
  return <input value={value} onChange={e => setValue(e.target.value)} />
}
```

### Step 3: Pass Only Needed Props

**Rule**: Destructure props and pass only what each child needs. Avoid passing entire objects when only specific fields are used.

**Before**:
```tsx
function UserCard({ user }: { user: User }) {
  return (
    <div>
      <Avatar user={user} />           // passes full user object
      <UserName user={user} />         // passes full user object
      <UserEmail user={user} />        // passes full user object
    </div>
  )
}
```

**After**:
```tsx
function UserCard({ user }: { user: User }) {
  return (
    <div>
      <Avatar src={user.avatarUrl} />
      <UserName name={user.name} />
      <UserEmail email={user.email} />
    </div>
  )
}
```

### Step 4: Extract Reusable Components

**Rule**: If a section of UI is used multiple times or has a single clear purpose, extract it.

Identify extractable patterns:
- Repeated JSX structures
- Single-responsibility pieces (one thing: button, input, card, list item)
- Logic that could be reused elsewhere

**Before**:
```tsx
function Dashboard() {
  return (
    <div>
      {/* Header section */}
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button className="btn-primary">Add New</button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">Users: 100</div>
        <div className="p-4 border rounded">Revenue: $5000</div>
        <div className="p-4 border rounded">Orders: 250</div>
      </div>

      {/* Table */}
      <table>...</table>
    </div>
  )
}
```

**After**:
```tsx
function Dashboard() {
  return (
    <div>
      <DashboardHeader
        title="Dashboard"
        actionLabel="Add New"
        onAction={() => {}}
      />

      <StatsGrid>
        <StatCard label="Users" value={100} />
        <StatCard label="Revenue" value="$5000" />
        <StatCard label="Orders" value={250} />
      </StatsGrid>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
```

---

## Implementation Guidelines

### File Organization

```
src/
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── features/              # Feature-specific components
│       └── dashboard/
│           ├── DashboardHeader.tsx
│           ├── StatCard.tsx
│           └── index.tsx     # Main component that composes above
```

### Component Extraction Pattern

1. Create new file for extracted component
2. Define explicit prop interface (no `any`)
3. Move related state/logic into extracted component
4. Import and use in main component
5. Export both from index.ts for clean imports

### Prop Drilling Prevention

If props must pass through many levels:
- Use composition (pass children)
- Create context for deeply shared data
- Pass setter functions instead of lifting state

---

## Common Patterns to Avoid

| Anti-pattern | Solution |
|--------------|-----------|
| Passing entire object `user={user}` when only `user.id` needed | Destructure: `userId={user.id}` |
| All state in top-level page component | Move state to component where it's used |
| Large monolithic component (500+ lines) | Extract logical sections into smaller components |
| Repeated JSX inline | Create reusable component |
| Props passed but not used in child | Remove unused prop or destructure only what's needed |

---

## Workflow

1. **Read** the original component completely
2. **Identify** state locations, prop usage, and repeated patterns
3. **Plan** what to extract - draw a simple mental diagram
4. **Create** new component files for extracted pieces
5. **Refactor** main component to use extracted components
6. **Verify** no functionality is broken
7. **Run** linter/typecheck to ensure correctness

If the user wants you to refactor a specific file, apply these steps to that file.