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

## 2. Strict Layering Rule

Always keep:

`UI -> Hook -> API -> Supabase`

- UI/entry/sections/components live in `public/` and `public/admin/`.
- Hooks live in `public/hooks/` and `public/admin/use*.js`.
- Supabase queries live only in `public/api/`.
- Supabase client creation is centralized in:
  - `public/services/supabaseClient.js`
  - `public/api/clientApi.js`

## 3. Exact Paths To Change By Feature Type

### A) New Admin feature (upload, moderation, status, client scope)

- Start in:
  - `public/admin/AdminApp.js`
- Then update matching hook(s):
  - `public/admin/useAdminAuth.js`
  - `public/admin/useAdminClientScope.js`
  - `public/admin/useAdminClientData.js`
  - `public/admin/useAdminUploads.js`
  - `public/admin/useAdminApprovals.js`
  - `public/admin/useAdminPosts.js`
  - `public/admin/useAdminLogos.js`
  - `public/admin/useAdminStatus.js`
- UI sections/components:
  - `public/admin/sections/AdminMainSection.js`
  - `public/admin/components/AdminStyles.js`
  - `public/admin/components/AdminHelpers.js`
- API changes:
  - `public/api/clientApi.js`
  - `public/api/postsApi.js`
  - `public/api/logoApi.js`
  - `public/api/approvalApi.js`

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
- API:
  - `public/api/postsApi.js`
  - `public/api/logoApi.js`
  - `public/api/clientApi.js`
  - `public/api/approvalApi.js`

### C) New Portal feature (client provisioning and portal management)

- Entry/UI:
  - `public/portal.js`
- API:
  - `public/api/clientApi.js`
  - `public/api/postsApi.js`

### D) New Supabase endpoint/query

- Add query function in one of:
  - `public/api/clientApi.js`
  - `public/api/postsApi.js`
  - `public/api/logoApi.js`
  - `public/api/approvalApi.js`
- Update consuming hook (never UI direct query):
  - `public/hooks/*` or `public/admin/use*.js`
- If schema changes are required:
  - Add additive SQL in `supabase/schema.sql` (no destructive edits)

### E) Styling/UI adjustments

- Shared app styles:
  - `public/core/styles/App.styles.js`
  - `public/core/animations.js`
- Admin styles:
  - `public/admin/components/AdminStyles.js`

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
- Keep layering: UI -> Hook -> API -> Supabase
- No direct Supabase calls in UI files
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
  rg -n "src/entry|src/pages|/src/" . --glob '!node_modules/**'
```

## 5. Post-Feature Definition of Done

- All changed files follow layer rule.
- No direct Supabase calls outside `public/api/`.
- Entry pages still load.
- Query changes are reflected in `supabase/schema.sql` if needed.
- `vercel.json` still routes correctly.

