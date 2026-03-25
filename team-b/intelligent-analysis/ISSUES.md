# ISSUES.md — Intelligent Analysis · SAP B1
> Reviewed: 2026-03-25 | Reviewer: Claude Code | Severity order: Critical → Major → Minor → Cosmetic

---

## 🔴 CRITICAL

### C-01 · Stale module-level data on all 4 pages
**Files:** `dashboard/page.tsx`, `fraud/page.tsx`, `month-end/page.tsx`, `audit-report/page.tsx`
**Description:** `getMockData()`, `scoreTransactions()`, `analyzeDetect()`, `analyzeReconcile()`, and `generateReport()` are all called at **module scope** (outside the component function). In Next.js with `'use client'`, this means data is evaluated once at build/bundle time and never refreshes. Any change to the underlying data files requires a full server restart to take effect.
**Impact:** Users always see stale data. Realtime monitoring is broken by design.
**Fix:** Move all data calls inside the component function body or use `useState` + `useEffect`.

---

### C-02 · No error boundaries anywhere in the app
**Files:** All page components
**Description:** No `<ErrorBoundary>` wraps any page or data-loading component. If any lib function throws (e.g., malformed JSON, missing field), the entire page white-screens with an unhandled React error.
**Impact:** Any single data error crashes the whole UI with no recovery path.
**Fix:** Wrap each page's main content in an error boundary component.

---

### C-03 · `globalIdx()` in DetectPanel is incorrect and O(n²)
**File:** `src/components/DetectPanel.tsx` line 209
**Description:** `data.alerts.indexOf(alert)` is called inside a `.map()` for every rendered alert — O(n²) complexity. Worse, if two alerts are structurally identical objects, `indexOf` returns the index of the **first** match, causing the wrong alert to be marked as reviewed.
**Impact:** Mark-as-reviewed feature silently marks the wrong alert in edge cases.
**Fix:** Add a unique `id` field to `FraudAlert` and key state by that ID.

---

### C-04 · Hardcoded values in `reconcile-analyzer.ts` don't match real data
**File:** `src/lib/reconcile-analyzer.ts`
**Description:** `apVariance: 3320`, `duplicateExposure: 22350`, and `afterHoursCount: 4` are hardcoded constants instead of being derived from actual data. The checklist items and GL accounts used to calculate these are already available in the file.
**Impact:** KPI cards on Month-End Close page will show wrong numbers if underlying mock data changes.
**Fix:** Calculate these values dynamically from `rawPayments`, `rawJE`, and `auditLog`.

---

### C-05 · Path traversal risk in API route
**File:** `src/app/api/sap/[entity]/route.ts`
**Description:** While `params.entity` is validated against an allowlist, `path.join(process.cwd(), 'mock-sap-data', params.entity + '.json')` could still be dangerous if the allowlist check is ever bypassed or the validation logic changes. No sanitization (e.g., `path.basename`) is applied before file system access.
**Impact:** Potential directory traversal to read arbitrary server files.
**Fix:** Use `path.basename(params.entity)` before building the file path, and keep the allowlist check.

---

### C-06 · `JSON.parse()` in API route has no error handling
**File:** `src/app/api/sap/[entity]/route.ts` line 21
**Description:** `JSON.parse(fs.readFileSync(filePath, 'utf-8'))` will throw and crash the API handler if the file contains invalid JSON.
**Impact:** API returns 500 with an unhandled exception instead of a clean error response.
**Fix:** Wrap in try/catch and return `NextResponse.json({ error: 'Failed to parse data' }, { status: 500 })`.

---

### C-07 · Unsafe `any` casts throughout lib layer with no runtime validation
**Files:** `risk-scorer.ts`, `fraud-rules.ts`, `report-generator.ts`, `reconcile-analyzer.ts`
**Description:** Every access to mock data uses `data.journalEntries as any[]`, `data.payments as any[]`, etc. Property access (`.TransId`, `.Debit`, `.Lines`, `.DocDate`) is done without any null/undefined guards. If any JSON field is missing or renamed, silent `undefined` values propagate into calculations.
**Impact:** Risk scores, fraud alerts, and reconcile summaries silently produce NaN/wrong values with no error surfaced.
**Fix:** Define strict interfaces for raw SAP data shapes and add runtime guards.

