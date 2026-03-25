# Mock SAP Data Layer

## Overview

The `mock-sap-data/` directory contains a realistic, self-contained set of JSON files that simulate SAP Business One transactional data for March 2026. This mock data layer exists so the hackathon team can develop and demonstrate the Intelligent Analysis application **without requiring a live SAP B1 connection, service layer credentials, or database access**.

The data set is intentionally seeded with **seven distinct fraud patterns and anomalies** that the AI detection engine must identify. It also includes month-end closing checklist items with pass/fail statuses that drive the reconciliation dashboard.

---

## File Inventory

| File | Records | Description |
|------|---------|-------------|
| `journal-entries.json` | 18 | General ledger journal entries for March 2026, including normal transactions and flagged anomalies |
| `vendors.json` | 9 | Business partner (vendor) master records with contact, tax, and bank details |
| `payments.json` | 12 | Outgoing vendor payment records with method, bank, and reference data |
| `chart-of-accounts.json` | 21 | GL account balances (current and prior period) across Asset, Liability, Equity, Revenue, and Expense categories |
| `audit-log.json` | 10 | System audit trail entries tracking creates, updates, and suspicious activity |
| `closing-checklist.json` | 10 | Month-end close tasks with pass/fail/pending status and descriptions |

---

## Data Relationships

```
                         ┌──────────────────┐
                         │   vendors.json   │
                         │   (CardCode)     │
                         └────────┬─────────┘
                                  │
                    CardCode      │      CardCode
               ┌──────────────────┼──────────────────┐
               ▼                  │                   ▼
    ┌─────────────────┐           │        ┌─────────────────────┐
    │ payments.json   │           │        │ journal-entries.json │
    │ (DocEntry)      │           │        │ (TransId)            │
    │ Reference ──────┼───────────┼────────┤ Reference            │
    └────────┬────────┘           │        └──────────┬───────────┘
             │                    │                    │
             │ AcctCode (via      │                    │ AcctCode
             │ journal lines)     │                    │ (Lines[].AcctCode)
             │                    │                    │
             ▼                    │                    ▼
    ┌─────────────────────┐       │        ┌─────────────────────┐
    │ chart-of-accounts   │       │        │ chart-of-accounts   │
    │ .json (AcctCode)    │◄──────┘        │ .json (AcctCode)    │
    └────────┬────────────┘                └──────────┬──────────┘
             │                                        │
             │ AcctCode referenced by                  │
             ▼                                        ▼
    ┌───────────────────────────────────────────────────────┐
    │              closing-checklist.json                    │
    │  References GL accounts (e.g., 2100 AP, 1100 Cash,   │
    │  1510 Accum. Depr.) for reconciliation checks         │
    └───────────────────────┬───────────────────────────────┘
                            │
                            │ ObjectKey links to
                            │ TransId, CardCode, DocNum
                            ▼
    ┌───────────────────────────────────────────────────────┐
    │                  audit-log.json                        │
    │  Tracks CREATE/UPDATE actions on BusinessPartner,     │
    │  JournalEntry, Payment, and GLAccount objects          │
    └───────────────────────────────────────────────────────┘
```

**Key linkages:**
- `vendors.CardCode` joins to `payments.CardCode` and is referenced in `journal-entries.Lines[].LineMemo`
- `payments.Reference` matches `journal-entries.Reference` to link payments to their journal postings
- `journal-entries.Lines[].AcctCode` maps to `chart-of-accounts.AcctCode`
- `audit-log.ObjectKey` references `vendors.CardCode`, `journal-entries.TransId`, or `payments.DocNum`
- `closing-checklist` tasks reference GL accounts (e.g., AcctCode 2100, 1100, 1510) by description

---

## Embedded Test Scenarios

