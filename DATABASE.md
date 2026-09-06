# Database Schema & Data Dictionary
## Real-Time National Land Acquisition & Management System (RFCTLARR 2013)

---

## 1. Entity-Relationship Overview

```
+------------------+         1:N         +-------------------+
|      User        |-------------------->|    AuditLog       |
+------------------+                     +-------------------+
        |
        | 1:N
        v
+------------------+         1:N         +-------------------+
|     Project      |-------------------->|   Notification    | (Sec 4, 11, 19)
+------------------+                     +-------------------+
        |                                          |
        | 1:N                                      | 1:N
        v                                          v
+------------------+         1:N         +-------------------+
|     Village      |-------------------->|   LandParcel      | (Khasra No, Cadastral GeoJSON)
+------------------+                     +-------------------+
                                                   |
                             +---------------------+---------------------+
                             | 1:1                                       | 1:N
                             v                                           v
                     +-------------------+                       +-------------------+
                     |  ValuationAward   |                       | DisplacedFamily   |
                     | (Sec 26-30 Math)  |                       | (R&R Entitlement) |
                     +-------------------+                       +-------------------+
                             |                                           |
                             | 1:N                                       | 1:N
                             v                                           v
                     +-------------------+                       +-------------------+
                     |  Disbursement     |                       |  RRDisbursement   |
                     | (PFMS DBT Record) |                       | (Annuity/Housing) |
                     +-------------------+                       +-------------------+
```

---

## 2. Core Tables & Schemas

### `User`
- `id` (UUID): Primary key
- `email` (String): Unique username
- `passwordHash` (String): bcrypt hashed credential
- `name` (String): Full name of official
- `designation` (String): Official govt designation
- `role` (Enum): `NATIONAL_ADMIN`, `STATE_NODAL_OFFICER`, `DISTRICT_COLLECTOR`, `LAND_ACQUISITION_OFFICER`, `REQUISITIONING_AGENCY`, `FIELD_SURVEYOR`, `CITIZEN_VIEWER`
- `state` (String?): Jurisdiction State code/name
- `district` (String?): Jurisdiction District name
- `department` (String?): MoRD, NHAI, Revenue Department, etc.
- `phone` (String?): Official contact number
- `isActive` (Boolean): Access status flag
- `createdAt` / `updatedAt`

