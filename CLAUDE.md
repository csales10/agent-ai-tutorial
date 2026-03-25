# CLAUDE.md — Patient Room & Baby Cot Management System

This file provides context for Claude Code when working in this project directory.

---

## Project Overview

This is the **Patient Room & Baby Cot Management System** — a ReactJS single-page application for hospitals and clinics to manage patient room confinements and newborn baby cot assignments in the nursery ward.

The documents in this directory define the full scope of the system:

| File | Purpose |
|------|---------|
| [PROBLEM.md](./PROBLEM.md) | Full problem specification, entities, functional requirements, API endpoints, acceptance criteria |
| [RESEARCH.md](./RESEARCH.md) | Market research on hospital bed management systems, ReactJS patterns, libraries, standards |
| [FEATURES.md](./FEATURES.md) | Complete list of 12 feature modules with components, hooks, and services to build |
| [DESIGN.md](./DESIGN.md) | Wireframes, color palette, typography, layout approach, responsive breakpoints |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| UI Framework | React 18+ (functional components + hooks) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State — Server | TanStack Query (React Query v5) |
| State — Client/UI | Zustand |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| HTTP Client | Axios |
| Date/Time | date-fns |
| Real-Time | SSE (primary) + WebSocket (bidirectional) |
| Testing | Vitest + React Testing Library |

---

## Domain Context

### Two Core Domains

**1. Patient Room Confinement**
- Patients are admitted to hospital rooms (Private, Semi-Private, Ward, ICU, Isolation)
- Each room has one or more beds; each bed is assigned to one patient at a time
- Workflow: Admit → Occupy → Transfer (optional) → Discharge

**2. Baby Cot Assignment (Nursery)**
- Newborns are assigned to cots (Regular, Incubator, Warmer, NICU)
- Every baby record must be linked to the mother's patient record
- Workflow: Assign → Occupy → Transfer (optional) → Discharge

### Key Bed/Cot Lifecycle
```
Available → Occupied → Pending Discharge → Available (or Maintenance)
```

### Status Values (used everywhere)
- `Available` — green (`#16A34A`)
- `Occupied` — blue (`#1D4ED8`)
- `Pending Discharge` — amber (`#CA8A04`)
- `Reserved` — purple (`#7C3AED`)
- `Maintenance` — gray (`#94A3B8`)
- `Isolation` — red (`#DC2626`)
- `NICU` — teal (`#0D9488`)

---

## Module Summary

| # | Module | Priority |
|---|--------|----------|
| 1 | Authentication & Authorization | Critical |
| 2 | Occupancy Dashboard | Critical |
| 3 | Room Management | Critical |
| 4 | Baby Cot Management | Critical |
| 5 | Patient Admission | Critical |
| 6 | Baby Cot Assignment | Critical |
| 7 | Transfer | High |
| 8 | Discharge | High |
| 9 | Confinement History | High |
| 10 | Notifications & Alerts | High |
| 11 | Audit Log | Medium |
| 12 | Reports & Export | Medium |

---

## Roles & Permissions

| Role | Access |
|------|--------|
| Admin | Full CRUD on rooms/cots, all records, audit log, status override |
| Head Nurse | Admit, transfer, discharge patients and babies; view all |
| Nurse / Staff | Admit patients, assign cots, initiate transfer/discharge |
| Billing | View confinement records and charges (read-only) |
| Viewer | View room and cot availability only (read-only) |

---

## Key Design Decisions

- **Tablet-first responsive** — primary users are nurses on 10–11" tablets at bedside
- **2-click rule** — core actions (admit, transfer, discharge) must be reachable in 2 clicks
- **Color = status signal** — colors are reserved exclusively for status meaning, not decoration
- **SSE + TanStack Query** for real-time occupancy (firewall-friendly over WebSocket)
- **Optimistic locking + soft reservation** to prevent double bed/cot assignment
- **Mother-baby linkage is mandatory** — every newborn record must reference the mother's patient record
- **Audit log on all actions** — every create, update, admit, transfer, discharge is logged with actor and timestamp

## Brand Color

- Primary: `#0F6B8E` (Teal Blue)
- Font: Inter (UI/Body), JetBrains Mono (IDs, timestamps, codes)

---

## Out of Scope (v1)

- Billing and payment processing
- EMR / EHR integration
- Pharmacy or lab module
- Mobile app (React Native)
- IoT bed/cot sensor integration
- Insurance claims processing
