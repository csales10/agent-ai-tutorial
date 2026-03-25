# Patient Room & Baby Cot Management System — Feature Modules

> Based on [PROBLEM.md](./PROBLEM.md) and [RESEARCH.md](./RESEARCH.md)

---

## Module Overview

| # | Module | Priority | Description |
|---|--------|----------|-------------|
| 1 | Authentication & Authorization | Critical | Login, session management, role-based access |
| 2 | Occupancy Dashboard | Critical | Real-time overview of all rooms and cots |
| 3 | Room Management | Critical | CRUD for hospital rooms and beds |
| 4 | Baby Cot Management | Critical | CRUD for nursery cots |
| 5 | Patient Admission | Critical | Admit patients and assign rooms/beds |
| 6 | Baby Cot Assignment | Critical | Assign newborns to cots, link to mother |
| 7 | Transfer | High | Move patients or babies between rooms/cots |
| 8 | Discharge | High | Discharge patients and babies, free up rooms/cots |
| 9 | Confinement History | High | Full history per patient, room, and cot |
| 10 | Notifications & Alerts | High | In-app alerts for overstays, maintenance, and events |
| 11 | Audit Log | Medium | Track all actions with actor and timestamp |
| 12 | Reports & Export | Medium | CSV/PDF export of confinement records |

---

## Module 1 — Authentication & Authorization

**Purpose**: Secure the system and control what each role can see and do.

### Features
- [ ] Login page with username and password
- [ ] Session token management (stored in HttpOnly cookie)
- [ ] Auto-logout on inactivity timeout
- [ ] Role-based route guards (`<ProtectedRoute>`)
- [ ] Feature-level permission gates (`<PermissionGate>`)
- [ ] Unauthorized (403) and Not Found (404) error pages

### Roles & Permissions

| Role | Access Level |
|------|-------------|
| Admin | Full CRUD on rooms and cots, all records, audit log, override status |
| Head Nurse | Admit, transfer, discharge patients and babies; view all assignments |
| Nurse / Staff | Admit patients, assign cots, initiate transfer/discharge |
| Billing | View confinement records and charges only (read-only) |
| Viewer | View room and cot availability only (read-only) |

### Components to Build
- `LoginPage`
- `ProtectedRoute` — route-level guard
- `PermissionGate` — feature-level access wrapper
- `useAuthStore` — Zustand store for user session and role
- `UnauthorizedPage` (403)

---

## Module 2 — Occupancy Dashboard

**Purpose**: Give staff a real-time, at-a-glance view of all rooms and cots across the facility.

### Features
- [ ] Summary cards: Total Rooms | Occupied | Available | Reserved | Maintenance
- [ ] Summary cards: Total Cots | Occupied | Available | Reserved | Maintenance
- [ ] Visual room grid — each room as a color-coded card (status + patient name)
- [ ] Visual cot grid — each cot as a color-coded card (status + baby/mother name)
- [ ] Filter grid by ward, floor, and status
- [ ] Ward/floor breakdown showing occupancy rate per unit
- [ ] Overstay alert list — patients past their expected discharge date
- [ ] Real-time status updates via polling or SSE
- [ ] Last-updated timestamp indicator
- [ ] Offline/reconnect banner when connection drops

### Color-Coding Standard

| Status | Color |
|--------|-------|
| Available | Green |
| Occupied | Blue |
| Pending Discharge | Amber / Yellow |
| Reserved / On Hold | Purple |
| Under Maintenance | Gray |
| Isolation Required | Red border |
| NICU / Special Care | Teal accent |

### Components to Build
- `DashboardPage`
- `OccupancySummaryCards`
- `RoomGrid` — room status cards grid
- `CotGrid` — cot status cards grid
- `RoomCard` — individual room card with status badge
- `CotCard` — individual cot card with status badge
- `WardBreakdownChart` — occupancy rate per ward
- `OverstayAlerts` — list of overdue patients
- `ConnectionStatusBanner` — offline/reconnect indicator
- `useOccupancyDashboard` — data hook with polling/SSE

---

## Module 3 — Room Management

**Purpose**: Manage the physical inventory of hospital rooms and beds.

### Features
- [ ] Paginated, searchable, and filterable room list table
- [ ] Filter by ward, floor, room type, and status
- [ ] Create new room (admin only)
- [ ] Edit existing room details (admin only)
- [ ] Deactivate / reactivate room (admin only)
- [ ] Room detail view: info panel + current occupant + confinement history timeline
- [ ] Real-time status badge on each room row
- [ ] Toggle between table view and visual grid view

### Room Fields
- Room number, ward, floor, room type (Private / Semi-Private / Ward / ICU / Isolation)
- Bed count, rate per day, amenities (AC, TV, Private Bathroom, etc.)
- Status (Available / Occupied / Reserved / Maintenance)

