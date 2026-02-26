# Developer Documentation

This document describes the current production architecture.

## 1. System Overview

### Applications
- Portal: `public/portal.html` + `public/portal.js`
- Admin: `public/admin.html` + `public/admin.js`
- Client Preview: `public/index.html` + `public/app.js`

### Runtime model
- Static HTML entrypoints with Babel module scripts.
- Import map loads React ecosystem from CDN.
- Supabase is called directly from browser runtime.

### Routing
- Defined in `vercel.json` rewrites.
- Key query params:
  - `client=<slug>`
  - `mode=instagram|article|logo`

## 2. Folder Responsibilities

### `public/`
Runtime source of truth.

### `public/components/`
Preview UI components.

### `public/hooks/`
Preview data loading, mutations, and derivations.

### `public/core/`
Shared preview style system and animations.

### `public/services/`
Cross-feature runtime services.
- `public/services/supabaseClient.js` creates/caches Supabase client for preview flow.

### `public/utils/`
Pure helper utilities.

### `supabase/`
Schema and SQL assets.

## 3. Data Access Patterns

### Preview flow
- Uses `createSupabaseClient()` from `public/services/supabaseClient.js`.
- Main data module: `public/hooks/usePreviewData.js`.
- Derived grouping/counts: `public/hooks/usePreviewComputed.js`.

### Admin flow
- Supabase client and table/storage logic live in `public/admin.js`.
- Includes auth, upload, publish, update, and delete operations.

### Portal flow
- Supabase client and data logic live in `public/portal.js`.
- Includes auth, clients CRUD, and review polling.

## 4. State Strategy

- Local state with React hooks (`useState`, `useEffect`, `useMemo`).
- No global store (no Redux/Zustand/Context state layer).
- Local note history persists in `localStorage` via `public/hooks/useNotesHistory.js`.

## 5. Critical Runtime Contracts

### Query params
- `client`: selected client slug.
- `mode`: preview mode (`instagram`, `article`, `logo`).

### Content prefixes
Used in title parsing logic:
- `[IG]`
- `[ARTICLE]`
- `[LOGO]`

### Approval statuses
Expected values:
- `pending`
- `approved`
- `disapproved`

### Runtime config
Loaded from `public/config.js` via `window.APP_CONFIG`.

## 6. Known Technical Debt

1. `public/admin.js` is monolithic.
2. `public/portal.js` is monolithic.
3. Supabase client creation pattern is inconsistent:
   - preview uses shared service
   - admin/portal define local factory wrappers
4. No automated tests/lint scripts in `package.json`.

## 7. Development Rules

1. Treat `public/*` as the only runtime codebase.
2. Keep preview data logic in hooks, not section components.
3. Preserve existing response shapes unless intentionally changed end-to-end.
4. Keep `vercel.json` rewrites aligned when adding new root-accessed paths.
5. Keep schema updates additive in `supabase/schema.sql`.
6. Always smoke test all three entrypoints after changes.

## 8. Manual Smoke Test

1. Start app: `npm start`
2. Open:
   - `http://localhost:4180/public/portal.html`
   - `http://localhost:4180/public/admin.html`
   - `http://localhost:4180/public/index.html?client=<slug>&mode=instagram`
3. Validate:
   - login flow
   - one read query
   - one write query
   - one storage upload/delete (if touched)

## 9. Fast Troubleshooting

### Problem: page opens but no data
- Verify `public/config.js` exists and has valid `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### Problem: preview link broken
- Verify `client` and `mode` query params.
- Verify links generated from `admin.js`/`portal.js` were not altered.

### Problem: route not found on deploy
- Check `vercel.json` rewrites first.

### Problem: behavior change not taking effect
- Confirm edit was made in `public/*` runtime files.