---

## 🟠 MAJOR

### M-01 · Search input in TopBar is non-functional
**File:** `src/components/TopBar.tsx`
**Description:** The search box renders with a placeholder and a `Ctrl F` keyboard hint, but has no `onChange` handler, no state, and no filtering logic wired up. Typing does nothing. The `Ctrl F` hint misleads users into expecting browser Find to be intercepted.
**Fix:** Either wire up a global search handler (e.g., via context) or remove the keyboard shortcut hint and mark it as "coming soon".

---

### M-02 · `DetectPanel` state keyed by array index, not by ID
**File:** `src/components/DetectPanel.tsx`
**Description:** `reviewed` state uses `Set<number>` with array indices. If `data.alerts` is ever reordered or filtered before being passed in, the indices shift and reviewed flags point to the wrong alerts.
**Fix:** Use a unique alert identifier (e.g., `alert.title + alert.pattern`) as the key.

---

### M-03 · Division by zero in GL variance calculation
**File:** `src/lib/reconcile-analyzer.ts` line ~82
**Description:** `variancePct = (varianceAmt / Math.abs(prior)) * 100` — if `prior` (prior period balance) is `0`, the result is `Infinity` or `NaN`, which renders as blank or broken in the GL table.
**Fix:** Guard with `prior !== 0 ? (varianceAmt / Math.abs(prior)) * 100 : 0`.

---

### M-04 · `Lines` array accessed without null guard in risk-scorer
**File:** `src/lib/risk-scorer.ts`
**Description:** `(je.Lines as any[]).reduce(...)` will throw `TypeError: Cannot read properties of undefined` if a journal entry has no `Lines` field.
**Fix:** `((je.Lines as any[]) ?? []).reduce(...)`.

---

### M-05 · Invalid date strings cause silent NaN in fraud rules
**File:** `src/lib/fraud-rules.ts`
**Description:** `new Date(vendor.CreateDate)`, `new Date(p.DocDate)`, `new Date(je.TransDate)` — none validate the input string. If any date field is null, empty, or malformed, `date.getTime()` returns `NaN`, causing all date comparisons to silently fail (never match or always match).
**Fix:** Add `isNaN(date.getTime())` checks before using computed dates.

---

### M-06 · Posting time string split without format validation
**File:** `src/lib/fraud-rules.ts` line ~104
**Description:** `je.PostingTime.split(':')[0]` assumes the format is always `"HH:MM"`. If the field is `null`, `undefined`, or a different format, it throws or returns wrong hours.
**Fix:** Validate with a regex (`/^\d{2}:\d{2}/`) before splitting.

---

### M-07 · `claude-client.ts` — dead code with no indication AI is disabled
**File:** `src/lib/claude-client.ts`
**Description:** `scoreTransactionRisk()` is defined but never called anywhere. The file imports the Anthropic SDK but there is no `.env.local` with `ANTHROPIC_API_KEY`, so it silently falls back or errors. Users have no indication live AI scoring is disabled.
**Fix:** Either wire it up or remove it. Add a comment block clearly stating whether AI scoring is active.

---

### M-08 · No loading or error states on any page
**Files:** All pages
**Description:** Pages either show data immediately (stale) or show nothing if data fails. There are no skeleton loaders, no "loading…" states, and no "failed to load" fallbacks.
**Fix:** Add loading and error UI states, especially once data fetching is moved to runtime.

---

### M-09 · Hardcoded static badge count in SideNav
**File:** `src/components/SideNav.tsx` line 16
**Description:** `badge: 1` is hardcoded on the Fraud Detection menu item. It never reflects the actual fraud alert count.
**Fix:** Pass the real count from a shared data source or context.

---

