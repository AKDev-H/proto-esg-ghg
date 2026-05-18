# ESG Carbon Accounting Platform

A production-ready multi-tenant SaaS platform for manufacturing organizations to track, calculate, and report GHG emissions across Scope 1, 2, and 3.

## Features

- **Multi-tenant SaaS**: Support for multiple organizations with role-based access control
- **Country-specific configurations**: US and Malaysia with local units and currencies
- **Scope tracking**: Full support for Scope 1, 2, and 3 emissions
- **Manufacturing focus**: Categories 1, 4, 9, 11, and 12 for value chain emissions
- **Unit conversions**: Automatic conversion from local units to standard units (kg, km, liter, kWh)
- **Dashboard**: Real-time visualization with charts (pie, bar, line)
- **Audit trail**: Complete activity logging
- **Approval workflow**: Draft → Submit → Approve/Reject states

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 6
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **PDF/Excel**: @react-pdf/renderer, xlsx

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update your `DATABASE_URL` to point to your PostgreSQL database.

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

### Public
- `/login` - User authentication
- `/onboarding` - Create new organization

### Dashboard (Authenticated)
- `/` - Main dashboard with charts
- `/activities/scope1` - Scope 1 data entry (vehicles, stationary, refrigerants)
- `/activities/scope2` - Scope 2 data entry (electricity)
- `/activities/scope3` - Scope 3 data entry (purchased goods, transport, product use, end-of-life)
- `/factors` - Emission factor management
- `/reports` - Report generation
- `/audit` - Audit trail
- `/settings/organization` - Organization settings
- `/settings/users` - User management

## API Routes

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Organizations
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/[id]` - Get organization
- `PUT /api/organizations/[id]` - Update organization

### Activities
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity
- `GET /api/activities/[id]` - Get activity
- `PUT /api/activities/[id]` - Update activity
- `POST /api/activities/[id]/submit` - Submit for approval
- `POST /api/activities/[id]/approve` - Approve/reject

### Factors
- `GET /api/factors` - List factors
- `POST /api/factors` - Create factor
- `GET /api/factors/[id]` - Get factor
- `PUT /api/factors/[id]` - Update factor

### Dashboard
- `GET /api/dashboard/summary?year=2024` - Get summary
- `GET /api/dashboard/trend?years=2022,2023,2024` - Get trend data

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `GET /api/reports/[id]` - Get report

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

## User Roles

| Role | Permissions |
|------|-------------|
| super_admin | All operations, manage all organizations |
| org_admin | Manage org, users, all emissions data |
| sustainability_manager | View/edit emissions, generate reports |
| data_entry_staff | Enter activity data, submit for approval |
| viewer | View-only access to dashboard/reports |

## Country Configurations

| Configuration | United States | Malaysia |
|---------------|----------------|----------|
| Distance | mile | km |
| Weight | lb | kg |
| Fuel | gallon | liter |
| Currency | USD | MYR |
| Factor Sources | EPA, DEFRA | Malaysia Grid, DEFRA |

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
```

## License

MIT