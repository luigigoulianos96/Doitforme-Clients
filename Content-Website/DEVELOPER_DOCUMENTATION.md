# Developer Documentation

This document reflects the current production-facing architecture in the repository as of the active `public/` runtime.

## 1. System Overview

### Active applications
- Portal: `public/portal.html` + `public/portal.js`
- Admin: `public/admin.html` + `public/admin.js`
- Client Preview: `public/index.html` + `public/app.js`

### Runtime model
- Static HTML entrypoints load React apps directly in the browser.
- HTML files use import maps to load CDN-hosted packages (`react`, `react-dom`, `styled-components`, `@supabase/supabase-js`, `monica-alexandria`).
- App scripts are executed through Babel standalone (`type="text/babel"` with module semantics).
- Frontend runtime configuration is injected via `window.APP_CONFIG` from `public/config.js`.

### Routing surface
- Production routing is controlled by `vercel.json`.
- Local routing parity is handled by `server.js`.
- Main clean URLs:
  - `/` -> portal
  - `/portal` -> portal
  - `/admin` -> admin
  - `/index` -> client preview

## 2. Repository Responsibilities

### `public/`
Production runtime source of truth.

### `public/components/`
Preview-only presentational UI.
- Includes shared preview sections/cards/layout plus logo presentation components.

### `public/hooks/`
Preview-only data and state orchestration.
- `usePreviewData.js`: loads client records, published posts, logo-kit data, review mutations, and feedback uploads
- `usePreviewComputed.js`: derives grouped Instagram feed/story/grid view models and summary counters
- `useNotesHistory.js`: local note history persistence in `localStorage`

### `public/admin/`
Support modules used by the admin app.
- `public/admin/components/*`: tab panels and admin UI pieces
- `public/admin/hooks/*`: composer logic for Instagram, article, and logo-kit authoring

### `public/services/`
Cross-cutting runtime services.
- `supabaseClient.js`: cached Supabase browser client for preview flow
- `storageService.js`: browser client for presigned MinIO upload/delete endpoints
- `webPushService.js`: browser push subscription lifecycle
- `reviewPushService.js`: browser trigger for review notification fan-out

### `public/utils/`
Pure parsing/formatting helpers.
- `appHelpers.js`: query param parsing, title prefix parsing, Instagram metadata parsing, logo metadata helpers
- `logoPreviewHelpers.js`: logo-story parsing and structured preview helpers

### `api/`
Serverless handlers used in Vercel and mirrored by `server.js`.
- `api/storage/*`: MinIO-compatible presign/delete
- `api/push/*`: VAPID key, push subscription upsert, notification dispatch

### `supabase/`
SQL schema and policy assets.

### `_archive/`
Archived legacy code. Not part of runtime.

## 3. Flow Architecture

### Portal flow
Primary file: `public/portal.js`

Responsibilities:
- create local Supabase client from `window.APP_CONFIG`
- authenticate admins
- CRUD clients and client slugs
- manage portal-side content lists and review workflow shortcuts
- enable and sync browser push subscriptions for admins

Current shape:
- largely monolithic
- Styled Components definitions and data access live together

### Admin flow
Primary file: `public/admin.js`

Responsibilities:
- authenticate admins
- create local Supabase client
- orchestrate tabs for Instagram, articles, and logo kits
- upload/delete storage assets via `public/services/storageService.js`
- publish, update, reorder, and delete content rows

Supporting modules:
- `public/admin/hooks/useAdminInstagramComposer.js`
- `public/admin/hooks/useArticleAdmin.js`
- `public/admin/hooks/useLogoKitAdmin.js`

Notable behavior:
- Instagram supports singles, carousels, stories, and 9-grid uploads
- Articles support importing `.docx`, `.rtf`, `.html`, `.htm`, and plain text
- Logo kits support versioned proposals with structured story sections, media collections, colors, and font uploads

### Client preview flow
Primary file: `public/app.js`

Responsibilities:
- read `client`, `mode`, and `proposal` query params
- load published content for the requested client
- render mode-specific preview UI
- persist approval changes, notes, and optional feedback attachments
- trigger review notifications back to admins after client updates

Mode handling:
- `instagram`: grouped single/carousel/story/grid preview
- `article`: article preview and feedback flow
- `logo`: logo-kit presentation and proposal selection

## 4. Data Access And Runtime Contracts

