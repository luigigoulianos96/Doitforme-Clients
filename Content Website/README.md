# Content Website

Current runtime is static multi-entry from `public/`.

## Runtime Entry Points
- `public/portal.html` -> `public/portal.js`
- `public/admin.html` -> `public/admin.js`
- `public/index.html` -> `public/app.js`

## Runtime Truth
- Deployed behavior comes from `public/*` only.
- There is no active `src/` runtime path.
- Routing is controlled by `vercel.json` rewrites.
- Local static server is `server.js`.
- Database schema source is `supabase/schema.sql`.

## Current Architecture
- Preview app (`public/app.js`) is modular:
  - hooks: `public/hooks/*`
  - UI components: `public/components/*`
  - styles: `public/core/*`
  - helpers: `public/utils/appHelpers.js`
  - supabase client helper: `public/services/supabaseClient.js`
- Admin and Portal remain monolithic:
  - `public/admin.js`
  - `public/portal.js`

## Change Map
### Preview feature
- Start from `public/app.js`
- Data/mutations: `public/hooks/usePreviewData.js`
- Derived view model: `public/hooks/usePreviewComputed.js`
- Notes history: `public/hooks/useNotesHistory.js`

### Admin feature
- Implement in `public/admin.js`

### Portal feature
- Implement in `public/portal.js`

### Styling
- Shared preview styles: `public/core/styles/App.styles.js`, `public/core/animations.js`
- Admin/portal styles are defined in-file.

### Supabase changes
- Update table queries where used:
  - preview: `public/hooks/usePreviewData.js`
  - admin: `public/admin.js`
  - portal: `public/portal.js`
- Keep schema changes additive in `supabase/schema.sql`.

## Manual Validation Checklist
1. Open `/public/portal.html`
2. Open `/public/admin.html`
3. Open `/public/index.html?client=<slug>&mode=instagram`
4. Open `/public/index.html?client=<slug>&mode=article`
5. Open `/public/index.html?client=<slug>&mode=logo`
6. Confirm no console errors
7. Confirm Supabase reads/writes expected payloads

## Guard Checks
- Ensure no stale `src` imports in runtime:
  - `rg -n "from '/src|/src/" public server.js vercel.json`
- Ensure runtime entry files still exist:
  - `public/portal.html`
  - `public/admin.html`
  - `public/index.html`
  - `public/portal.js`
  - `public/admin.js`
  - `public/app.js`
