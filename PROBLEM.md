# Patient Room & Baby Cot Management System — Problem Specification (ReactJS)

## Overview

Build a **Patient Room & Baby Cot Management System** module as a ReactJS single-page application. The module is designed for hospital and clinic staff to manage room assignments for confined patients and baby cot assignments for newly born babies in the nursery.

---

## Background

Hospitals and clinics need an efficient system to:
- Assign and track room occupancy for admitted (confined) patients
- Manage baby cot assignments in the nursery ward for newborns
- Monitor real-time bed and cot availability across wards and floors
- Handle transfers, discharges, and room upgrades seamlessly
- Maintain complete confinement history per patient

Without a centralized system, staff rely on physical boards or disconnected spreadsheets, leading to miscommunication, delayed admissions, and safety risks for vulnerable patients.

---

## Tech Stack

| Layer        | Technology                                         |
|--------------|----------------------------------------------------|
| UI Framework | React 18+ (functional components + hooks)          |
| State Mgmt   | Zustand or Redux Toolkit                           |
| Routing      | React Router v6                                    |
| Forms        | React Hook Form + Zod (validation)                 |
| UI Library   | Tailwind CSS + shadcn/ui or Ant Design             |
| Date/Time    | date-fns or Day.js                                 |
| HTTP Client  | Axios + TanStack Query (React Query)               |
| Tables       | TanStack Table v8                                  |
| Testing      | Vitest + React Testing Library                     |

---

## Problem Statement

Hospital admissions and nursery staff need a clear, real-time view of room and cot availability to admit patients quickly and accurately. The ReactJS module must:

- Show available, occupied, and reserved rooms and cots on a visual floor map or grid
- Allow quick admission and assignment of a patient to a room or a newborn to a cot
- Track duration of confinement and flag overstays
- Support transfers between rooms or cots
- Trigger discharge workflows and free up beds in real time

---

## Entities

### Room
A physical room in the hospital used for patient confinement.

| Field          | Type     | Description                                          |
|----------------|----------|------------------------------------------------------|
| `id`           | string   | Unique identifier                                    |
| `room_number`  | string   | Display label (e.g., "301-A")                        |
| `ward`         | string   | Ward name (e.g., General, Maternity, ICU, Private)   |
| `floor`        | number   | Floor level                                          |
| `room_type`    | enum     | Private \| Semi-Private \| Ward \| ICU \| Isolation  |
| `bed_count`    | number   | Number of beds in the room                           |
| `rate_per_day` | number   | Room charge per day                                  |
| `amenities`    | string[] | AC, TV, Private Bathroom, Refrigerator, etc.         |
| `status`       | enum     | Available \| Occupied \| Reserved \| Maintenance     |

### Baby Cot
A cot assigned to a newborn in the nursery ward.

| Field          | Type     | Description                                          |
|----------------|----------|------------------------------------------------------|
| `id`           | string   | Unique identifier                                    |
| `cot_number`   | string   | Display label (e.g., "COT-01")                       |
| `section`      | string   | Nursery section (e.g., Regular, NICU, Isolation)     |
| `cot_type`     | enum     | Regular \| Incubator \| Warmer \| NICU               |
| `status`       | enum     | Available \| Occupied \| Reserved \| Maintenance     |

### Patient Confinement
A record linking a patient to a room for a period of stay.

| Field              | Type      | Description                                     |
|--------------------|-----------|-------------------------------------------------|
| `id`               | string    | Unique identifier                               |
| `patient_id`       | string    | FK → Patient                                    |
| `room_id`          | string    | FK → Room                                       |
| `bed_number`       | number    | Which bed in the room (if multi-bed)            |
| `admitted_by`      | string    | FK → Staff/User                                 |
| `admission_date`   | datetime  | Date and time of room assignment                |
| `expected_discharge` | date   | Target discharge date                           |
| `actual_discharge` | datetime  | Date and time of actual discharge               |
| `diagnosis`        | string    | Primary diagnosis / reason for confinement      |
| `attending_doctor` | string    | FK → Doctor                                     |
| `status`           | enum      | Active \| Discharged \| Transferred             |
| `notes`            | string    | Additional notes                                |

### Baby Cot Assignment
A record linking a newborn to a cot.

