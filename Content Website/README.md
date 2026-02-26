# Content Website - Maintenance & Feature Template

This project runs from `public/*.html` + `public/*.js` entrypoints in production.

Use this file as the always-on template before starting any feature in Codex.

## 1. Runtime Truth (Do Not Break)

- Entry HTML files:
  - `public/portal.html`
  - `public/admin.html`
  - `public/index.html`
- Entry JS files:
  - `public/portal.js`
  - `public/admin.js`
  - `public/app.js`
- Routing/deploy config:
  - `vercel.json`
- Supabase schema source:
  - `supabase/schema.sql`
- Archived legacy (non-runtime):
  - `_archive/src-legacy-2026-02-26/`

## 2. Strict Layering Rule

Always keep:

`UI -> Hook/Helper -> Supabase`

- Runtime code lives in `public/`.
- Preview flow (`public/app.js`) uses hooks in `public/hooks/`.
- Supabase client helper exists at `public/services/supabaseClient.js` (used by preview hooks).
- Admin and portal flows currently keep Supabase queries directly in:
  - `public/admin.js`
  - `public/portal.js`

## 3. Exact Paths To Change By Feature Type

### A) New Admin feature (upload, moderation, status, client scope)

- Start and implement in:
  - `public/admin.js`
- Shared helpers already used by preview are in:
  - `public/utils/appHelpers.js`
  - `public/services/supabaseClient.js` (if/when admin is migrated to shared client factory)

### B) New Client Preview feature (public/index.html flow)

- Entry/UI orchestrator:
  - `public/app.js`
- Data hooks:
  - `public/hooks/usePreviewData.js`
  - `public/hooks/usePreviewComputed.js`
  - `public/hooks/useNotesHistory.js`
- Shared UI:
  - `public/components/layout/AppPageLayout.js`
  - `public/components/sections/*.js`
  - `public/components/cards/PostCard.js`
  - `public/components/logo/LogoKitPresentation.js`
- Helpers:
  - `public/utils/appHelpers.js`

### C) New Portal feature (client provisioning and portal management)

- Entry/UI:
  - `public/portal.js`

### D) New Supabase endpoint/query

- Preview query changes:
  - `public/hooks/usePreviewData.js`
- Admin query changes:
  - `public/admin.js`
- Portal query changes:
  - `public/portal.js`
- If schema changes are required:
  - Add additive SQL in `supabase/schema.sql` (no destructive edits)

### E) Styling/UI adjustments

- Shared app styles:
  - `public/core/styles/App.styles.js`
  - `public/core/animations.js`
- Admin styles:
  - `public/admin.js` (styled-components live in-file)

### F) Deployment/routing issues

- First check:
  - `vercel.json`
- Confirm public entrypoints still exist:
  - `public/portal.html`
  - `public/admin.html`
  - `public/index.html`

## 4. Always-Use Codex Prompt Template (Copy/Paste)

Use this exact structure for every feature request:

```md
Feature: <short feature name>

Goal:
- <what user should be able to do>

Runtime constraints (must keep):
- Keep HTML entrypoints intact: public/portal.html, public/admin.html, public/index.html
- Keep layering: UI -> Hook/Helper -> Supabase
- Preserve existing response/error shapes unless explicitly changing contract

Files to inspect first:
- <absolute path 1>
- <absolute path 2>
- <absolute path 3>

Files expected to change:
- <absolute path A>
- <absolute path B>
- <absolute path C>

Implementation steps:
1. Update UI surface in <path>
2. Add/change hook logic in <path>
3. Add/change API function in <path>
4. Wire into existing flow without renaming runtime-critical exports

Validation checklist:
- Smoke test: /portal.html, /admin.html, /index.html
- Console has no runtime errors
- Network requests succeed with expected payload shape
- Final grep guard:
  rg -n "from '/src|/src/" public server.js vercel.json
```

## 5. Post-Feature Definition of Done

- All changed files follow layer rule.
- Entry pages still load.
- Query changes are reflected in `supabase/schema.sql` if needed.
- `vercel.json` still routes correctly.
