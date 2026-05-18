# ESG Carbon Accounting Platform - Technical Specification

## Overview
A production-ready multi-tenant SaaS platform for manufacturing organizations in US and Malaysia to track, calculate, and report GHG emissions across Scope 1, 2, and 3.

---

## System Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes, React Hook Form, Zod validation
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 6
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer
- **Excel Export**: xlsx

---

## Country Configurations

| Configuration | United States (US) | Malaysia (MY) |
|---------------|-------------------|---------------|
| Distance Unit | mile | km |
| Weight Unit | lb | kg |
| Fuel Unit | gallon | liter |
| Currency | USD | MYR |
| Default Factor Source | EPA / DEFRA | Malaysia Grid / DEFRA |

---

## Standard Units (Internal Storage)

All data stored in standard units:
- **Weight**: kg
- **Distance**: km
- **Fuel**: liter
- **Energy**: kWh
- **Emissions**: kgCO2e

---

## Scope Definitions

### Scope 1: Direct Emissions
- Company vehicles (fleet fuel consumption)
- Stationary fuel combustion ( boilers, furnaces)
- Refrigerants (HVAC, cooling systems)

### Scope 2: Indirect Energy Emissions
- Purchased electricity
- Purchased steam/heat (future)

### Scope 3: Value Chain Emissions

All 15 GHG Protocol categories. **Bold** = high impact for manufacturing.

#### Upstream Categories (1-8) - Emissions before your product leaves the factory

| Category | Description | Activities Tracked | Importance |
|----------|-------------|-------------------|------------|
| **Cat 1** | **Purchased Goods & Services** | Raw materials (steel, plastic, chemicals), office supplies, services | 🔥 HIGH |
| **Cat 2** | **Capital Goods** | Machinery, equipment, vehicles, buildings purchased | 🔥 HIGH |
| **Cat 3** | Fuel & Energy Related Activities | Fuel extraction/production, electricity transmission losses | ⚡ MEDIUM |
| **Cat 4** | Upstream Transportation & Distribution | Shipping materials to factory, inbound logistics | 🔥 HIGH |
| **Cat 5** | Waste Generated in Operations | Scrap, disposal, recycling from manufacturing | 🗑️ MEDIUM |
| **Cat 6** | Business Travel | Flights, hotels, employee transport for work | ✈️ LOW |
| **Cat 7** | Employee Commuting | Staff travel to/from work | 🚗 LOW |
| **Cat 8** | Upstream Leased Assets | Assets you lease (not own) | 🏢 LOW |

#### Downstream Categories (9-15) - Emissions after your product leaves the factory

| Category | Description | Activities Tracked | Importance |
|----------|-------------|-------------------|------------|
| **Cat 9** | **Downstream Transportation & Distribution** | Delivering products to customers | 🔥 HIGH |
| Cat 10 | Processing of Sold Products | Product used as input by another company | 📦 LOW |
| **Cat 11** | **Use of Sold Products** | Energy consumed during product use by customers | 🔥🔥 HIGHEST |
| **Cat 12** | **End-of-Life Treatment of Sold Products** | Recycling, landfill, disposal of your products | 🔥 HIGH |
| Cat 13 | Downstream Leased Assets | Products you lease to customers | 🏭 LOW |
| Cat 14 | Franchises | Emissions from franchise operations | 🛒 N/A |
| Cat 15 | Investments | Emissions from investments (finance sector) | 💰 N/A |

#### Manufacturing Priority Guide

**Must Track** (80-95% of scope 3):
- Cat 1: Purchased Goods
- Cat 11: Product Use

**Should Track** (complete picture):
- Cat 4: Upstream Transport
- Cat 9: Downstream Transport
- Cat 12: End-of-Life

**Optional** (if relevant):
- Cat 2: Capital Goods
- Cat 3: Fuel & Energy
- Cat 5: Waste

**Not Applicable** (manufacturing):
- Cat 6, 7, 8, 10, 13, 14, 15

---

## Database Schema (Prisma)

### Core Models

#### Organization
- id, name, slug
- country (US/MY)
- currency
- reporting_year
- industry_type (manufacturing subtypes)
- settings (JSON for country-specific configs)
- created_at, updated_at