| Field              | Type      | Description                                     |
|--------------------|-----------|-------------------------------------------------|
| `id`               | string    | Unique identifier                               |
| `baby_id`          | string    | FK → Baby / Patient record                      |
| `mother_id`        | string    | FK → Mother's Patient record                    |
| `cot_id`           | string    | FK → Baby Cot                                   |
| `assigned_by`      | string    | FK → Staff/User                                 |
| `birth_datetime`   | datetime  | Date and time of birth                          |
| `assignment_date`  | datetime  | Date and time cot was assigned                  |
| `discharge_date`   | datetime  | Date and time baby was discharged from cot      |
| `birth_weight`     | number    | Birth weight in grams                           |
| `notes`            | string    | Medical notes (e.g., requires incubator)        |
| `status`           | enum      | Active \| Discharged \| Transferred             |

---

## Functional Requirements

### 1. Room Management
- View all rooms in a filterable table and a visual floor grid
- Create, edit, and deactivate rooms (admin only)
- Filter by ward, floor, room type, and status
- Show real-time status badge: Available (green), Occupied (red), Reserved (yellow), Maintenance (gray)

### 2. Baby Cot Management
- View all baby cots in a filterable table and nursery grid
- Create, edit, and deactivate cots (admin only)
- Filter by section and cot type
- Show real-time status badge per cot

### 3. Patient Admission (Room Assignment)
- Admit a patient to a room via a form:
  1. Search and select patient from patient records
  2. Select available room (filtered by ward, type, capacity)
  3. Assign specific bed number (if multi-bed room)
  4. Enter admission date, expected discharge, diagnosis, attending doctor, and notes
  5. Confirm admission and auto-update room status to Occupied
- Prevent assigning a patient to an already-occupied bed
- Show estimated room cost at time of admission based on rate per day × expected stay

### 4. Baby Cot Assignment
- Assign a newborn to a cot via a form:
  1. Link to the mother's patient record
  2. Enter baby details: birth datetime, birth weight, sex, notes
  3. Select available cot (filtered by section and type)
  4. Confirm and auto-update cot status to Occupied
- If the baby requires an incubator, filter only incubator/NICU cots
- Show mother-baby linkage in both the room and cot views

### 5. Room & Cot Transfer
- Transfer a patient to a different room:
  - Select destination room and bed
  - Record transfer reason and datetime
  - Auto-update source room to Available, destination to Occupied
- Transfer a baby to a different cot (e.g., from regular to NICU):
  - Same flow as room transfer
  - Require reason and attending doctor approval note

### 6. Discharge
- Discharge a patient from a room:
  - Set actual discharge datetime
  - Auto-update room status to Available (or to Cleaning/Maintenance if needed)
  - Show total confinement days and computed room charges
  - Print-ready discharge summary (optional)
- Discharge a baby from a cot:
  - Set discharge datetime
  - Auto-update cot status to Available
  - Link discharge to mother's discharge record if applicable

### 7. Occupancy Dashboard
- Summary cards:
  - Total Rooms | Occupied | Available | Reserved | Under Maintenance
  - Total Cots | Occupied | Available | Reserved | Under Maintenance
- Floor/ward breakdown: occupancy rate per ward and floor
- Visual room grid: each room shown as a card with status color and patient name (if occupied)
- Visual cot grid: each cot shown as a card with status and baby/mother name (if occupied)
- Overstay alerts: highlight patients past their expected discharge date

### 8. Confinement History
- View full confinement history per patient (all past and active admissions)
- View all confinements per room (timeline of past occupants)
- View all cot assignments per cot
- Export history to CSV or PDF

### 9. Notifications & Alerts (UI-level)
- Toast on successful admission, transfer, and discharge
- In-app alerts for:
  - Patients past expected discharge date (overstay)
  - Rooms or cots nearing maintenance schedule
  - Room or cot set to Maintenance while still occupied (warn staff)

### 10. Role-Based Access

| Role          | Permissions                                                                 |
|---------------|-----------------------------------------------------------------------------|
| Admin         | Full CRUD on rooms and cots, view all records, override status, audit log   |
| Head Nurse    | Admit, transfer, and discharge patients and babies; view all assignments     |
| Nurse / Staff | Admit patients, assign cots, initiate transfer/discharge (with approval)    |
| Billing       | View confinement records and room charges (read-only)                        |
| Viewer        | View room and cot availability only (read-only)                              |

---

## Page / Route Structure