### M-10 · Report ID is not unique
**File:** `src/lib/report-generator.ts` line 152
**Description:** Every call to `generateReport()` returns `reportId: 'AR-2026-03-001'` — a hardcoded static string. In any multi-user or multi-period scenario, all reports have the same ID, which breaks audit trail requirements.
**Fix:** Generate dynamically, e.g., `AR-${new Date().getFullYear()}-${String(month).padStart(2,'0')}-${uuid}`.

---

### M-11 · Missing ARIA labels on all interactive elements
**Files:** `MonitorTable.tsx`, `DetectPanel.tsx`, `ReconcilePanel.tsx`, `AuditReportView.tsx`
**Description:** Expand/collapse buttons, "Mark reviewed", "Mark resolved", filter tabs, and risk badge pills have no `aria-label` or `role` attributes. Screen readers cannot describe these controls.
**Fix:** Add `aria-label`, `aria-expanded`, and `role="button"` where appropriate.

---

## 🟡 MINOR

### m-01 · Hardcoded sidebar data statistics don't match actual data
**File:** `src/components/SideNav.tsx` lines 26–31
**Description:** `{ label: 'Journal Entries', count: 18 }`, etc. are hardcoded. Actual mock data may have different record counts.
**Fix:** Import and use `getMockData()` to derive real counts, or drive from a shared constant.

---

### m-02 · `ThemeToggle` brief flash of incorrect theme on first load
**File:** `src/components/ThemeToggle.tsx`
**Description:** Initial state is `false` (light mode). The `useEffect` that reads `localStorage` runs after first render, so users with dark mode saved may see a brief white flash before the toggle corrects itself.
**Fix:** The inline `<script>` in `layout.tsx` already applies the `dark` class before render — ensure `ThemeToggle` initial state reads from `document.documentElement.classList` instead of defaulting to `false`.

---

### m-03 · `localStorage` access has no error handling
**File:** `src/components/ThemeToggle.tsx`
**Description:** `localStorage.getItem()` and `localStorage.setItem()` can throw in private/incognito mode on some browsers (Safari ITP). No try/catch present.
**Fix:** Wrap in try/catch with a silent fallback.

---

### m-04 · `▲▼` Unicode arrows not accessible
**Files:** `MonitorTable.tsx`, `ReconcilePanel.tsx`, `DetectPanel.tsx`
**Description:** Expand/collapse indicators use raw Unicode text characters (`▲▼`). Screen readers may read them as "black up-pointing triangle" which is confusing. No `aria-hidden="true"` applied.
**Fix:** Add `aria-hidden="true"` to these characters and use `aria-expanded` on the parent button instead.

---

### m-05 · Notification bell and mail button have no handlers
**File:** `src/components/TopBar.tsx`
**Description:** Bell button shows a red "unread" dot but clicking does nothing. Mail button also has no `onClick`. Users may click repeatedly expecting a panel to open.
**Fix:** Either implement a dropdown panel or remove the red dot indicator that implies pending actions.

---

### m-06 · `colSpan` hardcoded to `7` in multiple tables
**Files:** `MonitorTable.tsx`, `ReconcilePanel.tsx`
**Description:** Flag-detail rows use `colSpan={7}` hardcoded. If a column is added/removed, the colspan breaks the layout silently.
**Fix:** Derive colspan from the headers array length.

---

### m-07 · Color contrast may fail WCAG AA on light backgrounds
**Files:** Multiple components
**Description:** `text-yellow-600` on `bg-yellow-50`, `text-blue-300` on `bg-blue-700` (SideNav bottom banner), and `text-gray-400` on `bg-white` may not meet the 4.5:1 contrast ratio required by WCAG AA for normal text.
**Fix:** Verify with a contrast checker; increase font weight or darken text colors where failing.

---

### m-08 · `max-w-screen-2xl` on `<main>` breaks wide-screen centering
**File:** `src/app/layout.tsx` line 33
**Description:** `max-w-screen-2xl` without `mx-auto` means on ultra-wide screens the content is left-aligned rather than centered.
**Fix:** Add `mx-auto` alongside `max-w-screen-2xl`.