#### User
- id, email, password_hash, name
- role (super_admin, org_admin, sustainability_manager, data_entry_staff, viewer)
- organization_id (nullable for super_admin)
- created_at, updated_at

#### Facility
- id, organization_id, name
- location, address
- facility_type
- created_at, updated_at

#### ReportingYear
- id, organization_id, year
- status (draft, submitted, approved, verified)
- submitted_at, approved_by
- created_at, updated_at

---

### Emission Factor Models

#### EmissionFactor
- id, category (scope1/scope2/scope3_cat1/2/3/4/5/6/7/8/9/10/11/12/13)
- activity_type (electricity/gas/diesel/etc)
- activity_unit
- factor_value (kgCO2e per unit)
- source (EPA/DEFRA only - GHG Protocol compliant)
- country (US/MY)
- valid_from, valid_to
- is_custom, organization_id (nullable)
- created_at, updated_at

**Factor Source Policy**: Only EPA/DEFRA factors allowed for GHG Protocol compliance. Custom factors require documentation.

#### FactorSource
- id, name (EPA, DEFRA, Malaysia Grid, etc)
- abbreviation
- description
- url
- created_at

---

### Activity Data Models

#### ActivityData
- id, organization_id, reporting_year_id, facility_id
- scope (scope1/scope2/scope3)
- category (for scope3)
- activity_type
- input_value, input_unit
- converted_value, converted_unit (standard)
- emission_factor_id
- calculated_emissions (kgCO2e)
- data_status (draft/submitted/approved)
- submitted_by, approved_by
- comments
- created_at, updated_at

#### Scope1Vehicles
- id, activity_data_id
- vehicle_type, fuel_type
- quantity, unit

#### Scope1Stationary
- id, activity_data_id
- equipment_type, fuel_type
- quantity, unit

#### Scope1Refrigerants
- id, activity_data_id
- refrigerant_type
- quantity, unit (kg)

#### Scope2Electricity
- id, activity_data_id
- consumption, unit
- grid_region (for location-based factors)

#### Scope3PurchasedGoods
- id, activity_data_id
- material_type, quantity, unit
- supplier_id, supplier_country

#### Scope3Transportation
- id, activity_data_id
- scope_category (upstream/downstream)
- transport_mode, weight, distance

#### Scope3ProductUse
- id, activity_data_id
- product_type, annual_energy_kwh
- lifetime_years, units_sold

#### Scope3EndOfLife
- id, activity_data_id
- disposal_type, waste_quantity, unit

#### Scope3CapitalGoods
- id, activity_data_id
- equipment_type, quantity, unit
- purchase_year

#### Scope3FuelEnergy
- id, activity_data_id
- fuel_type, quantity, unit
- activity_description (extraction/production/transmission)

#### Scope3Waste
- id, activity_data_id
- waste_type, disposal_method
- quantity, unit

#### Scope3BusinessTravel
- id, activity_data_id
- travel_type (flight/train/hotel/taxi)
- distance, origin, destination
- number_of_trips

#### Scope3EmployeeCommuting
- id, activity_data_id
- transport_mode
- average_distance_per_day, days_per_year
- number_of_employees

#### Scope3UpstreamLeased
- id, activity_data_id
- asset_type, lease_type
- quantity, unit

#### Scope3ProductProcessing
- id, activity_data_id
- product_type, processing_type
- quantity, unit

#### Scope3DownstreamLeased
- id, activity_data_id
- product_type, lease_type
- quantity, unit

---

### Supporting Models

#### Supplier
- id, organization_id, name
- country, contact_email
- industry_type
- created_at, updated_at

#### Product
- id, organization_id, name
- product_type, category
- created_at, updated_at

#### Report
- id, organization_id, reporting_year
- report_type (esg_summary/detailed)
- file_path (for stored PDF/Excel)
- status
- generated_at, generated_by
- created_at, updated_at

#### AuditLog
- id, organization_id, user_id
- action (create/update/delete/approve/submit)
- entity_type, entity_id
- old_value, new_value
- ip_address, user_agent
- created_at

---

### Approval Workflow

#### ApprovalRequest
- id, activity_data_id, requested_by
- status (pending/approved/rejected)
- comments, reviewed_by, reviewed_at
- created_at, updated_at