```
/dashboard                        → Occupancy Dashboard (live grid + summary cards)

/rooms                            → Room List (table + filter)
/rooms/new                        → Create Room (admin)
/rooms/:id                        → Room Detail (info + current occupant + history)
/rooms/:id/edit                   → Edit Room (admin)

/cots                             → Baby Cot List (table + filter)
/cots/new                         → Create Cot (admin)
/cots/:id                         → Cot Detail (info + current baby + history)
/cots/:id/edit                    → Edit Cot (admin)

/admissions                       → All Active Confinements
/admissions/new                   → Admit Patient to Room (form)
/admissions/:id                   → Confinement Detail
/admissions/:id/transfer          → Transfer Patient
/admissions/:id/discharge         → Discharge Patient

/cot-assignments                  → All Active Cot Assignments
/cot-assignments/new              → Assign Baby to Cot (form)
/cot-assignments/:id              → Cot Assignment Detail
/cot-assignments/:id/transfer     → Transfer Baby to Different Cot
/cot-assignments/:id/discharge    → Discharge Baby

/history/patients/:patientId      → Confinement History per Patient
/history/rooms/:roomId            → Room Occupancy History
/history/cots/:cotId              → Cot Assignment History

/admin/audit-log                  → Audit Log (admin only)
```

---

## Component Architecture

```
src/
├── pages/
│   ├── DashboardPage.jsx
│   ├── rooms/
│   │   ├── RoomListPage.jsx
│   │   ├── RoomDetailPage.jsx
│   │   └── RoomFormPage.jsx
│   ├── cots/
│   │   ├── CotListPage.jsx
│   │   ├── CotDetailPage.jsx
│   │   └── CotFormPage.jsx
│   ├── admissions/
│   │   ├── AdmissionListPage.jsx
│   │   ├── AdmissionFormPage.jsx
│   │   ├── AdmissionDetailPage.jsx
│   │   ├── TransferRoomPage.jsx
│   │   └── DischargePage.jsx
│   └── cotAssignments/
│       ├── CotAssignmentListPage.jsx
│       ├── CotAssignmentFormPage.jsx
│       ├── CotAssignmentDetailPage.jsx
│       ├── TransferCotPage.jsx
│       └── CotDischargePage.jsx
│
├── components/
│   ├── dashboard/
│   │   ├── OccupancySummaryCards.jsx
│   │   ├── RoomGrid.jsx
│   │   ├── CotGrid.jsx
│   │   ├── WardBreakdownChart.jsx
│   │   └── OverstayAlerts.jsx
│   ├── rooms/
│   │   ├── RoomTable.jsx
│   │   ├── RoomCard.jsx
│   │   ├── RoomStatusBadge.jsx
│   │   └── RoomFilters.jsx
│   ├── cots/
│   │   ├── CotTable.jsx
│   │   ├── CotCard.jsx
│   │   ├── CotStatusBadge.jsx
│   │   └── CotFilters.jsx
│   ├── admissions/
│   │   ├── AdmissionForm/
│   │   │   ├── StepSelectPatient.jsx
│   │   │   ├── StepSelectRoom.jsx
│   │   │   └── StepConfirmAdmission.jsx
│   │   ├── AdmissionDetailPanel.jsx
│   │   ├── DischargeModal.jsx
│   │   └── TransferModal.jsx
│   ├── cotAssignments/
│   │   ├── CotAssignmentForm/
│   │   │   ├── StepBabyDetails.jsx
│   │   │   ├── StepSelectCot.jsx
│   │   │   └── StepConfirmAssignment.jsx
│   │   ├── CotAssignmentDetailPanel.jsx
│   │   ├── CotDischargeModal.jsx
│   │   └── CotTransferModal.jsx
│   └── shared/
│       ├── PageHeader.jsx
│       ├── ConfirmDialog.jsx
│       ├── StatusBadge.jsx
│       ├── OverstayBadge.jsx
│       └── PatientSearchInput.jsx
│
├── store/
│   ├── useRoomStore.js
│   ├── useCotStore.js
│   ├── useAdmissionStore.js
│   ├── useCotAssignmentStore.js
│   └── useAuthStore.js
│
├── hooks/
│   ├── useRooms.js
│   ├── useCots.js
│   ├── useAdmissions.js
│   ├── useCotAssignments.js
│   ├── useAvailableRooms.js
│   ├── useAvailableCots.js
│   └── useOccupancyDashboard.js
│
├── services/
│   ├── roomService.js
│   ├── cotService.js
│   ├── admissionService.js
│   └── cotAssignmentService.js
│
├── utils/
│   ├── dateUtils.js
│   ├── roleUtils.js
│   ├── occupancyUtils.js
│   └── overstayUtils.js
│
└── routes/
    ├── AppRouter.jsx
    └── ProtectedRoute.jsx
```