### `Project`
- `id` (UUID): Primary key
- `code` (String): Unique Project Reference (e.g., `NHAI-DEL-MUM-SEC4B-2024`)
- `name` (String): Full project title
- `description` (Text): Scope, DPR details, purpose
- `sector` (Enum): `HIGHWAYS`, `RAILWAYS`, `IRRIGATION`, `RENEWABLE_ENERGY`, `INDUSTRIAL_CORRIDOR`, `DEFENCE`, `URBAN_INFRA`
- `requisitioningAgency` (String): Name of acquiring agency
- `state` (String): Target State
- `district` (String): Primary District
- `totalAreaHectares` (Float): Total land requisitioned
- `estimatedBudgetCr` (Float): Total project budget in Crores INR
- `compensationBudgetCr` (Float): Allocated compensation budget
- `currentStage` (Enum): `STAGE_1_REQUISITION`, `STAGE_2_SIA`, `STAGE_3_PRELIMINARY_NOTIFICATION`, `STAGE_4_RR_SCHEME`, `STAGE_5_DECLARATION`, `STAGE_6_CLAIMS_AWARD`, `STAGE_7_DISBURSEMENT`, `STAGE_8_POSSESSION`, `COMPLETED`
- `status` (Enum): `DRAFT`, `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `STAYED`, `COMPLETED`
- `riskScore` (Float): Calculated predictive delay risk index (0 - 100)
- `riskLevel` (Enum): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `statutoryLapseDeadline` (DateTime?): Section 19 12-month drop-dead date from Section 11

### `Notification` (RFCTLARR Statutory Gazettes)
- `id` (UUID): Primary key
- `projectId` (UUID): Foreign key to Project
- `section` (Enum): `SECTION_4_SIA`, `SECTION_11_PRELIMINARY`, `SECTION_19_DECLARATION`
- `gazetteNumber` (String): Official e-Gazette registration number
- `issueDate` (DateTime): Official date of gazette publication
- `expiryDate` (DateTime?): Statutory expiry / objection deadline (60 days for Sec 11)
- `newspaperLocal1` (String?): Name of regional language newspaper
- `newspaperLocal2` (String?): Name of second vernacular newspaper
- `documentUrl` (String): PDF link / scan of gazette order
- `status` (Enum): `DRAFT`, `PUBLISHED`, `EXPIRED`, `SUPERSEDED`
- `objectionsCount` (Int): Total Section 15 objections received
- `objectionsResolved` (Int): Total objections disposed by Collector

### `LandParcel` (Cadastral Khasra Geometry)
- `id` (UUID): Primary key
- `projectId` (UUID): Foreign key to Project
- `village` (String): Revenue Village name
- `tehsil` (String): Tehsil / Taluka
- `khasraNumber` (String): Survey / Khasra / Gat number (e.g. `245/1A`)
- `areaAcres` (Float): Parcel extent in acres
- `landType` (Enum): `RURAL_AGRICULTURAL`, `RURAL_HOMESTEAD`, `SEMI_URBAN`, `URBAN_COMMERCIAL`, `FOREST_GOVERNMENT`
- `ownerName` (String): Primary title holder as per RoR
- `ownerAadhaarMasked` (String?): Masked Aadhaar (e.g. `XXXX-XXXX-4821`)
- `ownerBankAccMasked` (String?): Bank account number for DBT
- `ownerIfsc` (String?): IFSC code for PFMS
- `status` (Enum): `NOTIFIED`, `SURVEYED`, `VALUATION_DONE`, `AWARD_APPROVED`, `DISBURSED`, `POSSESSION_TAKEN`, `LITIGATION_STAY`
- `latitude` (Float): GIS Center Latitude
- `longitude` (Float): GIS Center Longitude
- `geometryGeoJSON` (Json?): Polygon boundary GeoJSON for cadastral map layer
- `treesCount` (Int): Number of commercial/fruit trees surveyed
- `structuresCount` (Int): Number of built structures surveyed

### `ValuationAward` (Section 26 - 30 Solatium Math)
- `id` (UUID): Primary key
- `parcelId` (UUID): Foreign key to LandParcel
- `baseRatePerAcre` (Float): Determined Circle rate / registration average (INR)
- `marketValueLand` (Float): Computed base market value (INR)
- `ruralMultiplier` (Float): Multiplier factor (1.0 to 2.0 based on distance from urban area)
- `multipliedMarketValue` (Float): Market value * ruralMultiplier (INR)
- `assetsValue` (Float): Value of trees + structures + wells assessed by PWD/Forest Dept (INR)
- `solatiumAmount` (Float): 100% of (multipliedMarketValue + assetsValue) under Section 30(1)
- `additionalInterestAmount` (Float): 12% per annum from Sec 11 date to Award date under Section 30(3)
- `totalAwardAmount` (Float): Total statutory award payable (INR)
- `awardDate` (DateTime): Date signed by Land Acquisition Officer / Collector
- `status` (Enum): `DRAFT`, `SUBMITTED`, `APPROVED_COLLECTOR`, `CHALLENGED`

### `Disbursement` (PFMS DBT Payments)
- `id` (UUID): Primary key
- `awardId` (UUID): Foreign key to ValuationAward
- `beneficiaryName` (String): Name on verified bank record
- `amountPaid` (Float): Amount credited in INR
- `paymentMode` (Enum): `PFMS_DBT`, `NEFT`, `RTGS`, `ESCROW_DEPOSIT`
- `utrReference` (String): Bank transaction UTR number
- `paymentDate` (DateTime): Timestamp of transaction
- `status` (Enum): `PENDING_AUTHORIZATION`, `PROCESSING`, `SUCCESS`, `FAILED`, `RETURNED`
- `remarks` (String?)

### `DisplacedFamily` (Rehabilitation & Resettlement - Section 16 & 31)
- `id` (UUID): Primary key
- `projectId` (UUID): Foreign key to Project
- `familyHeadName` (String): Name of family head
- `category` (Enum): `SC`, `ST`, `OBC`, `GENERAL`, `BPL`
- `membersCount` (Int): Number of family members
- `isLosingHomestead` (Boolean): Whether house is acquired
- `isLosingLivelihood` (Boolean): Whether primary livelihood is lost
- `housingEntitlementStatus` (Enum): `NOT_APPLICABLE`, `ALLOTTED_PUCCA_HOUSE`, `GRANT_IN_LIEU_INR_150000`, `PENDING`
- `subsistenceGrantPaid` (Boolean): Monthly subsistence grant (INR 3,000/mo for 12 mos)
- `resettlementAllowancePaid` (Boolean): One-time INR 50,000 allowance paid
- `overallRRStatus` (Enum): `SURVEYED`, `SCHEME_APPROVED`, `PACKAGE_DISBURSED`, `RELOCATED`

### `AuditLog`
- `id` (UUID): Primary key
- `userId` (UUID?): Performed by user
- `userRole` (String): Role of user
- `action` (String): e.g. `PROJECT_STAGE_ADVANCE`, `AWARD_APPROVED`, `PFMS_PAYMENT_TRIGGER`
- `entityType` (String): `PROJECT`, `NOTIFICATION`, `PARCEL`, `AWARD`, `DISBURSEMENT`
- `entityId` (String): Identifier of target entity
- `ipAddress` (String): Request IP address
- `previousState` (Json?): Previous state JSON diff
- `newState` (Json?): New state JSON diff
- `createdAt` (DateTime): Immutable timestamp