| # | Scenario | Description | Files Involved | Records (IDs) | Expected Detection Behavior |
|---|----------|-------------|----------------|----------------|----------------------------|
| 1 | **Duplicate Payments (GlobalEdge)** | Same vendor V-1002, same amount ($10,000), same reference AP-2026-0078 paid twice, 13 days apart | payments, journal-entries, audit-log | Payments: 5002, 5006; JE: 1004, 1014; Audit: 9005 | Flag as HIGH risk. Duplicate detection engine should match on CardCode + Amount + Reference. Total duplicate exposure: $10,000. |
| 2 | **Duplicate Payments (TechSupply)** | Same vendor V-1001, same amount ($12,350), same reference PO-2026-0045 paid twice, 2 days apart | payments, audit-log | Payments: 5001, 5011; Audit: 9008 | Flag as HIGH risk. Duplicate detection engine should match on CardCode + Amount + Reference. Total duplicate exposure: $12,350. |
| 3 | **Ghost Vendor** | Vendor V-1007 (Apex Consulting Group) created on 2026-03-10, no purchase order history, `LastPurchaseDate` is null, received $15,000 payment 5 days later. Contact person name matches employee "rgarcia" (Ricardo Garcia). | vendors, payments, journal-entries, audit-log | Vendor: V-1007; Payment: 5007; JE: 1012; Audit: 9001, 9002, 9003 | Flag as CRITICAL risk. Ghost vendor rules: new vendor + no PO history + payment within 30 days + same user created vendor and processed payment. |
| 4 | **Round-Number Anomaly** | $10,000.00 consulting payment and $5,000.00 office supplies payment are perfectly round amounts, unusual for legitimate invoices | payments, journal-entries | Payments: 5002, 5003; JE: 1004, 1005 | Flag as MEDIUM risk. Round-number heuristic should score exact thousands above a configurable threshold (e.g., > $1,000). |
| 5 | **Split Transactions** | Two payments of $4,900 each to BrightMedia Agency (V-1003) posted 7 minutes apart on same day, both just below the $5,000 approval threshold. Combined total: $9,800. | payments, journal-entries, audit-log | Payments: 5004, 5005; JE: 1006, 1007; Audit: 9006, 9007 | Flag as HIGH risk. Split detection: same vendor + same day + individual amounts below threshold + combined amount above threshold. |
| 6 | **After-Hours Postings** | Four transactions posted between 1:00 AM and 3:30 AM, all by user "rgarcia": consulting payment (02:17), office supplies (02:23), ghost vendor payment (01:45), self-approved reimbursement (03:05) | journal-entries, audit-log | JE: 1004, 1005, 1012, 1016; Audit: 9003, 9004, 9009 | Flag as MEDIUM-HIGH risk. Time-based rule: PostingTime outside business hours (e.g., before 07:00 or after 20:00). Pattern intensifies when same user is responsible for multiple after-hours entries. |
| 7 | **Suspicious Bank Account Change** | V-1007 bank account changed from BPI-0011223344 to BPI-0099887766 at 10:15 PM on 2026-03-14, one day before $15,000 payment on 2026-03-15 | vendors, audit-log, payments | Vendor: V-1007; Audit: 9002, 9003; Payment: 5007 | Flag as CRITICAL risk. Rule: bank account modification within N days before a payment + after-hours change timestamp. Compounds with ghost vendor scenario. |
| 8 | **GL Balance Mismatch** | AP control account (2100) shows $31,970 but vendor sub-ledger totals $28,650 -- a $3,320 variance. Professional Services Expense (6500) shows 192% increase. Office Supplies (6200) shows 132% increase from prior period. | chart-of-accounts, closing-checklist | CoA: 2100, 6500, 6200; Checklist: CL-001, CL-004 | Month-end close items CL-001 and CL-004 should show FAILED status. Reconciliation dashboard should highlight the $3,320 variance and flag expense accounts with >100% period-over-period increase. |

---

## Schema Reference

### journal-entries.json

| Field | Type | Description |
|-------|------|-------------|
| `TransId` | number | Unique journal entry transaction ID (1001-1018) |
| `TransDate` | string (ISO date) | Posting date |
| `Memo` | string | Transaction description |
| `Reference` | string | Cross-reference to invoice, PO, or payment document |
| `CreatedBy` | string | Username who created the entry |
| `PostingTime` | string (HH:mm:ss) | Time of posting (used for after-hours detection) |
| `_flags` | string[] (optional) | Pre-seeded suspicious indicators for testing |
| `Lines` | array | Journal entry line items |
| `Lines[].AcctCode` | string | GL account code |
| `Lines[].AcctName` | string | GL account name |
| `Lines[].Debit` | number | Debit amount |
| `Lines[].Credit` | number | Credit amount |
| `Lines[].LineMemo` | string | Line-level description |

### vendors.json

| Field | Type | Description |
|-------|------|-------------|
| `CardCode` | string | Unique vendor identifier (V-1001 through V-1009) |
| `CardName` | string | Vendor company name |
| `Address` | string | Full address |
| `TaxId` | string | Tax identification number |
| `Currency` | string | Transaction currency (all PHP) |
| `CreateDate` | string (ISO date) | Date vendor was created in system |
| `LastPurchaseDate` | string or null | Date of last purchase order (null = ghost vendor indicator) |
| `ContactPerson` | string | Primary contact name |
| `Phone` | string | Contact phone number |
| `BankAccount` | string | Vendor bank account for payments |
| `_flags` | string[] (optional) | Pre-seeded suspicious indicators |

### payments.json

