# Real-Time National Land Acquisition & Management System (MoRD / DoLR)
### Smart India Hackathon — Problem Statement 26016
**Organization**: Ministry of Rural Development, Government of India  
**Statutory Framework**: Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013)

---

## 🇮🇳 Project Overview
This enterprise platform digitizes and monitors the entire lifecycle of land acquisition across India in real-time. It equips the Ministry of Rural Development, State Revenue Departments, District Collectors, Competent Authorities for Land Acquisition (CALA), and Requisitioning Agencies (NHAI, Railways, Port Authorities) with a single unified digital operating system.

### Key Capabilities
- **Role-Based Access Control (RBAC)**: National MoRD Administrator, State Nodal Officer, District Collector, CALA, Requisitioning Agency, Field Surveyor, Citizen Viewer.
- **RFCTLARR Statutory Gate Enforcement**: Proposal Requisition -> SIA (Sec 4) -> Sec 7 Expert Appraisal -> Sec 11 Gazette -> Sec 15 Objections -> Sec 16 R&R Scheme -> Sec 19 Declaration -> Sec 21 Claims -> Sec 26-30 Award -> PFMS DBT Disbursement -> Sec 38 Possession & Mutation.
- **Predictive Risk & Early Warning Indicators**: Automatic detection of 12-month statutory lapse clock (Section 11 to 19), compensation disbursement lag, and objection clustering.
- **Interactive Cadastral GIS**: Khasra/survey polygon visualization, alignment corridor overlay, status color-coding, and mobile field-survey inspections.
- **Direct Benefit Transfer (PFMS)**: Automated simulation of bank validation, PFMS batch generation, and UTR reconciliation.
- **Rehabilitation & Resettlement (R&R)**: Family-level census, housing allotment tracking, subsistence allowances, and resettlement grants under the Second Schedule of the Act.
- **National / State / District Dashboards & MIS**: Instant MIS reports, executive scorecards, and tamper-evident audit trails.

---

## 🛠️ Tech Stack
- **Monorepo**: npm workspaces (`apps/web`, `apps/api`, `packages/shared`)
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, TanStack Query, Recharts, Leaflet GIS.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, JWT, Bcrypt, Helmet.
- **Database**: PostgreSQL (Prisma ORM with SQLite auto-fallback for local evaluation).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or v20+ recommended)
- npm (v9+)

### Installation
```bash
# 1. Install all dependencies across monorepo
npm install

# 2. Setup Database & Seed Initial Flagship Indian Projects
cd apps/api
npx prisma generate
npx prisma db push
npm run seed
cd ../..

# 3. Start Development Servers
# Runs both Backend (port 5000) and Frontend (port 3000)
npm run dev
```

### Accessing the Applications
- **Web Application Portal**: [http://localhost:3000](http://localhost:3000)
- **REST API Service**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **API Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

### Default Demonstration Accounts
| Role | Email | Password |
|---|---|---|
| National MoRD Admin | `admin.mord@nic.in` | `Admin@123` |
| District Collector | `collector.pune@nic.in` | `Collector@123` |
| Land Acquisition Officer (CALA) | `cala.nh66@nic.in` | `Cala@123` |
| Requisitioning Agency (NHAI) | `nhai.projects@nic.in` | `Nhai@123` |
| Field Revenue Surveyor | `surveyor.amin@nic.in` | `Survey@123` |
