# Enterprise Architecture Document
## Real-Time National Land Acquisition & Management System (SIH 26016)
**Client Entity**: Ministry of Rural Development, Government of India  
**Legal Framework**: RFCTLARR Act, 2013

---

## 1. High-Level System Architecture

```
                                  [CITIZEN / PORTAL USERS]
                                             |
                  +--------------------------+--------------------------+
                  |                                                     |
         [Mobile Field Surveyor]                               [Enterprise Web User]
          (Field Inspection UI)                               (MoRD / Collector / CALA)
                  \                                                     /
                   \                                                   /
                    v                                                 v
         +--------------------------------------------------------------------+
         |                 Next.js 14+ Frontend (apps/web)                    |
         |  - App Router & Server/Client Components                          |
         |  - Tailwind CSS + shadcn/ui Design Tokens                         |
         |  - Leaflet GIS Cadastral Engine & GeoJSON Projection Layers       |
         |  - TanStack Query (Server State Cache & Invalidation)             |
         |  - Recharts (Predictive Risk & Statutory Burndown)                 |
         |  - Role-based Route Protection & Session Guards                   |
         +--------------------------------------------------------------------+
                                             |
                                      REST API (JSON)
                                             |
                                             v
         +--------------------------------------------------------------------+
         |                 Express.js Backend (apps/api)                      |
         |  - TypeScript REST Controllers                                     |
         |  - JWT Authentication & Role-Based Access Control (RBAC)           |
         |  - RFCTLARR 2013 Statutory State Machine                           |
         |  - Predictive Risk & Delay Indicators Computation Engine          |
         |  - Solatium & Market Value Valuation Engine (Sec 26-30)           |
         |  - Immutable Audit Logger Middleware                              |
         |  - Government Integration Adapters (PFMS, Bhulekh, e-Gazette)      |
         +--------------------------------------------------------------------+
                                             |
                                        Prisma ORM
                                             |
                                             v
         +--------------------------------------------------------------------+
         |                 Relational Database (PostgreSQL)                   |
         |  - Projects, Notifications, Parcels, GeoJSON geometries            |
         |  - Displaced Families, R&R Entitlements, PFMS Payments            |
         |  - Tamper-Evident Audit Trail & System Events                      |
         +--------------------------------------------------------------------+
```

---

## 2. RFCTLARR 2013 Statutory Workflow Model

The system enforces the strict statutory gates dictated by Indian Land Acquisition Law:

```
[Proposal Submission] (Requisitioning Agency submits project scope, DPR, alignment)
       |
       v
[Section 4: SIA Notification] (Social Impact Assessment study instituted)
       |
       v
[Section 7: Expert Group Appraisal] (Independent appraisal of SIA report & SIMP)
       |
       v
[Section 8: Govt Examination] (Appropriate Govt approves recommendation)
       |
       v
[Section 11: Preliminary Notification] (Published in Official Gazette + 2 local newspapers)
       |
       v
[Section 15: Objections Hearing] (60-day window for landowner hearing before Collector)
       |
       v
[Section 16-18: R&R Scheme Formulation] (Administrator prepares scheme; public hearing)
       |
       v
[Section 19: Declaration of Acquisition] (MUST be published within 12 MONTHS of Sec 11)
  * Statutory Lapse Trigger: If >12 months, acquisition proceedings LAPSE automatically!
       |
       v
[Section 21: Claims & Enquiry] (Public notice for landowners to submit claims)
       |
       v
[Section 26-30: Award Formulation]
  - Market Value determination (Sec 26) x Rural Multiplier (1.0 - 2.0)
  - Assets / Trees / Structures valuation (Sec 29)
  - 100% Solatium Addition (Sec 30(1))
  - 12% per annum Additional Compensation from Sec 11 to Award date (Sec 30(3))
       |
       v
[Section 31: R&R Award] (House allotment, one-time resettlement grant, annuity)
       |
       v
[Direct Benefit Transfer] (PFMS Mock Integration: Payment directly to verified bank accounts)
       |
       v
[Section 38: Possession & Mutation] (Collector takes possession ONLY after 100% payment)
```

---

## 3. Security & Governance Architecture

1. **Authentication & Session Management**:
   - Secure stateless JSON Web Tokens with expiry and cryptographic signatures.
   - Password hashing via `bcrypt` (salt rounds = 10).
2. **Role-Based Access Control (RBAC)**:
   - Server-side role validation middleware checking permissions on every protected endpoint.
   - Pre-configured roles:
     - `NATIONAL_ADMIN`: Full system view, policy oversight, MIS exports, inter-state monitoring.
     - `STATE_NODAL_OFFICER`: State-level approvals, gazette notifications, district supervision.
     - `DISTRICT_COLLECTOR`: Approves awards, oversees Section 15 objections, signs Section 38 possession.
     - `LAND_ACQUISITION_OFFICER (CALA)`: Computes valuations, issues notices, coordinates surveys.
     - `REQUISITIONING_AGENCY`: Submits proposals, deposits compensation funds into escrow.
     - `FIELD_SURVEYOR`: Conducts geo-tagged field surveys, records tree/structure counts.
     - `CITIZEN_VIEWER`: Transparent read-only portal for public notices, awards, and tracking.
3. **Audit Trails & Non-Repudiation**:
   - Every mutation (status advancement, award approval, payment disbursement) creates an immutable record in the `AuditLog` table containing user ID, IP address, action code, timestamp, and previous vs new state diff.
4. **Data Validation & Integrity**:
   - Shared Zod validation schemas ensure type safety across frontend and backend.
