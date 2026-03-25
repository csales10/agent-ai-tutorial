# CLAUDE.md — SAP B1 Intelligent Analysis

This file provides context for Claude Code when working in this project directory.

---

## Project

**Name:** Intelligent Analysis
**Team:** Team B — Fraud Detection + Month-End Close
**Mode:** Lightning Hackathon (4–8 hours)
**Date:** 2026-03-25

> Build an AI-powered edge application that monitors SAP B1 transactions for fraud patterns, automates month-end reconciliation, and generates compliance-ready audit reports.

---

## Phase Status

| Phase | Status |
|-------|--------|
| Ideation (IDEATE.md) | ✅ Completed |
| Initialization (app scaffold) | 🔄 In Progress |
| Implementation — M1: Transaction Monitor | ⬜ Not Started |
| Implementation — M2: Fraud Detection | ⬜ Not Started |
| Implementation — M3: Month-End Close | ⬜ Not Started |
| Implementation — M4: Audit Report | ⬜ Not Started |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 + React 18 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| AI Engine | Claude API (pattern detection, risk scoring, NL explanations) |
| Data Layer | Mock JSON (`mock-sap-data/`) — static imports, no live SAP connection |
| Charts | Recharts |
| Database | SQLite via Prisma (optional — for persisting resolution status) |
| Deployment | Vercel |

---

## Must-Have Features (4 Stages, 2 Streams)

### FRAUD DETECTION STREAM

#### M1 — Transaction Monitor `STAGE 1: MONITOR`
- Dashboard loads all 18 journal entries and 12 payments from mock data
- Each transaction displays risk level badge: Low (green) / Medium (yellow) / High (orange) / Critical (red)
- Click a transaction → risk explanation + related records
- Filter/sort by risk level, date, user, amount

#### M2 — Fraud Detection Engine `STAGE 2: DETECT`
- Detects **5 fraud patterns**: duplicate payments, round-number anomalies, ghost vendors, split transactions below approval threshold, after-hours postings
- Each flag includes **confidence score + natural language explanation**
- Specific targets from mock data (see Embedded Test Scenarios below)

### COMPLIANCE STREAM

#### M3 — Month-End Close Checklist `STAGE 3: RECONCILE`
- Displays all 10 checklist items (CL-001 through CL-010) with pass/fail/pending badges
- Progress bar: 4 passed / 4 failed / 2 pending
- Failed items link to root-cause transactions

#### M4 — Audit Report Generator `STAGE 4: REPORT`
- One-click generation of compliance-ready report
- Summary: total transactions, flagged count, total exposure amount
- Itemized flagged list with risk level + explanation
- Month-end checklist summary
- Exportable as PDF or printable

---

## Detection Pipeline

```
Score → Flag → Alert → Resolve

SAP B1 Mock Data
    │
    ▼
[INGEST] → [SCORE via Claude API] → [FLAG with confidence] → [ALERT dashboard] → [RESOLVE + audit trail]

Month-End Trigger
    │
    ▼
[CHECKLIST] → [RECONCILE GL] → [EXCEPTIONS] → [REPORT / export]
```

---

## SAP B1 Entities

| Entity | Mock File | Usage |
|--------|-----------|-------|
| `JournalEntries` | `journal-entries.json` | Transaction monitoring, anomaly detection, after-hours detection |
| `Invoices` | _(referenced via payments)_ | Duplicate payment detection |
| `BusinessPartners` | `vendors.json` | Ghost vendor detection, vendor risk scoring |
| `ChartOfAccounts` | `chart-of-accounts.json` | GL balance reconciliation, variance analysis |
| `Payments` | `payments.json` | Payment pattern analysis, duplicate detection |
| `AuditLog` | `audit-log.json` | Compliance trail, bank account change detection |
| `ClosingDateProcedure` | `closing-checklist.json` | Month-end close checklist automation |

---

## Mock Data — Embedded Test Scenarios