---

## Module Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── api/
│   │   │   └── [...nextauth]/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── organizations/
│   │   ├── api/
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── scope1/
│   │   ├── api/
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── scope2/
│   │   ├── api/
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── scope3/
│   │   ├── api/
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── emission-factors/
│   │   ├── api/
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── calculations/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── reports/
│   │   ├── api/
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   └── dashboard/
│       ├── api/
│       ├── components/
│       └── types.ts
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils/
│   └── constants/
│
├── components/
│   └── ui/
│       └── (shadcn components)
│
└── app/
    ├── (auth)/
    │   ├── login/
    │   └── register/
    │
    ├── (dashboard)/
    │   ├── page.tsx (main dashboard)
    │   ├── activities/
    │   │   ├── scope1/
    │   │   ├── scope2/
    │   │   └── scope3/
    │   ├── factors/
    │   ├── reports/
    │   ├── settings/
    │   │   ├── organization/
    │   │   └── users/
    │   └── audit/
    │
    ├── onboarding/
    │
    └── api/
        └── (route handlers per module)
```

---

## API Routes

### Auth Routes
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Organization Routes
- GET /api/organizations
- POST /api/organizations
- GET /api/organizations/[id]
- PUT /api/organizations/[id]
- GET /api/organizations/[id]/settings
- PUT /api/organizations/[id]/settings

### Activity Data Routes
- GET /api/activities?scope=scope1&year=2024
- POST /api/activities
- GET /api/activities/[id]
- PUT /api/activities/[id]
- DELETE /api/activities/[id]
- POST /api/activities/[id]/submit
- POST /api/activities/[id]/approve

### Scope1 Routes
- GET /api/scope1/vehicles
- POST /api/scope1/vehicles
- GET /api/scope1/stationary
- POST /api/scope1/stationary
- GET /api/scope1/refrigerants
- POST /api/scope1/refrigerants

### Scope2 Routes
- GET /api/scope2/electricity
- POST /api/scope2/electricity

### Scope3 Routes
- GET /api/scope3/purchased-goods (Cat 1)
- POST /api/scope3/purchased-goods
- GET /api/scope3/capital-goods (Cat 2)
- POST /api/scope3/capital-goods
- GET /api/scope3/fuel-energy (Cat 3)
- POST /api/scope3/fuel-energy
- GET /api/scope3/transportation
- POST /api/scope3/transportation
- GET /api/scope3/waste (Cat 5)
- POST /api/scope3/waste
- GET /api/scope3/business-travel (Cat 6)
- POST /api/scope3/business-travel
- GET /api/scope3/employee-commuting (Cat 7)
- POST /api/scope3/employee-commuting
- GET /api/scope3/upstream-leased (Cat 8)
- POST /api/scope3/upstream-leased
- GET /api/scope3/downstream-transportation (Cat 9)
- POST /api/scope3/downstream-transportation
- GET /api/scope3/product-processing (Cat 10)
- POST /api/scope3/product-processing
- GET /api/scope3/product-use (Cat 11)
- POST /api/scope3/product-use
- GET /api/scope3/end-of-life (Cat 12)
- POST /api/scope3/end-of-life
- GET /api/scope3/downstream-leased (Cat 13)
- POST /api/scope3/downstream-leased

### Emission Factor Routes
- GET /api/factors
- POST /api/factors
- GET /api/factors/[id]
- PUT /api/factors/[id]
- GET /api/factors/by-category?category=scope1

### Report Routes
- GET /api/reports
- POST /api/reports/generate
- GET /api/reports/[id]
- GET /api/reports/[id]/download
- POST /api/reports/[id]/export-excel

### Dashboard Routes
- GET /api/dashboard/summary?year=2024
- GET /api/dashboard/by-scope?year=2024
- GET /api/dashboard/by-category?year=2024
- GET /api/dashboard/trend?years=2022,2023,2024

### User Management Routes
- GET /api/users
- POST /api/users
- GET /api/users/[id]
- PUT /api/users/[id]
- DELETE /api/users/[id]

---

## Unit Conversion Rules

### Weight
| From | To | Factor |
|------|----|--------|
| lb | kg | 0.453592 |
| kg | kg | 1 |
| ton | kg | 1000 |

### Distance
| From | To | Factor |
|------|----|--------|
| mile | km | 1.60934 |
| km | km | 1 |
| m | km | 0.001 |

### Fuel
| From | To | Factor |
|------|----|--------|
| gallon | liter | 3.78541 |
| liter | liter | 1 |

### Energy
| From | To | Factor |
|------|----|--------|
| kWh | kWh | 1 |
| MWh | kWh | 1000 |
| MJ | kWh | 0.277778 |

---

## Calculation Engine

### Formula
```
emissions (kgCO2e) = activity_value × emission_factor
```

### Calculation Service
```typescript
interface CalculationInput {
  activityValue: number;
  activityUnit: string;
  factorId: string;
  country: 'US' | 'MY';
}

