# Theme Consistency Audit (Phase 36)

This document serves as proof of the app-wide design system sweep across all frontend pages and components, ensuring strict adherence to the Phase 15/16 bus theme.

## 1. Global Tokens Enforced
- **Removed Default Tailwind Colors:** Eliminated `primary` (#0B3D91), `accent` (#FFC107), and `alert` (#E53935) from `tailwind.config.js`.
- **Replaced With Token Variables:**
  - `primary` → `transit-ink`
  - `accent` → `signal-amber`
  - `alert` → `alert-red`

## 2. Pages Audited & Upgraded

### `Complaints.jsx` (Feedback / Complaints Form)
- **Before:** Used generic `border-gray-300`, `text-primary`, standard HTML `select` styling, and basic `green-100` success banners.
- **After:** 
  - Main title updated to use `font-display` and `uppercase tracking-wide`.
  - Input fields and textareas replaced with `border-2 border-gray-200 focus:border-transit-ink` and `font-mono-data`.
  - Range slider accent color set to `signal-amber`.
  - Submit button restyled to match the `signal-amber text-ink uppercase` ticket-style aesthetic.
  - Success message reference ID block enhanced with `border-2 border-gray-200 shadow-inner` to look like a physical ticket stub.
  - Tracking status badges restyled: Open (`signal-amber`), In Review (`blue`), Resolved (`transit-green`), each using distinct backgrounds, texts, and borders.

### `AdminLogin.jsx` (Staff Login Panel)
- **Before:** Standard white card with default Tailwind shadow, `text-primary` heading, default blue focus rings on inputs.
- **After:**
  - Card given `border-2 border-transit-ink/10` to feel structural.
  - Inputs converted to `bg-white border-2 focus:border-transit-ink font-mono-data` to feel more like a terminal/admin interface.
  - Submit button updated to the `signal-amber` warning-style button.
  - Error banner converted to `alert-red` with a left border block.

### `ForgotPassword.jsx` & `ResetPassword.jsx` (Auth Flows)
- **Before:** Identical generic styling to the Admin Login page.
- **After:**
  - Applied the exact same structural card treatments, `font-display` headers, and `font-mono-data` inputs.
  - Success messages styled with `transit-green` background/borders instead of generic `green-50`.
  - Action buttons changed to the universal `signal-amber` submit style.

### `Home.jsx` (Main Landing)
- **Before:** `AutocompleteInput` used `focus:ring-primary focus:border-primary`.
- **After:** `AutocompleteInput` updated to use `border-2 focus:border-transit-ink font-mono-data` to match the rest of the inputs in the application.

### `Track.jsx` (Live Map)
- **Before:** Status badges used `bg-green-100 border-green-200 text-transit-green`. Polyline used hardcoded `#0B3D91`.
- **After:** 
  - Status badge uses `bg-transit-green/20 border-transit-green/30 text-transit-green`.
  - Map Polyline uses `var(--transit-ink)`.
  - Verified it correctly loads `<BusOnRibbon />` instead of a text spinner.

## 3. UI Components Overhauled

### `Layout.jsx` (Global App Shell)
- **Before:** Header used `bg-primary` with `text-accent` for the icon. Footer was `bg-gray-100 text-gray-500`.
- **After:** 
  - Main wrapper sets `bg-paper font-body text-ink` globally.
  - Header uses `bg-transit-ink` with a bold `border-b-4 border-signal-amber` stripe to anchor the app visually.
  - Brand name changed to `font-display uppercase tracking-widest`.
  - Footer converted to `bg-transit-ink text-gray-400 font-mono-data` to look like a terminal/system readout.

### `Button.jsx`, `Input.jsx`, `Badge.jsx` (Core Primitives)
- **Before:** Defined variants based on the old `primary`/`accent`/`alert` tokens.
- **After:** All variants mapped to `transit-ink`, `signal-amber`, `alert-red`, and `transit-green`. `Input.jsx` default styling updated to the new `border-2 focus:border-transit-ink font-mono-data` standard.

## 4. Universal Loading States
- Verified that `SearchResults.jsx` and `Track.jsx` correctly render the `<BusOnRibbon color="var(--transit-ink)" />` component during asynchronous data fetching instead of unstyled spinners or raw text.

---
**Audit Result:** The app now strictly adheres to the transit design system. There are no remaining instances of the default blue/yellow generic classes for core structural elements.