---

### m-09 · Search input missing visible focus ring
**File:** `src/components/TopBar.tsx`
**Description:** The search input uses `focus:outline-none` which removes the browser's default focus indicator. Only a `ring-1` appears, which may be insufficient for keyboard users.
**Fix:** Ensure a minimum 2px visible focus outline is present per WCAG 2.1 SC 2.4.11.

---

### m-10 · No `rel="noopener noreferrer"` on all external `target="_blank"` links
**File:** `src/components/SideNav.tsx`
**Description:** Already added for SAP B1 Data, but the pattern should be enforced globally. Any future `target="_blank"` without `rel="noopener noreferrer"` is a security risk (tab-napping).
**Fix:** Enforce via ESLint rule `jsx-a11y/anchor-is-valid` or a lint config.

---

### m-11 · Emoji icons in `detect-analyzer.ts` are not accessible
**File:** `src/lib/detect-analyzer.ts` lines 26–31
**Description:** Pattern icons (🔁, 👻, 🔢, ✂️, 🌙) are rendered directly in UI without `aria-hidden` or text alternatives. Screen readers announce them as their Unicode description.
**Fix:** Wrap in `<span aria-hidden="true">` when rendered.

---

### m-12 · `page.tsx` root redirect has no fallback
**File:** `src/app/page.tsx`
**Description:** `redirect('/dashboard')` works in Server Components but provides no fallback UI if the redirect is delayed or fails in a client context.
**Fix:** Acceptable as-is for a Server Component, but add a loading indicator `<p>Redirecting…</p>` below the redirect call as a safety net.

---

## 🔵 COSMETIC

### co-01 · "Stage M1 · Real-time SAP B1 feed" is misleading
**File:** `src/app/dashboard/page.tsx` line 51
**Description:** Subtitle reads "Real-time SAP B1 feed with AI risk scoring" but data is static mock data, not real-time. Could confuse evaluators or stakeholders.
**Fix:** Change to "Mock SAP B1 data with AI risk scoring" or "Demo mode".

---

### co-02 · Hardcoded user avatar initials "FC"
**File:** `src/components/TopBar.tsx` line 57
**Description:** Avatar shows "FC" and email `fc@sapb1consulting.com` as hardcoded strings. Not dynamic.
**Fix:** Drive from a user context/config constant at minimum.

---

### co-03 · `API Health` menu item links to `#`
**File:** `src/components/SideNav.tsx` line 23
**Description:** The API Health menu item goes nowhere (`href: '#'`), making it appear broken or incomplete.
**Fix:** Either implement a `/api-health` page or hide the item until ready.

---

### co-04 · Print button emoji `🖨` may not render consistently cross-platform
**File:** `src/components/AuditReportView.tsx` line 183
**Description:** The printer emoji renders differently across OS/browser combinations.
**Fix:** Replace with a Lucide `Printer` icon for consistency with the rest of the UI.

---

### co-05 · Inconsistent spacing: some sections use `mb-5`, others `mb-6`
**Files:** Multiple pages
**Description:** Vertical rhythm between sections alternates between `mb-5` and `mb-6` without a consistent pattern.
**Fix:** Standardize on one spacing unit (e.g., `mb-6`) across all page section gaps.

---

### co-06 · `"Ctrl F"` shortcut label should be `"⌘F"` on macOS
**File:** `src/components/TopBar.tsx` line 37
**Description:** The keyboard shortcut hint always shows `Ctrl F` regardless of OS. Mac users use `⌘F`.
**Fix:** Detect `navigator.platform` and render the correct modifier key.

---

## Summary Table

| Severity | Count |
|----------|-------|
| 🔴 Critical | 7 |
| 🟠 Major | 11 |
| 🟡 Minor | 12 |
| 🔵 Cosmetic | 6 |
| **Total** | **36** |

---

*Generated by automated code review — 2026-03-25*