### Components to Build
- `RoomListPage` — table + filters
- `RoomFormPage` — create/edit form
- `RoomDetailPage` — info + occupant + history
- `RoomTable` — TanStack Table with sorting, pagination
- `RoomFilters` — ward, floor, type, status filters
- `RoomStatusBadge` — color-coded status pill
- `RoomForm` — React Hook Form + Zod validated form
- `useRooms` — TanStack Query hook for room list
- `useRoom(id)` — single room detail hook
- `roomService` — Axios API service

---

## Module 4 — Baby Cot Management

**Purpose**: Manage the inventory of baby cots in the nursery ward.

### Features
- [ ] Paginated, searchable, and filterable cot list table
- [ ] Filter by nursery section and cot type
- [ ] Create new cot (admin only)
- [ ] Edit existing cot details (admin only)
- [ ] Deactivate / reactivate cot (admin only)
- [ ] Cot detail view: info panel + current baby assignment + assignment history
- [ ] Real-time status badge on each cot row
- [ ] Toggle between table view and nursery grid view

### Cot Fields
- Cot number, nursery section (Regular / NICU / Isolation)
- Cot type (Regular / Incubator / Warmer / NICU)
- Status (Available / Occupied / Reserved / Maintenance)

### Components to Build
- `CotListPage` — table + filters
- `CotFormPage` — create/edit form
- `CotDetailPage` — info + current baby + history
- `CotTable` — TanStack Table with sorting, pagination
- `CotFilters` — section, type, status filters
- `CotStatusBadge` — color-coded status pill
- `CotForm` — React Hook Form + Zod validated form
- `useCots` — TanStack Query hook for cot list
- `useCot(id)` — single cot detail hook
- `cotService` — Axios API service

---

## Module 5 — Patient Admission

**Purpose**: Admit a patient to the hospital and assign them to a room and bed.

### Features
- [ ] Multi-step admission form:
  - **Step 1** — Search and select patient from existing records
  - **Step 2** — Select available room (filtered by ward, type, capacity)
  - **Step 3** — Assign specific bed number (for multi-bed rooms)
  - **Step 4** — Enter admission date, expected discharge, diagnosis, attending doctor, notes
  - **Step 5** — Review and confirm; estimated room cost displayed
- [ ] Prevent assigning a patient to an already-occupied bed (conflict check)
- [ ] Show estimated confinement cost (rate/day × expected stay days)
- [ ] Auto-update room status to Occupied on successful admission
- [ ] Admission list: view all active confinements with filter and search
- [ ] Admission detail: full confinement record with patient info, room info, and timeline

### Validation Rules
- Patient must be selected before proceeding
- Expected discharge date must be after admission date
- Bed number required for multi-bed rooms
- Diagnosis minimum 3 characters
- Attending doctor required

### Components to Build
- `AdmissionListPage` — active confinements table
- `AdmissionFormPage` — multi-step wizard
  - `StepSelectPatient` — patient search input + selection
  - `StepSelectRoom` — available room picker with filters
  - `StepSelectBed` — bed number selector
  - `StepAdmissionDetails` — dates, diagnosis, doctor, notes
  - `StepConfirmAdmission` — summary + estimated cost
- `AdmissionDetailPage` — full record view
- `PatientSearchInput` — debounced patient search
- `RoomAvailabilityPicker` — filtered available rooms
- `EstimatedCostDisplay` — computed charge preview
- `useAdmissions` — TanStack Query hook
- `useAvailableRooms` — filtered available room hook
- `admissionService` — Axios API service

---

## Module 6 — Baby Cot Assignment

**Purpose**: Assign a newborn to a cot in the nursery and link to the mother's record.

### Features
- [ ] Multi-step cot assignment form:
  - **Step 1** — Search and link to mother's patient record
  - **Step 2** — Enter baby details: birth datetime, birth weight, sex, gestational age, APGAR score, notes
  - **Step 3** — Select available cot (auto-filter to incubator/NICU if baby requires special care)
  - **Step 4** — Review and confirm
- [ ] Mother-baby linkage: both the room card and cot card show the linked pair
- [ ] Auto-update cot status to Occupied on successful assignment
- [ ] Cot assignment list: all active assignments with filter and search
- [ ] Cot assignment detail: baby info, mother info, cot info, and assignment timeline

### Validation Rules
- Mother's patient record must be linked before proceeding
- Birth datetime is required and cannot be in the future
- Birth weight between 100g and 10,000g
- Sex (Male / Female) required
- Cot type must match baby's medical need (e.g., incubator if required)

### Components to Build
- `CotAssignmentListPage` — active assignments table
- `CotAssignmentFormPage` — multi-step wizard
  - `StepSelectMother` — mother patient search
  - `StepBabyDetails` — birth info form
  - `StepSelectCot` — available cot picker with type filter
  - `StepConfirmAssignment` — summary review