// Steps:
// 1. Convert input to standard unit
// 2. Apply emission factor
// 3. Return kgCO2e
```

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| super_admin | All operations, manage all organizations |
| org_admin | Manage org, users, all emissions data |
| sustainability_manager | View/edit emissions, generate reports |
| data_entry_staff | Enter activity data, submit for approval |
| viewer | View-only access to dashboard/reports |

---

## Workflow States

### Activity Data Status
- `draft` - Being edited
- `submitted` - Awaiting approval
- `approved` - Accepted
- `rejected` - Needs revision

### Reporting Year Status
- `draft` - Collecting data
- `submitted` - All data submitted
- `approved` - Data approved
- `verified` - External verification complete

---

## Dashboard Charts

1. **Pie Chart**: Emissions by Scope (Scope 1, 2, 3)
2. **Bar Chart**: Emissions by Category (for Scope 3)
3. **Line Chart**: Year-over-year trend
4. **Stacked Bar**: Scope breakdown by quarter

---

## Report Structure

### ESG Summary Report
1. Organization Information
2. Reporting Period
3. Methodology & Assumptions
4. Total GHG Emissions (tCO2e)
5. Scope Breakdown
   - Scope 1: Direct emissions
   - Scope 2: Indirect energy emissions
   - Scope 3: Value chain emissions
6. Category Breakdown (Scope 3)
7. Data Quality Notes
8. Verification Statement

---

## Implementation Roadmap

### Phase 1: Foundation
- [x] Next.js setup with TypeScript
- [ ] Prisma schema & migrations
- [ ] Authentication (NextAuth.js)
- [ ] Organization management
- [ ] User roles & permissions

### Phase 2: Core Features
- [ ] Emission factor database
- [ ] Scope 1 data entry
- [ ] Scope 2 data entry
- [ ] Scope 3 data entry
- [ ] Calculation engine

### Phase 3: Analytics & Reporting
- [ ] Dashboard with charts
- [ ] Report generation
- [ ] PDF export
- [ ] Excel export

### Phase 4: Workflow & Governance
- [ ] Approval workflow
- [ ] Audit trail
- [ ] Draft/submitted states
- [ ] Comments system

### Phase 5: Polish
- [ ] Onboarding flow
- [ ] Settings pages
- [ ] User management UI
- [ ] Performance optimization

---

## Recommended Packages

```json
{
  "dependencies": {
    "next": "^16.2.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@prisma/client": "^6.x",
    "next-auth": "^5.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "recharts": "^2.x",
    "@react-pdf/renderer": "^4.x",
    "xlsx": "^0.18.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-tabs": "^1.x",
    "@radix-ui/react-avatar": "^1.x",
    "date-fns": "^3.x",
    "bcryptjs": "^2.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "typescript": "^5.x",
    "tailwindcss": "^4.x",
    "eslint": "^9.x"
  }
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/esg_ghg"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# File Storage (for reports)
STORAGE_BUCKET="esg-reports"
STORAGE_ACCESS_KEY="xxx"
STORAGE_SECRET_KEY="xxx"
```

---

## Conventions

- File naming: kebab-case (e.g., `activity-form.tsx`)
- Component naming: PascalCase (e.g., `ActivityForm.tsx`)
- Type naming: PascalCase with suffix (e.g., `ActivityDataType`)
- Service naming: camelCase (e.g., `calculateEmissions.ts`)
- API route files: route.ts
- Database models: PascalCase singular (e.g., `Organization`)