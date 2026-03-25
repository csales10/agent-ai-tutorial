# Patient Room & Baby Cot Management System — Design Document

> Based on [FEATURES.md](./FEATURES.md)

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Layout Approach](#4-layout-approach)
5. [Spacing & Sizing System](#5-spacing--sizing-system)
6. [Component Design Tokens](#6-component-design-tokens)
7. [Wireframes — Screen by Screen](#7-wireframes--screen-by-screen)
   - [Screen 01 — Login](#screen-01--login)
   - [Screen 02 — Occupancy Dashboard](#screen-02--occupancy-dashboard)
   - [Screen 03 — Room List](#screen-03--room-list)
   - [Screen 04 — Room Detail](#screen-04--room-detail)
   - [Screen 05 — Room Form (Create / Edit)](#screen-05--room-form-create--edit)
   - [Screen 06 — Baby Cot List](#screen-06--baby-cot-list)
   - [Screen 07 — Baby Cot Detail](#screen-07--baby-cot-detail)
   - [Screen 08 — Patient Admission Form (Multi-Step)](#screen-08--patient-admission-form-multi-step)
   - [Screen 09 — Admission List](#screen-09--admission-list)
   - [Screen 10 — Admission Detail](#screen-10--admission-detail)
   - [Screen 11 — Baby Cot Assignment Form (Multi-Step)](#screen-11--baby-cot-assignment-form-multi-step)
   - [Screen 12 — Transfer Form](#screen-12--transfer-form)
   - [Screen 13 — Discharge Form](#screen-13--discharge-form)
   - [Screen 14 — Confinement History](#screen-14--confinement-history)
   - [Screen 15 — Audit Log](#screen-15--audit-log)
   - [Screen 16 — Reports](#screen-16--reports)
   - [Screen 17 — Alert Drawer](#screen-17--alert-drawer)
8. [Status Color System](#8-status-color-system)
9. [Icon System](#9-icon-system)
10. [Responsive Breakpoints](#10-responsive-breakpoints)

---

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Clarity first** | Clinical environments are high-stress. Every screen must communicate its purpose in under 2 seconds. No decorative clutter. |
| **Action in 2 clicks** | Core actions (admit, transfer, discharge) must be reachable within 2 clicks from any screen. |
| **Color as signal** | Color is used exclusively for status meaning, never for decoration. Every color has a defined semantic meaning. |
| **Touch-friendly** | Minimum touch targets of 44×44px. Nurses use tablets at bedside; fat-finger errors cost patient safety. |
| **Progressive disclosure** | Show only what is needed at each step. Multi-step forms hide complexity until the user is ready. |
| **Accessible by default** | WCAG 2.1 AA. Every color contrast ratio ≥ 4.5:1. All interactive elements keyboard-navigable. |

---

## 2. Color Palette

### Brand & UI Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Teal Blue | `#0F6B8E` | Primary buttons, active nav items, links |
| Primary Dark | Deep Teal | `#0A4F6B` | Primary button hover, pressed state |
| Primary Light | Sky Teal | `#E0F4FA` | Primary button background (ghost), highlights |
| Secondary | Soft Slate | `#64748B` | Secondary buttons, subtle labels |
| Secondary Dark | Dark Slate | `#475569` | Secondary hover |
| Accent | Warm Coral | `#E05C5C` | Destructive actions (discharge, delete) |
| Accent Dark | Deep Coral | `#C04444` | Destructive hover |

### Neutral / UI Surface Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Background | Off White | `#F8FAFC` | Page background |
| Surface | White | `#FFFFFF` | Cards, modals, panels |
| Surface Alt | Cool Gray 50 | `#F1F5F9` | Sidebar, table row alt, input background |
| Border | Cool Gray 200 | `#E2E8F0` | Card borders, dividers, input borders |
| Border Focus | Teal Blue | `#0F6B8E` | Input focus ring |
| Text Primary | Slate 900 | `#0F172A` | Headings, body text |
| Text Secondary | Slate 500 | `#64748B` | Labels, captions, hints |
| Text Disabled | Slate 300 | `#CBD5E1` | Disabled inputs and text |
| Text Inverse | White | `#FFFFFF` | Text on colored backgrounds |

### Status Colors (Semantic — Room & Cot)

| Status | Background Hex | Border / Text Hex | Usage |
|--------|----------------|-------------------|-------|
| Available | `#DCFCE7` | `#16A34A` | Available rooms and cots |
| Occupied | `#DBEAFE` | `#1D4ED8` | Occupied rooms and cots |
| Pending Discharge | `#FEF9C3` | `#CA8A04` | Patient has discharge order |
| Reserved / On Hold | `#F3E8FF` | `#7C3AED` | Temporarily held for incoming patient |
| Under Maintenance | `#F1F5F9` | `#94A3B8` | Room/cot offline for servicing |
| Isolation Required | `#FEE2E2` | `#DC2626` | Infection control flag |
| NICU / Special Care | `#CCFBF1` | `#0D9488` | NICU cots and special nursery care |

### Feedback / Notification Colors

| Type | Background Hex | Border / Icon Hex | Usage |
|------|----------------|-------------------|-------|
| Success | `#F0FDF4` | `#16A34A` | Toast success, form save confirmation |
| Warning | `#FFFBEB` | `#D97706` | Overstay alert, maintenance reminder |
| Error | `#FFF1F2` | `#E11D48` | API errors, conflict (409), validation failures |
| Info | `#EFF6FF` | `#2563EB` | General informational messages |

### Dark Mode (optional extension)

| Role | Hex |
|------|-----|
| Background | `#0F172A` |
| Surface | `#1E293B` |
| Surface Alt | `#1A2537` |
| Border | `#334155` |
| Text Primary | `#F1F5F9` |
| Text Secondary | `#94A3B8` |

---

## 3. Typography

### Font Family

| Role | Font | Fallback | Source |
|------|------|----------|--------|
| **UI / Body** | Inter | `system-ui, -apple-system, sans-serif` | Google Fonts |
| **Monospace** (IDs, timestamps) | JetBrains Mono | `'Courier New', monospace` | Google Fonts |

> **Why Inter**: Designed specifically for screen readability. Excellent legibility at small sizes, which is critical when room numbers and patient names are displayed in compact cards. Widely used in healthcare dashboards.

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px | 400 | Timestamps, meta labels, badges |
| `text-sm` | 14px | 20px | 400 | Table cell body, secondary text, captions |
| `text-base` | 16px | 24px | 400 | Form labels, body paragraph |
| `text-lg` | 18px | 28px | 500 | Card headings, section labels |
| `text-xl` | 20px | 28px | 600 | Page sub-headings, modal titles |
| `text-2xl` | 24px | 32px | 700 | Page headings (h1 on detail pages) |
| `text-3xl` | 30px | 36px | 700 | Dashboard summary numbers |
| `text-4xl` | 36px | 40px | 800 | Large KPI metrics on dashboard |

### Font Weight Usage

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, table cell content |
| Medium | 500 | Labels, nav items, secondary headings |
| Semibold | 600 | Buttons, card headings, status badges |
| Bold | 700 | Page titles, KPI numbers |
| Extrabold | 800 | Dashboard hero metrics only |

### Letter Spacing

- Headings (`text-2xl` and above): `tracking-tight` (-0.025em)
- Body: `tracking-normal` (0)
- Labels / Badges / Uppercase text: `tracking-wide` (+0.05em) with `text-xs` and `uppercase`

---

## 4. Layout Approach

### Strategy: **Tablet-First Responsive**

> The primary users (nurses, head nurses) operate on **10–11" tablets** at bedside. The secondary users (admins, billing) use **desktop monitors**. The system is not a patient-facing app so mobile phone (< 640px) support is secondary but still functional.

### Breakpoints

| Name | Min Width | Target Device |
|------|-----------|---------------|
| `sm` | 640px | Large phone (landscape) |
| `md` | 768px | **Tablet portrait — primary target** |
| `lg` | 1024px | Tablet landscape / small laptop |
| `xl` | 1280px | Desktop monitor |
| `2xl` | 1536px | Wide desktop / command center display |

### Shell Layout

```
┌─────────────────────────────────────────────────────┐
│  TOPBAR (fixed, h-16)                                │
│  [Logo]  [Nav: Dashboard Rooms Cots Admissions]  [🔔][👤] │
├────────────────┬────────────────────────────────────┤
│                │                                    │
│   SIDEBAR      │   MAIN CONTENT AREA                │
│   (w-64)       │   (flex-1, overflow-y-auto)        │
│   hidden on    │                                    │
│   md and below │                                    │
│                │                                    │
└────────────────┴────────────────────────────────────┘
```

- **Topbar**: Fixed, `h-16` (64px), full width. Contains logo, navigation (collapsed to hamburger on tablet), notification bell, and user avatar menu.
- **Sidebar**: Fixed left, `w-64` (256px). Visible on `lg` and above. Collapses to a slide-out drawer on `md` and below triggered by the hamburger icon.
- **Main Content**: Fluid `flex-1`. Has `px-6 py-6` padding on desktop; `px-4 py-4` on tablet.

### Grid System

- Use **CSS Grid** for page-level layouts (dashboard summary cards, room/cot grids)
- Use **Flexbox** for component-level layouts (form rows, card headers, button groups)
- Dashboard summary cards: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
- Room/cot grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`

### Content Max Width

| Context | Max Width |
|---------|-----------|
| Full-width page (dashboard, list) | `max-w-none` (fluid) |
| Form pages (create/edit) | `max-w-2xl` (672px) centered |
| Multi-step wizard | `max-w-3xl` (768px) centered |
| Detail pages | `max-w-5xl` (1024px) |
| Modals | `max-w-lg` (512px) |
| Confirm dialogs | `max-w-md` (448px) |

---

## 5. Spacing & Sizing System

Uses **4px base unit** (Tailwind default).

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon gaps, tight inline spacing |
| `space-2` | 8px | Within-component padding |
| `space-3` | 12px | Badge padding, small gaps |
| `space-4` | 16px | Standard component gap |
| `space-6` | 24px | Section gaps, card padding |
| `space-8` | 32px | Between major sections |
| `space-12` | 48px | Page section gaps |

### Touch Target Minimum
- All interactive elements (buttons, nav items, table row actions): minimum **44×44px**
- Room/cot cards in grid: minimum **80×80px** on tablet

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded` | 4px | Badges, tags |
| `rounded-md` | 6px | Inputs, small buttons |
| `rounded-lg` | 8px | Cards, panels |
| `rounded-xl` | 12px | Modals, large cards |
| `rounded-full` | 9999px | Avatar, pill badges, circular icon buttons |

### Elevation / Shadow

| Level | CSS | Usage |
|-------|-----|-------|
| Level 0 | `none` | Flat elements, table rows |
| Level 1 | `0 1px 3px rgba(0,0,0,0.08)` | Cards, inputs on focus |
| Level 2 | `0 4px 12px rgba(0,0,0,0.10)` | Dropdowns, popovers |
| Level 3 | `0 8px 24px rgba(0,0,0,0.12)` | Modals, dialogs |
| Level 4 | `0 16px 48px rgba(0,0,0,0.16)` | Toasts, alert drawers |

---

## 6. Component Design Tokens

### Buttons

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| Primary | `#0F6B8E` | `#FFFFFF` | none | `#0A4F6B` |
| Secondary | `#FFFFFF` | `#0F6B8E` | `#0F6B8E` | `#E0F4FA` bg |
| Danger | `#E05C5C` | `#FFFFFF` | none | `#C04444` |
| Ghost | `transparent` | `#0F6B8E` | none | `#E0F4FA` bg |
| Disabled | `#F1F5F9` | `#CBD5E1` | none | no hover |

- Height: `h-10` (40px) standard; `h-9` (36px) compact; `h-11` (44px) large/touch
- Min width: `min-w-[88px]`
- Icon button: `w-10 h-10` circular (`rounded-full`)

### Inputs & Form Fields

- Height: `h-10` (40px)
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Border radius: `rounded-md` (6px)
- Focus ring: `ring-2 ring-#0F6B8E`
- Error state border: `#E11D48`
- Placeholder color: `#94A3B8`
- Label: `text-sm font-medium text-#0F172A`, displayed above input

### Cards

- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Border radius: `rounded-lg` (8px)
- Shadow: Level 1
- Padding: `p-6` (24px) on desktop; `p-4` (16px) on tablet

### Tables

- Header row: background `#F8FAFC`, text `text-xs font-semibold uppercase tracking-wide text-#64748B`
- Body rows: background `#FFFFFF`, alternating `#F8FAFC`
- Row height: `h-14` (56px) to accommodate touch
- Row hover: `#F0F9FF` (light teal tint)
- Row divider: `1px solid #F1F5F9`

### Modals

- Overlay: `rgba(15, 23, 42, 0.5)` backdrop with blur
- Container: `bg-white`, `rounded-xl`, `shadow Level-3`
- Header: `px-6 pt-6 pb-4`, title `text-xl font-semibold`
- Body: `px-6 pb-4`
- Footer: `px-6 pb-6 flex justify-end gap-3`
- Close button: `×` top-right, `w-8 h-8 rounded-full`

---

## 7. Wireframes — Screen by Screen

> All wireframes use ASCII block notation.
> `[Button]` = primary button | `(Button)` = secondary/ghost button | `{input}` = text input
> `[ ]` = checkbox | `(o)` = radio | `▼` = dropdown select

---

### Screen 01 — Login

**Route**: `/login`
**Layout**: Centered single column, no sidebar, no topbar.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│              ┌──────────────────────────┐              │
│              │  🏥  Hospital RMS        │              │
│              │  Patient Room & Cot      │              │
│              │  Management System       │              │
│              │                          │              │
│              │  Username                │              │
│              │  {─────────────────────} │              │
│              │                          │              │
│              │  Password                │              │
│              │  {─────────────────────} │              │
│              │                          │              │
│              │  [   Sign In   ]         │              │
│              │                          │              │
│              │  Forgot password?        │              │
│              └──────────────────────────┘              │
│                                                         │
│              v1.0.0 · © 2026 Hospital RMS               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Background: gradient from `#E0F4FA` (top) to `#F8FAFC` (bottom)
- Card: white, `max-w-sm`, `rounded-xl`, Level 3 shadow
- Logo area: hospital icon + system name in `text-2xl font-bold` primary color
- Sign In button: full width, primary variant
- Error state: red inline message below password field

---

### Screen 02 — Occupancy Dashboard

**Route**: `/dashboard`
**Layout**: Full-width, sidebar visible on desktop.

```
┌─ TOPBAR ────────────────────────────────────────────────────────────────┐
│ 🏥 RMS    Dashboard  Rooms  Cots  Admissions  Cot Assign    🔔3  👤 Ana │
└─────────────────────────────────────────────────────────────────────────┘
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────────┐
│ Dashboard  │                                                              │
│ Rooms      │  Occupancy Dashboard          ● Live  Updated 14s ago       │
│ Cots       │                                                              │
│ Admissions │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ Cot Assign │  │  ROOMS   │ │ Occupied │ │Available │ │ Reserved │      │
│ History    │  │   48     │ │   31     │ │   12     │ │    3     │      │
│ Reports    │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│ Audit Log  │  ┌──────────┐                                               │
│            │  │Maintenanc│  ← row 2 for Maintenance card                │
│            │  │    2     │                                               │
│            │  └──────────┘                                               │
│            │                                                              │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│            │  │  COTS    │ │ Occupied │ │Available │ │ NICU     │      │
│            │  │   24     │ │   18     │ │    4     │ │    2     │      │
│            │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│            │                                                              │
│            │  ⚠ Overstay Alerts (3)   Ward Filter ▼   Floor Filter ▼    │
│            │  ┌─────────────────────────────────────────────────────┐   │
│            │  │ ⚠ Juan Cruz · Room 301-A · 2 days overdue  [View]  │   │
│            │  │ ⚠ Maria Lim · Room 205-B · 1 day overdue   [View]  │   │
│            │  │ ⚠ Pedro Rey · Room 108-C · 3 days overdue  [View]  │   │
│            │  └─────────────────────────────────────────────────────┘   │
│            │                                                              │
│            │  ROOM GRID   (○ Grid  ● Map)                                │
│            │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│            │  │ 101  │ │ 102  │ │ 103  │ │ 104  │ │ 105  │ │ 106  │  │
│            │  │ OCCUP│ │AVAIL │ │ OCCUP│ │ RES  │ │MAINT │ │ OCCUP│  │
│            │  │J.Cruz│ │      │ │M.Lim │ │      │ │      │ │P.Rey │  │
│            │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│            │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ...                  │
│            │  │ 201  │ │ 202  │ │ 203  │ │ 204  │                      │
│            │  │ OCCUP│ │AVAIL │ │ISOLA │ │AVAIL │                      │
│            │  └──────┘ └──────┘ └──────┘ └──────┘                      │
│            │                                                              │
│            │  COT GRID                                                    │
│            │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│            │  │ COT01│ │ COT02│ │ COT03│ │ COT04│ │ COT05│            │
│            │  │REGUL │ │ NICU │ │AVAIL │ │AVAIL │ │INCUB │            │
│            │  │Baby A│ │Baby B│ │      │ │      │ │Baby C│            │
│            │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘            │
└────────────┴──────────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Summary cards: `grid-cols-2 lg:grid-cols-5`; each card has large number in `text-4xl font-extrabold` and a label in `text-sm text-secondary`
- Each summary card has a subtle left border in its status color
- "Live" indicator: pulsing green dot + "Updated Xs ago" text
- Room/Cot grid cards: `80px × 80px` minimum; status color fills the card background at 20% opacity; status text in matching dark color; patient name in `text-xs` truncated
- Overstay alerts: amber warning panel, dismissible rows

---

### Screen 03 — Room List

**Route**: `/rooms`
**Layout**: Full-width content area with sidebar.

```
┌─ TOPBAR ──────────────────────────────────────────────────────────────┐
│ 🏥 RMS    ...nav...                                    🔔  👤 Ana     │
└───────────────────────────────────────────────────────────────────────┘
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  Rooms                           [+ Add Room]           │
│            │  Manage hospital rooms and bed inventory                 │
│            │                                                          │
│            │  {🔍 Search rooms...}  Ward ▼  Floor ▼  Type ▼  Status ▼│
│            │                                         (Clear Filters)  │
│            │                                                          │
│            │  ○ Table   ● Grid    Showing 48 rooms                   │
│            │                                                          │
│            │ ┌──────────────────────────────────────────────────┐    │
│            │ │ Room#  Ward       Type       Beds  Rate   Status  │    │
│            │ ├──────────────────────────────────────────────────┤    │
│            │ │ 101    General    Private      1   ₱2,500  ● AVAIL│   │
│            │ │ 102    General    Semi-Pvt     2   ₱1,800  ● OCCUP│   │
│            │ │ 103    Maternity  Private      1   ₱2,800  ● AVAIL│   │
│            │ │ 104    ICU        ICU          1   ₱8,000  ● OCCUP│   │
│            │ │ 105    General    Ward         4   ₱800   ⚙ MAINT │   │
│            │ │ 106    Maternity  Isolation    1   ₱3,200  ● ISOLA│   │
│            │ │ ...                                                │   │
│            │ └──────────────────────────────────────────────────┘    │
│            │                                                          │
│            │  ← 1  2  3  4  5 →     10 per page ▼                   │
│            │                                                          │
└────────────┴──────────────────────────────────────────────────────────┘
```

**Design Notes**:
- `[+ Add Room]` button: primary, top-right of page header. Hidden for non-admin roles.
- Filter row: inline horizontal on desktop; collapses to a "Filters" button revealing a filter drawer on tablet
- Row click: navigates to Room Detail (`/rooms/:id`)
- Each row has a `⋮` actions menu on hover: View, Edit, Deactivate
- Status pill: color-coded badge matching the status color system
- Table sorted by Room# ascending by default; column headers are sortable

---

### Screen 04 — Room Detail

**Route**: `/rooms/:id`
**Layout**: Two-column on desktop (`3/5 + 2/5`); single column stacked on tablet.

```
┌─ TOPBAR ──────────────────────────────────────────────────────────────┐
│ 🏥 RMS    ...nav...                                    🔔  👤 Ana     │
└───────────────────────────────────────────────────────────────────────┘
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  ← Rooms / Room 301-A                                    │
│            │                                                          │
│            │  Room 301-A                    ● OCCUPIED  (Edit) [⋮]   │
│            │                                                          │
│            ├────────────────────────────┬────────────────────────────┤
│            │  ROOM INFORMATION          │  CURRENT OCCUPANT          │
│            │  ─────────────────────     │  ─────────────────────     │
│            │  Ward:     Maternity       │  Patient: Juan Cruz        │
│            │  Floor:    3rd Floor       │  Bed No:  1                │
│            │  Type:     Private         │  Admitted: Mar 20, 2026    │
│            │  Beds:     1               │  Exp. DC:  Mar 27, 2026    │
│            │  Rate/day: ₱2,500          │  ⚠ 2 days overdue          │
│            │  Amenities:                │  Diagnosis: Post-CS        │
│            │   ✓ AC  ✓ TV  ✓ Bathroom  │  Doctor: Dr. Santos        │
│            │                            │                            │
│            │                            │  [Transfer]  [Discharge]   │
│            │                            │                            │
│            ├────────────────────────────┴────────────────────────────┤
│            │                                                          │
│            │  CONFINEMENT HISTORY                        Export CSV ↓ │
│            │  ┌─────────────────────────────────────────────────┐    │
│            │  │ Patient       Admitted      Discharged   Days    │    │
│            │  │ Juan Cruz     Mar 20, 2026  —            7+      │    │
│            │  │ Ana Reyes     Feb 10, 2026  Feb 15, 2026  5      │    │
│            │  │ Carlo Bato    Jan 5, 2026   Jan 8, 2026   3      │    │
│            │  └─────────────────────────────────────────────────┘    │
│            │                                                          │
└────────────┴──────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Left panel: room metadata in a definition list style (`label: value` rows)
- Right panel: current occupant card with highlight border in status color. If room is available, shows an "Admit Patient" call-to-action
- Overstay: amber warning badge with number of overdue days
- `[Transfer]` and `[Discharge]` buttons: only visible if room is Occupied. Transfer = secondary; Discharge = danger variant
- History table: sortable by date; row click opens full admission detail

---

### Screen 05 — Room Form (Create / Edit)

**Route**: `/rooms/new` | `/rooms/:id/edit`
**Layout**: Centered single-column form, `max-w-2xl`.

```
┌─ TOPBAR ──────────────────────────────────────────────────────────────┐
│ 🏥 RMS    ...nav...                                    🔔  👤 Ana     │
└───────────────────────────────────────────────────────────────────────┘
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  ← Rooms / Create New Room                               │
│            │                                                          │
│            │  ┌─────────────────────────────────────────────────┐    │
│            │  │  Room Information                                │    │
│            │  │  ─────────────────                               │    │
│            │  │  Room Number *                                   │    │
│            │  │  {──────────────────────────}                    │    │
│            │  │                                                  │    │
│            │  │  Ward *                  Floor *                 │    │
│            │  │  {────────────────} ▼   {──────────────────} ▼  │    │
│            │  │                                                  │    │
│            │  │  Room Type *             Number of Beds *        │    │
│            │  │  {────────────────} ▼   {──────────────────}    │    │
│            │  │                                                  │    │
│            │  │  Rate per Day (₱) *                              │    │
│            │  │  {──────────────────────────}                    │    │
│            │  │                                                  │    │
│            │  │  Amenities                                       │    │
│            │  │  [✓] Air Conditioning   [✓] Television          │    │
│            │  │  [✓] Private Bathroom   [ ] Refrigerator        │    │
│            │  │  [ ] Sofa Bed           [ ] Wi-Fi               │    │
│            │  │                                                  │    │
│            │  │  Status *                                        │    │
│            │  │  (●) Active   (○) Inactive   (○) Maintenance    │    │
│            │  │                                                  │    │
│            │  │               (Cancel)   [Save Room]            │    │
│            │  └─────────────────────────────────────────────────┘    │
│            │                                                          │
└────────────┴──────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Inline validation: red error message below the field, shown on blur or submit attempt
- Required fields marked with `*` in label
- Two-column layout for paired fields (ward/floor, type/beds) on desktop; single column on tablet
- Amenities: checkbox group rendered as pill-style toggles
- `[Save Room]` disabled while submitting; shows spinner inside button

---

### Screen 06 — Baby Cot List

**Route**: `/cots`
**Layout**: Mirrors Room List layout.

```
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  Baby Cots                        [+ Add Cot]           │
│            │  Manage nursery cots                                     │
│            │                                                          │
│            │  {🔍 Search cots...}   Section ▼   Type ▼   Status ▼    │
│            │                                                          │
│            │  ○ Table   ● Grid    Showing 24 cots                    │
│            │                                                          │
│            │ ┌─────────────────────────────────────────────────┐     │
│            │ │ Cot #   Section    Type        Status            │     │
│            │ ├─────────────────────────────────────────────────┤     │
│            │ │ COT-01  Regular    Regular      ● AVAILABLE      │     │
│            │ │ COT-02  NICU       NICU         ● OCCUPIED       │     │
│            │ │ COT-03  Regular    Incubator    ● OCCUPIED       │     │
│            │ │ COT-04  Isolation  Regular      ⚙ MAINTENANCE   │     │
│            │ │ COT-05  Regular    Warmer       ● AVAILABLE      │     │
│            │ └─────────────────────────────────────────────────┘     │
│            │                                                          │
│            │  ← 1  2  3 →     10 per page ▼                          │
└────────────┴──────────────────────────────────────────────────────────┘
```

---

### Screen 07 — Baby Cot Detail

**Route**: `/cots/:id`
**Layout**: Two-column on desktop; stacked on tablet.

```
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  ← Cots / COT-02                                         │
│            │                                                          │
│            │  COT-02 — NICU                     ● OCCUPIED  (Edit)   │
│            │                                                          │
│            ├───────────────────────┬────────────────────────────────┤ │
│            │  COT INFORMATION      │  CURRENT BABY                  │ │
│            │  ───────────────────  │  ─────────────────────         │ │
│            │  Cot Number: COT-02   │  Baby of: Maria Santos         │ │
│            │  Section: NICU        │  Born: Mar 21, 2026 · 02:14 AM │ │
│            │  Type: NICU           │  Weight: 1,420g (premature)    │ │
│            │  Status: Occupied     │  Sex: Male                     │ │
│            │                       │  APGAR: 7/10                   │ │
│            │                       │  Notes: Requires O2 support    │ │
│            │                       │                                │ │
│            │                       │  [Transfer Cot]  [Discharge]   │ │
│            ├───────────────────────┴────────────────────────────────┤ │
│            │                                                          │
│            │  ASSIGNMENT HISTORY                         Export CSV ↓ │
│            │  ┌────────────────────────────────────────────────┐     │
│            │  │ Baby of        Assigned       Discharged  Days  │     │
│            │  │ Maria Santos   Mar 21, 2026   —           3+    │     │
│            │  │ Ana Cruz       Feb 5, 2026    Feb 9, 2026  4    │     │
│            │  └────────────────────────────────────────────────┘     │
│            │                                                          │
└────────────┴──────────────────────────────────────────────────────────┘
```

---

### Screen 08 — Patient Admission Form (Multi-Step)

**Route**: `/admissions/new`
**Layout**: Centered wizard, `max-w-3xl`. Step indicator at top.

```
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  ← Admissions / New Admission                            │
│            │                                                          │
│            │  ┌──────────────────────────────────────────────────┐   │
│            │  │                                                   │   │
│            │  │  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○         │   │
│            │  │  1.Patient  2.Room  3.Bed  4.Details  5.Confirm  │   │
│            │  │                                                   │   │
│            │  │  ┌─────────────────────────────────────────┐     │   │
│            │  │  │  STEP 1 — Select Patient                │     │   │
│            │  │  │                                         │     │   │
│            │  │  │  Search Patient *                       │     │   │
│            │  │  │  {🔍 Type name or patient ID...       } │     │   │
│            │  │  │                                         │     │   │
│            │  │  │  Search Results:                        │     │   │
│            │  │  │  ┌───────────────────────────────────┐ │     │   │
│            │  │  │  │ ○  Juan Cruz     #PT-00123        │ │     │   │
│            │  │  │  │    M · 34 yrs · 09XX-XXX-XXXX     │ │     │   │
│            │  │  │  │ ○  Juan Carlos   #PT-00456        │ │     │   │
│            │  │  │  │    M · 45 yrs · 09XX-XXX-XXXX     │ │     │   │
│            │  │  │  └───────────────────────────────────┘ │     │   │
│            │  │  │                                         │     │   │
│            │  │  │  Selected: Juan Cruz  #PT-00123  ✓      │     │   │
│            │  │  │                                         │     │   │
│            │  │  └─────────────────────────────────────────┘     │   │
│            │  │                                                   │   │
│            │  │                        (Cancel)   [Next →]        │   │
│            │  └──────────────────────────────────────────────────┘   │
│            │                                                          │
└────────────┴──────────────────────────────────────────────────────────┘
```

**Step 5 — Confirm & Estimated Cost**:
```
│  │  STEP 5 — Review & Confirm                          │  │
│  │                                                     │  │
│  │  Patient:          Juan Cruz (#PT-00123)            │  │
│  │  Room:             301-A · Private · Maternity      │  │
│  │  Bed:              Bed 1                            │  │
│  │  Admission Date:   Mar 24, 2026 · 10:30 AM          │  │
│  │  Exp. Discharge:   Mar 31, 2026                     │  │
│  │  Diagnosis:        Post-CS Recovery                 │  │
│  │  Doctor:           Dr. Santos                       │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  Estimated Room Cost                        │   │  │
│  │  │  ₱2,500/day  ×  7 days  =  ₱17,500          │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │           (← Back)            [Confirm Admission]   │  │
```

**Design Notes**:
- Step indicator: horizontal stepper with numbered circles. Completed steps shown in primary color with checkmark. Active step in primary filled circle. Future steps in gray.
- Each step slides in from right; back slides from left
- `[Next →]` disabled until required fields for current step are valid
- Estimated cost box: teal-tinted info card

---

### Screen 09 — Admission List

**Route**: `/admissions`
**Layout**: Full-width table with filters.

```
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  Admissions                       [+ New Admission]     │
│            │  Active patient confinements                             │
│            │                                                          │
│            │  {🔍 Search patient name or room...}  Status ▼  Ward ▼  │
│            │                                                          │
│            │ ┌───────────────────────────────────────────────────┐   │
│            │ │ Patient       Room    Admitted     Exp. DC  Status │   │
│            │ ├───────────────────────────────────────────────────┤   │
│            │ │ Juan Cruz     301-A   Mar 20       Mar 27   ⚠OVERS│   │
│            │ │ Maria Lim     205-B   Mar 22       Mar 26   ● ACTV │   │
│            │ │ Pedro Rey     108-C   Mar 23       Mar 28   ● ACTV │   │
│            │ │ Ana Reyes     410-D   Mar 24       Mar 30   ● ACTV │   │
│            │ └───────────────────────────────────────────────────┘   │
│            │                                                          │
│            │  ← 1  2  3 →                                             │
└────────────┴──────────────────────────────────────────────────────────┘
```

---

### Screen 10 — Admission Detail

**Route**: `/admissions/:id`
**Layout**: Two-column on desktop.

```
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  ← Admissions / Juan Cruz · 301-A                        │
│            │                                                          │
│            │  Confinement Record                    ⚠ OVERSTAY       │
│            │                                                          │
│            ├─────────────────────────┬──────────────────────────────┤ │
│            │  PATIENT                │  ROOM                        │ │
│            │  Juan Cruz              │  Room 301-A                  │ │
│            │  #PT-00123              │  Maternity · Private         │ │
│            │  M · 34 yrs             │  Bed 1 of 1                  │ │
│            │                         │  ₱2,500 / day                │ │
│            ├─────────────────────────┼──────────────────────────────┤ │
│            │  CONFINEMENT DETAILS    │  CHARGES                     │ │
│            │  Admitted: Mar 20, 2026 │  Rate/day:   ₱2,500          │ │
│            │  Exp. DC:  Mar 27, 2026 │  Days so far: 7 days         │ │
│            │  Doctor:   Dr. Santos   │  Total Est.: ₱17,500         │ │
│            │  Diagnosis:Post-CS      │                              │ │
│            │  Notes:    —            │                              │ │
│            ├─────────────────────────┴──────────────────────────────┤ │
│            │                                                          │
│            │                    (Transfer Room)   [Discharge Patient] │
│            │                                                          │
│            │  ACTIVITY TIMELINE                                       │
│            │  ● Mar 20, 10:15 AM — Admitted to Room 301-A by Ana R.  │
│            │  ● Mar 20, 10:16 AM — Room status set to Occupied        │
│            │  ● Mar 24, 02:00 PM — ⚠ Expected discharge passed        │
└────────────┴──────────────────────────────────────────────────────────┘
```

---

### Screen 11 — Baby Cot Assignment Form (Multi-Step)

**Route**: `/cot-assignments/new`
**Layout**: Centered wizard, `max-w-3xl`.

```
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━○                              │
│  1. Mother    2. Baby Details    3. Select Cot    4. Confirm  │
│                                                               │
│  STEP 2 — Baby Details                                        │
│  ─────────────────────────────                                │
│  Mother (linked): Maria Santos · #PT-00789  ✓                 │
│                                                               │
│  Birth Date & Time *                                          │
│  {Mar 21, 2026} {02:14 AM}                                    │
│                                                               │
│  Birth Weight (grams) *          Sex *                        │
│  {1420}                          (●) Male  (○) Female         │
│                                                               │
│  Gestational Age (weeks)         APGAR Score                  │
│  {30}                            {7}                          │
│                                                               │
│  Requires Special Cot?                                        │
│  [✓] Incubator / NICU Care                                    │
│      (Cot list will be filtered to NICU/Incubator only)       │
│                                                               │
│  Clinical Notes                                               │
│  {────────────────────────────────────────────────────────}   │
│                                                               │
│                          (← Back)        [Next →]             │
```

---

### Screen 12 — Transfer Form

**Route**: `/admissions/:id/transfer` | `/cot-assignments/:id/transfer`
**Layout**: Centered, `max-w-lg` modal or full page.

```
┌──────────────────────────────────────────────────────────┐
│  Transfer Patient — Juan Cruz                            │
│  Current Room: 301-A · Maternity · Private               │
│  ────────────────────────────────────────────────────    │
│                                                          │
│  Select Destination Room *                               │
│  {🔍 Filter by ward, type...}                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ (●) 201-A · General · Private · 1 bed · ₱2,200  │    │
│  │ (○) 310-B · Maternity · Private · 1 bed · ₱2,500│    │
│  │ (○) 402-C · Private · Suite · 1 bed · ₱4,800    │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Transfer Date & Time *                                  │
│  {Mar 24, 2026}  {03:00 PM}                              │
│                                                          │
│  Transfer Reason *                                       │
│  {────────────────────────────────────────────────}      │
│  ! Reason is required                                    │
│                                                          │
│  Doctor's Note (required for ICU transfers)              │
│  {────────────────────────────────────────────────}      │
│                                                          │
│                     (Cancel)   [Confirm Transfer]        │
└──────────────────────────────────────────────────────────┘
```

**Design Notes**:
- Available rooms list: radio-button card list, each card shows room info at a glance
- Occupied and reserved rooms are greyed out and not selectable
- `[Confirm Transfer]` triggers a second confirmation dialog before final submit

---

### Screen 13 — Discharge Form

**Route**: `/admissions/:id/discharge`
**Layout**: Centered modal, `max-w-lg`.

```
┌──────────────────────────────────────────────────────────┐
│  Discharge Patient                                       │
│  ──────────────────────────────────────────              │
│  ⚠ This action is irreversible.                          │
│                                                          │
│  Patient:   Juan Cruz (#PT-00123)                        │
│  Room:      301-A · Maternity · Private                  │
│  Admitted:  Mar 20, 2026                                 │
│                                                          │
│  Actual Discharge Date & Time *                          │
│  {Mar 24, 2026}   {10:00 AM}                             │
│                                                          │
│  Post-Discharge Room Status *                            │
│  (●) Available — Ready for next patient                  │
│  (○) Maintenance — Room needs cleaning/servicing         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Confinement Summary                             │    │
│  │  Duration:   4 days                             │    │
│  │  Rate/day:   ₱2,500                             │    │
│  │  Total:      ₱10,000                            │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [ ] I confirm this discharge is final                   │
│                                                          │
│         (Cancel)   [Print Summary]   [Discharge]         │
└──────────────────────────────────────────────────────────┘
```

**Design Notes**:
- `[Discharge]` button: danger variant, disabled until checkbox is checked
- `[Print Summary]`: ghost/secondary button, opens print dialog
- Warning banner: amber with warning icon at top of modal

---

### Screen 14 — Confinement History

**Route**: `/history/patients/:patientId`
**Layout**: Full-width, with date filter row and timeline.

```
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  Confinement History — Juan Cruz (#PT-00123)             │
│            │  ← Back to Patient                                       │
│            │                                                          │
│            │  From {Jan 1, 2026} To {Mar 24, 2026}  Status ▼  [Apply]│
│            │                                          [Export CSV ↓]  │
│            │                                                          │
│            │ ┌───────────────────────────────────────────────────┐   │
│            │ │ Room   Admitted       Discharged     Days  Status  │   │
│            │ ├───────────────────────────────────────────────────┤   │
│            │ │ 301-A  Mar 20, 2026   —             7+   ● ACTIVE │   │
│            │ │ 205-B  Jan 10, 2026   Jan 15, 2026   5   ✓ DISCH  │   │
│            │ │ 108-C  Dec 1, 2025    Dec 3, 2025    2   ✓ DISCH  │   │
│            │ └───────────────────────────────────────────────────┘   │
│            │                                                          │
│            │  TIMELINE VIEW                                           │
│            │  ─────────────────────────────────────────────────────  │
│            │  Mar 2026  ●────────────────────────────────────────●   │
│            │            301-A (Active)                               │
│            │  Jan 2026  ●────●                                        │
│            │            205-B                                         │
│            │  Dec 2025  ●──●                                          │
│            │            108-C                                         │
└────────────┴──────────────────────────────────────────────────────────┘
```

---

### Screen 15 — Audit Log

**Route**: `/admin/audit-log`
**Layout**: Full-width table. Admin only.

```
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  Audit Log                              [Export CSV ↓]  │
│            │  All system actions — Admin only                         │
│            │                                                          │
│            │  From {date} To {date}  Actor ▼  Action ▼  Entity ▼    │
│            │                                                          │
│            │ ┌──────────────────────────────────────────────────┐    │
│            │ │ Timestamp         Actor      Action    Entity     │    │
│            │ ├──────────────────────────────────────────────────┤    │
│            │ │ Mar 24 · 10:30 AM Ana Reyes  ADMIT    Admission  │    │
│            │ │ Mar 24 · 09:15 AM Dr. Santos TRANSFER Admission  │    │
│            │ │ Mar 23 · 04:00 PM Ana Reyes  CREATE   Room       │    │
│            │ │ Mar 23 · 02:30 PM Admin      OVERRIDE Room       │    │
│            │ │ Mar 22 · 11:00 AM Ana Reyes  DISCHARGE Admission │    │
│            │ └──────────────────────────────────────────────────┘    │
│            │  (click any row to see full before/after detail)         │
│            │                                                          │
│            │  ← 1  2  3  4  5 →     20 per page ▼                   │
└────────────┴──────────────────────────────────────────────────────────┘
```

**Row Click — Detail Modal**:
```
┌──────────────────────────────────────────────────────┐
│  Audit Entry Detail                              [×] │
│  ──────────────────────────────────────────────────  │
│  Timestamp:  Mar 24, 2026 · 10:30 AM                 │
│  Actor:      Ana Reyes (Nurse)                       │
│  Action:     ADMIT                                   │
│  Entity:     Admission #ADM-00456                    │
│                                                      │
│  CHANGES                                             │
│  Before: { status: null }                            │
│  After:  { patientId: "PT-00123",                    │
│            roomId: "301-A", bedNumber: 1,            │
│            status: "Active",                         │
│            admissionDate: "2026-03-24T10:30:00Z" }   │
│                                                      │
│                                     [Close]          │
└──────────────────────────────────────────────────────┘
```

---

### Screen 16 — Reports

**Route**: `/reports`
**Layout**: Left report selector panel + right output area.

```
┌─ SIDEBAR ──┬─ MAIN CONTENT ──────────────────────────────────────────┐
│  (nav)     │                                                          │
│            │  Reports                                                 │
│            │                                                          │
│            ├────────────────┬─────────────────────────────────────── │
│            │ REPORT TYPE    │  Occupancy Rate Report                  │
│            │ ─────────────  │  ─────────────────────────────────     │
│            │ ● Occupancy    │                                         │
│            │   Rate         │  From {Mar 1, 2026} To {Mar 24, 2026}  │
│            │ ○ Avg Length   │  Ward ▼   [Generate Report]            │
│            │   of Stay      │                                         │
│            │ ○ Confinement  │  ┌─────────────────────────────────┐   │
│            │   Charges      │  │ Ward        Rooms  Occ%  Avg Days│   │
│            │ ○ Cot          │  │ Maternity     8    87%    4.2    │   │
│            │   Utilization  │  │ General       20   72%    3.8    │   │
│            │                │  │ ICU            4   95%    6.1    │   │
│            │                │  │ Private       10   60%    5.5    │   │
│            │                │  └─────────────────────────────────┘   │
│            │                │                                         │
│            │                │        (Export CSV)   [Export PDF]      │
└────────────┴────────────────┴─────────────────────────────────────────┘
```

---

### Screen 17 — Alert Drawer

**Triggered by**: Clicking the bell icon `🔔` in the topbar.
**Layout**: Right slide-out drawer, `w-96`, full viewport height.

```
                      ┌─────────────────────────────────┐
                      │  Alerts & Notifications     [×] │
                      │  ──────────────────────────────  │
                      │  3 unread  (Mark all as read)    │
                      │                                  │
                      │  ⚠ OVERSTAY                      │
                      │  Juan Cruz — Room 301-A           │
                      │  2 days past expected discharge  │
                      │  Mar 24, 2026 · 10:30 AM  [View] │
                      │  ──────────────────              │
                      │  ⚠ OVERSTAY                      │
                      │  Maria Lim — Room 205-B           │
                      │  1 day past expected discharge   │
                      │  Mar 24, 2026 · 08:00 AM  [View] │
                      │  ──────────────────              │
                      │  🔧 MAINTENANCE DUE               │
                      │  Room 105 — Overdue by 3 days    │
                      │  Mar 21, 2026 · 00:00 AM  [View] │
                      │  ──────────────────              │
                      │  ✓ DISCHARGE COMPLETED           │
                      │  Pedro Rey — Room 108-C           │
                      │  Mar 23, 2026 · 04:00 PM         │
                      │  ──────────────────              │
                      │                                  │
                      └─────────────────────────────────┘
```

**Design Notes**:
- Drawer slides in from right with overlay backdrop
- Alert types: `⚠` yellow (overstay, warning), `🔧` orange (maintenance), `✓` green (success), `ℹ` blue (info), `✕` red (error/conflict)
- Unread alerts have a subtle `#F8FAFC` left-border accent in their type color
- `[View]` links to the related record

---

## 8. Status Color System

Full reference for all status states used across Room Cards, Cot Cards, Badges, and Table Rows.

| Status | Pill BG | Pill Text | Card BG Tint | Border / Accent |
|--------|---------|-----------|--------------|-----------------|
| Available | `#DCFCE7` | `#16A34A` | `#F0FDF4` | `#16A34A` |
| Occupied | `#DBEAFE` | `#1D4ED8` | `#EFF6FF` | `#1D4ED8` |
| Pending Discharge | `#FEF9C3` | `#A16207` | `#FEFCE8` | `#CA8A04` |
| Reserved | `#F3E8FF` | `#7C3AED` | `#FAF5FF` | `#7C3AED` |
| Maintenance | `#F1F5F9` | `#64748B` | `#F8FAFC` | `#94A3B8` |
| Isolation | `#FEE2E2` | `#B91C1C` | `#FFF1F2` | `#DC2626` |
| NICU | `#CCFBF1` | `#0F766E` | `#F0FDFA` | `#0D9488` |
| Discharged | `#F1F5F9` | `#475569` | `#F8FAFC` | `#CBD5E1` |
| Transferred | `#EDE9FE` | `#5B21B6` | `#F5F3FF` | `#7C3AED` |

---

## 9. Icon System

Use **Lucide React** as the primary icon library (consistent with shadcn/ui).

| Icon | Lucide Name | Usage |
|------|-------------|-------|
| 🏥 Hospital | `Hospital` | App logo / brand |
| 🛏 Bed | `BedDouble` | Room module nav |
| 👶 Baby | `Baby` | Cot module nav |
| 📋 Clipboard | `ClipboardList` | Admissions nav |
| 🔔 Bell | `Bell` | Notification icon |
| ⚠ Warning | `AlertTriangle` | Overstay, warning alerts |
| 🔧 Wrench | `Wrench` | Maintenance status |
| ✓ Check | `CheckCircle2` | Success, discharged |
| → Transfer | `ArrowRightLeft` | Transfer action |
| 🚪 Exit | `LogOut` | Discharge action |
| 📊 Chart | `BarChart3` | Reports nav |
| 📜 Log | `ScrollText` | Audit log nav |
| 🔍 Search | `Search` | Search inputs |
| ✕ Close | `X` | Modal close, dismiss |
| ⋮ More | `MoreVertical` | Row actions menu |
| ← Back | `ChevronLeft` | Breadcrumb / back nav |
| ↓ Export | `Download` | CSV / PDF export |
| 🖨 Print | `Printer` | Print summary |
| + Add | `Plus` | Add / create actions |
| 🔒 Lock | `Shield` | Permissions, security |

---

## 10. Responsive Breakpoints

### Topbar
| Breakpoint | Behavior |
|------------|----------|
| `< lg` | Nav items hidden; hamburger `☰` button shown |
| `≥ lg` | Full nav items visible inline |

### Sidebar
| Breakpoint | Behavior |
|------------|----------|
| `< lg` | Hidden; opens as slide-out drawer triggered by hamburger |
| `≥ lg` | Fixed left sidebar, always visible, `w-64` |

### Dashboard Summary Cards
| Breakpoint | Columns |
|------------|---------|
| `< sm` | 2 columns |
| `sm–lg` | 3 columns |
| `≥ lg` | 5 columns |

### Room / Cot Grid
| Breakpoint | Columns |
|------------|---------|
| `< sm` | 2 columns |
| `sm` | 3 columns |
| `md` | 4 columns |
| `lg` | 5 columns |
| `≥ xl` | 6 columns |

### Form Layouts
| Breakpoint | Behavior |
|------------|----------|
| `< md` | All fields stack full-width, single column |
| `≥ md` | Paired fields (2-column grid) where applicable |

### Detail Pages (2-column)
| Breakpoint | Behavior |
|------------|----------|
| `< lg` | Stacked vertically (info above occupant panel) |
| `≥ lg` | Side by side: `3/5` left + `2/5` right |

### Modals
| Breakpoint | Behavior |
|------------|----------|
| `< sm` | Full screen modal (bottom sheet behavior) |
| `≥ sm` | Centered modal with max-width, dimmed overlay |

### Tables
| Breakpoint | Behavior |
|------------|----------|
| `< md` | Horizontal scroll; sticky first column (patient name / room number) |
| `≥ md` | Full table visible, no scroll |
