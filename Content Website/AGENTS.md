# AGENTS.md

## 1. Runtime Truth (Critical)

- Production/runtime entrypoints are:
  - `public/portal.html` -> `public/portal.js`
  - `public/admin.html` -> `public/admin.js`
  - `public/index.html` -> `public/app.js`
- `public/` is the active runtime codebase.
- `_archive/src-legacy-2026-02-26/` is archived legacy code and non-runtime.
- Do not edit archived files expecting runtime behavior changes.

---

## 2. Current Architecture

- Preview flow (`index.html`) is modular:
  - UI components in `public/components/`
  - Hooks in `public/hooks/`
  - Helpers in `public/utils/`
  - Shared styles in `public/core/`
- Admin and portal flows are currently monolithic:
  - `public/admin.js`
  - `public/portal.js`

Layering target for new work:

`UI -> Hook/Helper -> Supabase`

---

## 3. Folder Rules

### `public/components/`
- Keep presentational components only.
- No Supabase queries here.

### `public/hooks/`
- Keep preview data fetching, mutations, and derived data here.
- No styled layout definitions unless unavoidable.

### `public/services/`
- Keep Supabase client setup helpers here.
- Prefer `public/services/supabaseClient.js` for shared client creation.

### `public/utils/`
- Pure helper functions only (parsing/formatting/classification).
- No network/storage side effects.

### `supabase/`
- Schema and DB policy SQL only.
- Keep changes additive and migration-safe.

---

## 4. Naming & Style Conventions

- Components: `PascalCase`.
- Hooks: `useSomething`.
- Utilities: descriptive `camelCase` function names.
- Keep naming consistent with existing files in `public/`.
- Prefer explicit, readable logic over clever compact expressions.

---

## 5. Supabase Rules

- Runtime config comes from `window.APP_CONFIG` in `public/config.js`.
- Shared preview client factory exists in:
  - `public/services/supabaseClient.js`
- Current legacy exception:
  - `public/admin.js` and `public/portal.js` still contain local client factory wrappers.
- For new modular code, avoid introducing additional Supabase client factories.

---

## 6. Safe Change Practices

- Always preserve behavior of:
  - query params `client` and `mode`
  - title prefixes `[IG]`, `[ARTICLE]`, `[LOGO]`
  - approval statuses `pending`, `approved`, `disapproved`
- Keep route rewrites aligned in `vercel.json` when adding new public paths.
- Smoke test these pages after changes:
  - `/public/portal.html`
  - `/public/admin.html`
  - `/public/index.html`

---

## 7. Common Mistakes To Avoid

- Editing `_archive/*` expecting production impact.
- Adding data-fetch logic inside render-only section components.
- Changing Supabase selected field shapes without updating consumers.
- Forgetting storage cleanup when deleting rows with file paths.
