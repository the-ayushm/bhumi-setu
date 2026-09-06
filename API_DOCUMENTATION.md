# REST API Specification
## Real-Time National Land Acquisition & Management System (SIH 26016)

Base URL: `http://localhost:5000/api/v1`

---

## 1. Authentication & Session Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate with email & password, returns JWT token + user profile | Public |
| `GET` | `/auth/me` | Fetch authenticated user session and role capabilities | Authenticated |
| `POST` | `/auth/logout` | Invalidate active session token | Authenticated |

---

## 2. Project Portfolio & Statutory Lifecycle

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/projects` | List land acquisition projects with state, sector, stage filters & risk indicators | Public/All |
| `GET` | `/projects/:id` | Detailed project dossier with statutory timeline, milestones, budget & risk | Public/All |
| `POST` | `/projects` | Submit new Land Acquisition Requisition Proposal | Requisitioning / Admin |
| `PATCH` | `/projects/:id/stage` | Transition project to next RFCTLARR statutory stage (with statutory validation) | Collector / Admin |
| `GET` | `/projects/:id/statutory-summary` | Summary of Section 4, 11, 19 milestones, lapse clock & compliance | Public/All |

---

## 3. Cadastral Land Parcels & GIS

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/parcels` | List cadastral parcels by project, village, khasra, status | All |
| `GET` | `/parcels/geojson` | Fetch GeoJSON feature collection for GIS alignment map rendering | All |
| `GET` | `/parcels/:id` | Detailed parcel record (valuation, tree counts, ownership, DBT status) | All |
| `POST` | `/parcels` | Register cadastral parcel with khasra number & geometry | CALA / Surveyor |
| `PATCH` | `/parcels/:id/field-survey` | Field surveyor mobile update (tree counts, structure count, geo-tag) | Surveyor / CALA |

---

## 4. Statutory Notifications (RFCTLARR Sec 4, 11, 19)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/notifications` | List gazette notifications (Sec 4, 11, 19) across projects | All |
| `POST` | `/notifications` | Issue official notification with gazette registration number & newspaper records | Collector / State Nodal |
| `POST` | `/notifications/:id/objections` | Record Section 15 landowner objection details & hearing status | CALA / Collector |

---

## 5. Valuation, Solatium & Award Calculation

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/awards/calculate` | Statutory calculation engine: market value x multiplier + assets + 100% solatium + 12% interest | CALA / Collector |
| `GET` | `/awards/project/:projectId` | List all awards generated for a project | All |
| `POST` | `/awards` | Formalize and issue award for a parcel | CALA / Collector |
| `PATCH` | `/awards/:id/approve` | District Collector signs and approves statutory award under Sec 23/30 | District Collector |

---

## 6. Compensation Disbursement (PFMS Integration)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/disbursements` | List PFMS DBT transaction records with UTR status | All |
| `POST` | `/disbursements/trigger` | Trigger Direct Benefit Transfer (PFMS adapter mock) for approved award | CALA / Collector |
| `GET` | `/disbursements/stats` | National/Project disbursement progress vs allocated budget | All |

---

## 7. Rehabilitation & Resettlement (R&R - Sec 16 & 31)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/rr/families` | Census of affected and displaced families by project | All |
| `POST` | `/rr/families` | Register affected family census record | CALA / Admin |
| `PATCH` | `/rr/families/:id/entitlement` | Update housing allotment, subsistence grant, or resettlement allowance | Collector / CALA |
| `GET` | `/rr/summary/:projectId` | R&R compliance index and entitlement fulfillment stats | All |

---

## 8. Analytics, Decision Support & Predictive Risk

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/analytics/national-summary` | High-level metrics: total hectares, funds disbursed, active projects, risk count | All |
| `GET` | `/analytics/state-rankings` | State-wise land acquisition velocity & statutory compliance scores | All |
| `GET` | `/analytics/risk-indicators` | Projects flagged with Section 11 lapse danger, high objections, or disbursement lag | All |

---

## 9. MIS Reports & Audit Trail

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/reports/mis/project-status` | Generate MIS tabular report (JSON / CSV export) | All |
| `GET` | `/reports/mis/statutory-compliance`| Form-wise statutory compliance report | Admin / Nodal |
| `GET` | `/audit-logs` | Query tamper-evident event log with user, role, IP, and state diff | Admin / Nodal |