### Browser-side data access
- Preview uses `createSupabaseClient()` from `public/services/supabaseClient.js`.
- Admin and portal each keep their own in-file Supabase factory wrappers.
- All three browser apps call Supabase directly from the client.

### Storage access
- Frontend uploads do not write directly to Supabase storage.
- `public/services/storageService.js` requests presigned URLs from:
  - `POST /api/storage/presign-upload`
  - `POST /api/storage/delete`
- Storage is currently MinIO/S3-compatible and configured via `MINIO_*` settings.

### Push notifications
- Browser subscription bootstrap lives in `public/services/webPushService.js`.
- Backend handlers:
  - `GET /api/push/vapid-public-key`
  - `POST /api/push/subscribe`
  - `POST /api/push/notify-review-event`
- Notification dispatch validates target records against the current client before fan-out.

### Query params
- `client=<slug>`: target client for preview
- `mode=instagram|article|logo`: preview mode
- `proposal=<n>`: 1-based logo proposal selector; defaults to `1`

### Content title prefixes
Used by runtime parsing and must remain stable:
- `[IG]`
- `[ARTICLE]`
- `[LOGO]`

### Approval statuses
Expected values across flows:
- `pending`
- `approved`
- `disapproved`

## 5. Data Model

### Defined in `supabase/schema.sql`
- `public.profiles`
- `public.posts`
- `public.clients`
- `public.web_push_subscriptions`
- `storage.buckets` + storage policies for `post-photos`

### Referenced by runtime code beyond the baseline schema file
- `logo_kits`
- `logo_assets`
- `logo_colors`
- `logo_story_steps`
- `logo_kit_feedback_assets`

This means the runtime already depends on logo-kit tables that are not yet documented in `supabase/schema.sql`. Treat schema updates there as additive, and avoid breaking existing table shapes used by admin/preview code.

## 6. State Strategy

- Local React hooks state (`useState`, `useEffect`, `useMemo`)
- No global state container
- Preview note history is kept client-side in `localStorage`
- Monolithic apps still mix view state, async mutations, and style definitions in the same file

## 7. Change Guidance

1. Treat `public/*` as the runtime codebase for user-facing behavior.
2. Do not edit `_archive/*` expecting production changes.
3. For preview changes, prefer the existing layering:
   - UI -> hook/helper -> Supabase
4. Keep `public/components/*` presentational; avoid Supabase calls there.
5. Keep `public/utils/*` side-effect free.
6. Preserve query params `client` and `mode`, title prefixes, and approval status values.
7. When adding public-facing paths, update `vercel.json` rewrites and keep `server.js` in sync if local parity matters.
8. When deleting records tied to files, preserve storage cleanup behavior.

## 8. Known Technical Debt

1. `public/admin.js` and `public/portal.js` are still large orchestration files.
2. Supabase client creation is inconsistent across flows.
3. There is no automated test or lint pipeline in `package.json`.
4. Root schema documentation is incomplete for the logo-kit feature set.
5. Frontend dependencies are runtime CDN imports plus Babel-in-browser, so failures can be caused by external CDN availability as well as local code.

## 9. Manual Smoke Test

1. Start `npm start`.
2. Open `http://localhost:4180/portal`.
3. Open `http://localhost:4180/admin`.
4. Open:
   - `http://localhost:4180/index?client=<slug>&mode=instagram`
   - `http://localhost:4180/index?client=<slug>&mode=article`
   - `http://localhost:4180/index?client=<slug>&mode=logo`
5. Validate:
   - admin authentication
   - one portal client read
   - one admin content read/write path
   - one preview approval update
   - one storage upload/delete if the change touched files
   - one push subscription flow if the change touched push code

## 10. Troubleshooting

### Page renders but data is missing
- Check `public/config.js` for valid `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Confirm the client slug exists in `public.clients`.

### Preview link opens the wrong content
- Check `client`, `mode`, and `proposal` query params.
- Confirm title prefixes still match runtime parsing rules.

### Uploads fail
- Check frontend `MINIO_*` values in `public/config.js`.
- Check backend `MINIO_*` env vars for the local server or Vercel functions.

### Push notifications do not arrive
- Check VAPID env vars.
- Confirm `public.web_push_subscriptions` contains active rows.
- Confirm the browser granted notification permissions and `/service-worker.js` still registers.

### A change has no effect
- Confirm the edit was made in `public/*`, `api/*`, `server.js`, `vercel.json`, or `supabase/*` rather than archived code.