| # | Scenario | Risk | Key IDs | Expected Flag |
|---|----------|------|---------|---------------|
| 1 | Duplicate payment — GlobalEdge | HIGH | Payments 5002, 5006 | Match CardCode + Amount + Reference |
| 2 | Duplicate payment — TechSupply | HIGH | Payments 5001, 5011 | Match CardCode + Amount + Reference |
| 3 | Ghost vendor — Apex Consulting | CRITICAL | Vendor V-1007, Payment 5007 | New vendor + no PO + payment within 30 days |
| 4 | Round-number anomaly | MEDIUM | Payments 5002, 5003 | Exact thousands above $1,000 |
| 5 | Split transactions — BrightMedia | HIGH | Payments 5004, 5005 | Same vendor + same day + below $5K threshold |
| 6 | After-hours postings by rgarcia | MEDIUM-HIGH | JE 1004, 1005, 1012, 1016 | PostingTime outside 07:00–20:00 |
| 7 | Suspicious bank account change | CRITICAL | Vendor V-1007, Audit 9002 | Bank change within N days before payment |
| 8 | GL balance mismatch — AP $3,320 | FAILED | CoA 2100, 6500, 6200 | CL-001 and CL-004 → FAILED |

**Total fraud exposure from mock data: $47,150**
- Duplicate payments: $22,350
- Ghost vendor: $15,000
- Split transactions: $9,800

---

## Acceptance Criteria

- [ ] Dashboard displays all 18 journal entries + 12 payments with color-coded risk badges
- [ ] Duplicate payment between same vendor flagged as HIGH risk
- [ ] Ghost vendor V-1007 (Apex Consulting Group) flagged as CRITICAL
- [ ] Split transactions by BrightMedia ($4,900 × 2) detected as HIGH
- [ ] After-hours postings by `rgarcia` flagged as MEDIUM-HIGH
- [ ] Month-end checklist shows all 10 tasks: 4 passed / 4 failed / 2 pending
- [ ] CL-001 and CL-004 show FAILED with $3,320 AP variance detail
- [ ] GL balance mismatch detected and highlighted
- [ ] Audit report exports with all flagged items and resolution notes
- [ ] Each fraud flag includes confidence score + natural language explanation

---

## Directory Structure

```
team-b/
├── CLAUDE.md               ← this file
├── PROBLEM.md              ← problem statement
├── IDEATE.md               ← feature planning (completed)
├── MOCK-SAP-DATA.md        ← mock data documentation
├── mock-sap-data/          ← JSON data files (DO NOT MODIFY)
│   ├── journal-entries.json
│   ├── vendors.json
│   ├── payments.json
│   ├── chart-of-accounts.json
│   ├── audit-log.json
│   └── closing-checklist.json
└── intelligent-analysis/   ← Next.js app (initialized in Step 2)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                  ← dashboard redirect
    │   │   ├── dashboard/page.tsx        ← M1: Transaction Monitor
    │   │   ├── fraud/page.tsx            ← M2: Fraud Detection
    │   │   ├── month-end/page.tsx        ← M3: Month-End Close
    │   │   ├── audit-report/page.tsx     ← M4: Audit Report
    │   │   └── api/sap/[entity]/route.ts ← mock SAP Service Layer
    │   ├── components/
    │   │   ├── ui/                       ← shadcn/ui components
    │   │   ├── TransactionTable.tsx
    │   │   ├── RiskBadge.tsx
    │   │   ├── FraudAlertCard.tsx
    │   │   ├── ChecklistItem.tsx
    │   │   └── AuditReportView.tsx
    │   └── lib/
    │       ├── mock-data.ts              ← data import helpers
    │       ├── fraud-rules.ts            ← detection rule engine
    │       └── claude-client.ts          ← Claude API wrapper
    └── mock-sap-data -> ../mock-sap-data ← symlink or copy
```

---

## Risk Level Color System

| Level | Color | Tailwind Class |
|-------|-------|----------------|
| Low | Green | `bg-green-100 text-green-800` |
| Medium | Yellow | `bg-yellow-100 text-yellow-800` |
| High | Orange | `bg-orange-100 text-orange-800` |
| Critical | Red | `bg-red-100 text-red-800` |

---

## P.R.I.M.E. Prompts (build order)

Use these exact prompts when implementing each stage:

1. `"Implement the MONITOR stage with mock SAP integration."` → M1
2. `"Implement the DETECT stage with mock SAP integration."` → M2
3. `"Implement the RECONCILE stage with mock SAP integration."` → M3
4. `"Implement the REPORT stage with mock SAP integration."` → M4

---

## Out of Scope

- Real-time SAP B1 Service Layer integration
- Full GRC compliance suite
- Multi-currency support
- User authentication / RBAC
- Historical data migration