- `CotAssignmentDetailPage` — full assignment record
- `MotherBabyLinkBadge` — displays linked mother-baby pair
- `useCotAssignments` — TanStack Query hook
- `useAvailableCots` — filtered available cot hook
- `cotAssignmentService` — Axios API service

---

## Module 7 — Transfer

**Purpose**: Move a confined patient to a different room, or a baby to a different cot.

### Features

#### Patient Room Transfer
- [ ] Select destination room and bed (filtered to available only)
- [ ] Enter transfer reason (required)
- [ ] Enter transfer datetime
- [ ] Auto-update source room/bed to Available
- [ ] Auto-update destination room/bed to Occupied
- [ ] Log transfer in confinement history

#### Baby Cot Transfer
- [ ] Select destination cot (filtered to available; type-filtered based on baby's needs)
- [ ] Enter transfer reason (required)
- [ ] Require attending doctor note for NICU-level transfers
- [ ] Auto-update source cot to Available
- [ ] Auto-update destination cot to Occupied
- [ ] Log transfer in cot assignment history

### Validation Rules
- Destination room/cot must be available at time of transfer
- Transfer reason is mandatory
- Destination cannot be same as current room/cot

### Components to Build
- `TransferRoomPage` — room transfer form
- `TransferCotPage` — cot transfer form
- `TransferModal` — inline modal variant for quick transfers
- `CotTransferModal` — inline modal variant for cot transfers
- `DestinationRoomPicker` — available room selector
- `DestinationCotPicker` — available cot selector

---

## Module 8 — Discharge

**Purpose**: Discharge a patient or baby, freeing up the room/cot for the next assignment.

### Features

#### Patient Discharge
- [ ] Set actual discharge datetime
- [ ] Show total confinement days and computed total room charges
- [ ] Option to set room status to Available or Maintenance (needs cleaning)
- [ ] Print-ready discharge summary (patient name, room, dates, duration, charges)
- [ ] Confirmation dialog required before submitting

#### Baby Discharge
- [ ] Set baby discharge datetime
- [ ] Auto-update cot status to Available
- [ ] Option to link baby discharge to mother's discharge record
- [ ] Confirmation dialog required before submitting

### Validation Rules
- Actual discharge datetime must be after admission/assignment date
- Confirmation dialog must be explicitly accepted
- Discharge is irreversible — show clear warning

### Components to Build
- `DischargePage` — patient discharge form
- `CotDischargePage` — baby discharge form
- `DischargeModal` — confirmation + summary modal
- `CotDischargeModal` — cot discharge confirmation modal
- `DischargeSummary` — printable discharge summary card
- `ConfinementCostSummary` — total days + computed charges

---

## Module 9 — Confinement History

**Purpose**: View complete historical records of room and cot usage per patient, room, and cot.

### Features
- [ ] Patient confinement history: all past and active admissions for a patient
- [ ] Room occupancy history: timeline of all past occupants per room
- [ ] Cot assignment history: timeline of all past assignments per cot
- [ ] Filter by date range and status
- [ ] Export history to CSV
- [ ] Export history to PDF (printable format)

### Components to Build
- `PatientHistoryPage` — confinement list per patient
- `RoomHistoryPage` — occupancy timeline per room
- `CotHistoryPage` — assignment timeline per cot
- `ConfinementHistoryTable` — shared reusable history table
- `HistoryTimeline` — visual timeline of past occupants
- `ExportButton` — CSV / PDF export action
- `usePatientHistory(patientId)` — history data hook
- `useRoomHistory(roomId)` — room history data hook
- `useCotHistory(cotId)` — cot history data hook

---

## Module 10 — Notifications & Alerts

**Purpose**: Proactively inform staff of events requiring attention without them needing to check manually.

### Features

#### Toast Notifications (action-triggered)
- [ ] Admission created successfully
- [ ] Cot assignment created successfully
- [ ] Transfer completed
- [ ] Discharge completed
- [ ] API error (user-friendly message)
- [ ] Double-assignment conflict (409 response)

#### In-App Alert Center
- [ ] Overstay alerts — patients past their expected discharge date (badge count)
- [ ] Maintenance alerts — rooms or cots scheduled for or overdue for maintenance
- [ ] Conflict warning — room/cot set to Maintenance while still occupied
- [ ] Alert bell icon in navbar with unread count badge
- [ ] Alert list drawer/panel with dismiss and mark-all-read actions

### Components to Build
- `NotificationBell` — navbar icon with unread badge
- `AlertDrawer` — slide-out panel listing all alerts
- `AlertItem` — individual alert row with type icon, message, timestamp, dismiss
- `OverstayBadge` — inline badge on room/cot cards for overdue patients
- `useAlerts` — hook for in-app alert data
- `useToast` — hook wrapping toast library (e.g., sonner or react-hot-toast)

---

## Module 11 — Audit Log

**Purpose**: Maintain a tamper-evident trail of all actions for compliance and accountability.

### Features
- [ ] Log every create, update, admission, transfer, discharge, and status override
- [ ] Each log entry captures: actor (user), action type, entity type, entity ID, before/after values, timestamp
- [ ] Searchable and filterable audit log table (admin only)
- [ ] Filter by date range, actor, action type, and entity type
- [ ] View full detail of any log entry
- [ ] Export audit log to CSV (admin only)

### Log Entry Structure

| Field | Description |
|-------|-------------|
| `id` | Unique log entry ID |
| `actor` | User who performed the action |
| `action` | CREATE / UPDATE / ADMIT / TRANSFER / DISCHARGE / OVERRIDE |
| `entity_type` | Room / Cot / Admission / CotAssignment |
| `entity_id` | ID of the affected record |
| `changes` | JSON snapshot of before/after values |
| `timestamp` | Exact datetime of the action |

### Components to Build
- `AuditLogPage` — filterable audit log table (admin only)
- `AuditLogTable` — TanStack Table with all log entries
- `AuditLogFilters` — date range, actor, action, entity filters
- `AuditLogDetailModal` — full detail view of a single log entry
- `useAuditLog` — TanStack Query hook for log data
- `auditLogService` — Axios API service

---

## Module 12 — Reports & Export

**Purpose**: Allow staff and admins to generate summaries and export data for records and billing.

### Features
- [ ] Occupancy rate report — by ward, floor, date range
- [ ] Average length of stay report — by room type and ward
- [ ] Confinement charges summary — per patient, per period
- [ ] Cot utilization report — by section and cot type
- [ ] Export any report to CSV
- [ ] Export any report to PDF (print-ready)
- [ ] Date range picker for all reports

### Components to Build
- `ReportsPage` — report selector and output area
- `OccupancyRateReport`
- `AvgLengthOfStayReport`
- `ConfinementChargesReport`
- `CotUtilizationReport`
- `ReportDateRangePicker`
- `ExportToCsvButton`
- `ExportToPdfButton`
- `useReports` — TanStack Query hook for report data

---

## Shared / Infrastructure Modules

These are not user-facing modules but are required building blocks across all modules above.

### Shared Components
- `PageHeader` — consistent page title + breadcrumb
- `ConfirmDialog` — reusable confirmation modal for destructive actions
- `StatusBadge` — color-coded status pill (Available / Occupied / etc.)
- `SkeletonLoader` — loading skeleton for tables and grids
- `EmptyState` — empty list illustration + message
- `ErrorBoundary` — catches render errors gracefully
- `Pagination` — shared pagination controls

### State Management (Zustand Stores)
- `useAuthStore` — user session, role, permissions
- `useRoomStore` — room list filters and selected room
- `useCotStore` — cot list filters and selected cot
- `useAdmissionStore` — active admission and form state
- `useCotAssignmentStore` — active cot assignment and form state
- `useAlertStore` — in-app alert queue and unread count

### Routing
- `AppRouter` — all route definitions with React Router v6
- `ProtectedRoute` — role-aware route guard
- `PermissionGate` — feature-level access wrapper component

### API Services (Axios)
- `roomService` — room CRUD + availability endpoints
- `cotService` — cot CRUD + availability endpoints
- `admissionService` — admit, transfer, discharge endpoints
- `cotAssignmentService` — assign, transfer, discharge endpoints
- `auditLogService` — audit log fetch endpoint
- `reportService` — report data endpoints
- `authService` — login, logout, session refresh

### Utility Helpers
- `dateUtils` — format dates, calculate durations, detect overstays
- `roleUtils` — permission checking helpers
- `occupancyUtils` — compute occupancy rates
- `overstayUtils` — flag patients past expected discharge
- `exportUtils` — CSV and PDF generation helpers

---

## Development Priority Order

```
Phase 1 — Core (must-have for go-live)
  ├── Module 1: Authentication & Authorization
  ├── Module 3: Room Management
  ├── Module 4: Baby Cot Management
  ├── Module 5: Patient Admission
  ├── Module 6: Baby Cot Assignment
  ├── Module 7: Transfer
  ├── Module 8: Discharge
  └── Module 2: Occupancy Dashboard

Phase 2 — Operations (needed shortly after go-live)
  ├── Module 10: Notifications & Alerts
  ├── Module 9: Confinement History
  └── Module 11: Audit Log

Phase 3 — Analytics (for reporting and compliance)
  └── Module 12: Reports & Export
```

---

## Summary Count

| Category | Count |
|----------|-------|
| Total Modules | 12 |
| Total Pages | 28 |
| Total Components | 70+ |
| Total Custom Hooks | 20+ |
| Total API Services | 7 |
| Total Zustand Stores | 6 |