| Field | Type | Description |
|-------|------|-------------|
| `DocEntry` | number | Unique payment document ID (5001-5012) |
| `DocNum` | string | Payment document number (PAY-2026-XXXX) |
| `CardCode` | string | Vendor code (FK to vendors.CardCode) |
| `CardName` | string | Vendor name |
| `DocDate` | string (ISO date) | Payment date |
| `PaymentAmount` | number | Amount paid |
| `PaymentMethod` | string | "BankTransfer" or "Check" |
| `CheckNumber` | string or null | Check number (if payment by check) |
| `BankCode` | string | Bank code used for payment |
| `Reference` | string | Cross-reference to AP invoice or PO |
| `_flags` | string[] (optional) | Pre-seeded suspicious indicators |

### chart-of-accounts.json

| Field | Type | Description |
|-------|------|-------------|
| `AcctCode` | string | GL account code |
| `AcctName` | string | Account name |
| `Category` | string | "Asset", "Liability", "Equity", "Revenue", or "Expense" |
| `Balance` | number | Current period ending balance |
| `PriorPeriodBalance` | number | Prior period ending balance (for variance analysis) |
| `_flags` | string[] (optional) | Mismatch or anomaly indicators |

### audit-log.json

| Field | Type | Description |
|-------|------|-------------|
| `LogId` | number | Unique log entry ID (9001-9010) |
| `Timestamp` | string (ISO 8601) | Date and time of the action |
| `User` | string | Username who performed the action |
| `Action` | string | "CREATE" or "UPDATE" |
| `ObjectType` | string | "BusinessPartner", "JournalEntry", "Payment", or "GLAccount" |
| `ObjectKey` | string | ID of the affected object (CardCode, TransId, DocNum, or AcctCode) |
| `OldValue` | string or null | Previous value (null for CREATE actions) |
| `NewValue` | string | New or created value description |
| `_flags` | string[] (optional) | Pre-seeded suspicious indicators |

### closing-checklist.json

| Field | Type | Description |
|-------|------|-------------|
| `TaskId` | string | Checklist task ID (CL-001 through CL-010) |
| `Name` | string | Task name |
| `Category` | string | "Reconciliation", "Review", or "Reporting" |
| `Status` | string | "passed", "failed", or "pending" |
| `AutoCheck` | boolean | Whether this task runs automatically (true) or requires manual review (false) |
| `Description` | string | Detailed description including specific findings and figures |

---

## Usage Notes

### Loading in Next.js / React

```typescript
// Option 1: Static import (recommended for hackathon)
import journalEntries from '@/mock-sap-data/journal-entries.json';
import vendors from '@/mock-sap-data/vendors.json';
import payments from '@/mock-sap-data/payments.json';
import chartOfAccounts from '@/mock-sap-data/chart-of-accounts.json';
import auditLog from '@/mock-sap-data/audit-log.json';
import closingChecklist from '@/mock-sap-data/closing-checklist.json';

// Option 2: API route (simulates SAP Service Layer)
// Create /api/sap/[entity]/route.ts that reads from mock-sap-data/
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: { entity: string } }) {
  const filePath = path.join(process.cwd(), 'mock-sap-data', `${params.entity}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return NextResponse.json(data);
}
```

### Filtering for Flagged Records

All suspicious records include a `_flags` array. To extract only flagged items:

```typescript
const flaggedJournals = journalEntries.filter(je => je._flags && je._flags.length > 0);
const flaggedPayments = payments.filter(p => p._flags && p._flags.length > 0);
const flaggedVendors = vendors.filter(v => v._flags && v._flags.length > 0);
const failedChecks = closingChecklist.filter(cl => cl.Status === 'failed');
```

### Linking Data Across Files

```typescript
// Get all payments for a vendor
const vendorPayments = (cardCode: string) =>
  payments.filter(p => p.CardCode === cardCode);

// Get journal entry for a payment
const journalForPayment = (reference: string) =>
  journalEntries.find(je => je.Reference === reference);

// Get audit trail for an object
const auditTrail = (objectKey: string) =>
  auditLog.filter(log => log.ObjectKey === objectKey);
```

### Data Totals (Quick Reference)

- **Total payments:** 12 records, sum = $109,095.67
- **Flagged payments:** 6 records (5002, 5004, 5005, 5006, 5007, 5011)
- **Duplicate payment exposure:** $22,350 (GlobalEdge $10,000 + TechSupply $12,350)
- **Ghost vendor exposure:** $15,000 (Apex Consulting Group)
- **Split transaction exposure:** $9,800 (BrightMedia Agency)
- **GL accounts with mismatches:** 3 (AcctCode 2100, 6200, 6500)
- **Closing checklist:** 4 passed, 4 failed, 2 pending