---

## Form Validation (React Hook Form + Zod)

```js
// Admission form schema
const admissionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  roomId: z.string().min(1, 'Room is required'),
  bedNumber: z.number().min(1, 'Bed number is required'),
  admissionDate: z.date({ required_error: 'Admission date is required' }),
  expectedDischarge: z.date({ required_error: 'Expected discharge date is required' }),
  diagnosis: z.string().min(3, 'Diagnosis is required'),
  attendingDoctor: z.string().min(1, 'Attending doctor is required'),
  notes: z.string().optional(),
}).refine(
  (data) => data.expectedDischarge > data.admissionDate,
  { message: 'Expected discharge must be after admission date', path: ['expectedDischarge'] }
);

// Cot assignment schema
const cotAssignmentSchema = z.object({
  motherId: z.string().min(1, "Mother's record is required"),
  cotId: z.string().min(1, 'Cot is required'),
  birthDatetime: z.date({ required_error: 'Birth date and time is required' }),
  birthWeight: z.number().min(100, 'Birth weight must be at least 100g').max(10000),
  sex: z.enum(['Male', 'Female']),
  cotType: z.enum(['Regular', 'Incubator', 'Warmer', 'NICU']),
  notes: z.string().optional(),
});
```

---

## API Endpoints (Suggested)

| Method | Endpoint                              | Description                          |
|--------|---------------------------------------|--------------------------------------|
| GET    | `/rooms`                              | List rooms (with filters)            |
| POST   | `/rooms`                              | Create room                          |
| PUT    | `/rooms/:id`                          | Update room                          |
| GET    | `/rooms/available`                    | Available rooms by ward/type         |
| GET    | `/cots`                               | List baby cots                       |
| POST   | `/cots`                               | Create baby cot                      |
| GET    | `/cots/available`                     | Available cots by section/type       |
| GET    | `/admissions`                         | List all active confinements         |
| POST   | `/admissions`                         | Admit patient to room                |
| GET    | `/admissions/:id`                     | Confinement detail                   |
| POST   | `/admissions/:id/transfer`            | Transfer patient to another room     |
| POST   | `/admissions/:id/discharge`           | Discharge patient                    |
| GET    | `/cot-assignments`                    | List all active cot assignments      |
| POST   | `/cot-assignments`                    | Assign newborn to cot                |
| POST   | `/cot-assignments/:id/transfer`       | Transfer baby to different cot       |
| POST   | `/cot-assignments/:id/discharge`      | Discharge baby from cot              |
| GET    | `/occupancy/dashboard`                | Live occupancy summary               |
| GET    | `/history/patients/:patientId`        | Confinement history per patient      |

---

## Non-Functional Requirements

- **Real-time updates**: Occupancy dashboard must reflect room and cot status changes within 5 seconds (polling or WebSocket)
- **Responsiveness**: All pages must work on tablets used by nurses at bedside (768px+)
- **Accessibility**: WCAG 2.1 AA — keyboard navigation, ARIA labels, focus trapping on modals
- **Error Handling**: All API errors must display user-friendly messages; form errors shown inline
- **Loading States**: Skeleton loaders for tables and grids; submit buttons disabled while loading
- **Audit Trail**: Every admission, transfer, discharge, and status change must be logged with actor, action, and timestamp
- **Data Safety**: Discharge and transfer actions require confirmation dialogs to prevent accidental triggers

---

## Acceptance Criteria

- [ ] A bed or cot cannot be assigned to more than one patient/baby at a time
- [ ] Room and cot status updates immediately upon admission, transfer, or discharge
- [ ] Admission form validates that expected discharge is after admission date
- [ ] Cot assignment form links newborn to mother's patient record
- [ ] Dashboard shows real-time count of available vs. occupied rooms and cots per ward
- [ ] Overstay alerts highlight patients past their expected discharge date
- [ ] Role-based UI hides restricted actions (e.g., admin-only room CRUD)
- [ ] Transfer workflow frees the source room/cot and occupies the destination atomically
- [ ] All actions are logged in the audit trail with actor and timestamp
- [ ] All forms show inline validation errors and disable submission while processing

---

## Out of Scope (v1)

- Billing and payment processing
- Electronic Medical Records (EMR) integration
- Pharmacy or lab module integration
- Mobile app (React Native)
- Automated IoT bed sensor integration
- Insurance claims processing
- Dietary or meal ordering per room
