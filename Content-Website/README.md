# Content Website

Browser-first content approval system with three runtime flows:
- portal for client management and preview-link distribution
- admin for content creation, publishing, and review follow-up
- client preview for Instagram, article, and logo-kit approvals

The active runtime lives in `public/`. Archived code is not part of production behavior.

## Runtime Entry Points
- `public/portal.html` -> `public/portal.js`
- `public/admin.html` -> `public/admin.js`
- `public/index.html` -> `public/app.js`

`vercel.json` rewrites expose the same pages at `/`, `/portal`, `/admin`, and `/index`.

## What The App Does
- Authenticated staff use the portal to manage clients and open workflow links.
- Authenticated staff use the admin app to create and publish:
  - Instagram posts, carousels, stories, and 9-grid assets
  - article drafts, including `.docx`, `.rtf`, `.html`, and plain-text imports
  - logo-kit proposals with structured assets, colors, story sections, and versioning
- Clients open preview links and submit approvals, notes, and optional feedback attachments.
- Admin users can opt into web push notifications for new review activity.

## Architecture

### Frontend runtime
- Static HTML entrypoints with Babel-in-browser module loading.
- React, React DOM, Styled Components, Supabase JS, and related packages are loaded via CDN import maps in the HTML files.
- `public/config.js` injects runtime configuration through `window.APP_CONFIG`.

### Frontend structure
- `public/app.js`: modular preview shell
- `public/components/`: presentational preview UI
- `public/hooks/`: preview data fetching, mutations, and derived state
- `public/core/`: preview-only shared styles and animations
- `public/services/`: runtime services for Supabase, MinIO-backed uploads, and review push notifications
- `public/utils/`: pure helper logic for parsing and classification
- `public/admin.js`: main admin runtime, supported by `public/admin/components/*` and `public/admin/hooks/*`
- `public/portal.js`: portal runtime with in-file styling and data orchestration

### Backend-adjacent runtime
- `server.js`: local development server for static files plus API parity for storage and push routes
- `api/storage/*.js`: presigned upload and delete endpoints for MinIO/S3-compatible storage
- `api/push/*.js`: VAPID key delivery, push subscription upsert, and review-event notification fan-out
- `supabase/schema.sql`: additive baseline schema and RLS policies

## Data Model Highlights
- `public.posts`: Instagram and article content records
- `public.clients`: client directory and preview slug source
- `public.profiles`: admin flag per authenticated user
- `public.web_push_subscriptions`: stored browser push subscriptions
- Preview and admin flows also reference logo-kit tables already used by runtime code:
  - `logo_kits`
  - `logo_assets`
  - `logo_colors`
  - `logo_story_steps`
  - `logo_kit_feedback_assets`

Critical runtime contracts:
- Query params:
  - `client`
  - `mode=instagram|article|logo`
  - `proposal` for selecting logo proposal version in preview
- Content title prefixes:
  - `[IG]`
  - `[ARTICLE]`
  - `[LOGO]`
- Approval statuses:
  - `pending`
  - `approved`
  - `disapproved`

## Configuration

### Frontend (`public/config.js`)
Create `public/config.js` from `public/config.example.js` and set:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STORAGE_BUCKET`
- `MINIO_BASE_URL`
- `MINIO_BUCKET`
- `MINIO_UPLOAD_ENDPOINT`
- `MINIO_DELETE_ENDPOINT`

### Server / API (`.env`)
Local server scripts and Vercel functions use `.env` values matching `.env.example`:
- `MINIO_HOST`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_REGION`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WEB_PUSH_VAPID_PUBLIC_KEY`
- `WEB_PUSH_VAPID_PRIVATE_KEY`
- `WEB_PUSH_SUBJECT`

## Local Development
```bash
npm start
```

Default local URLs:
- `http://localhost:4180/`
- `http://localhost:4180/portal`
- `http://localhost:4180/admin`
- `http://localhost:4180/index?client=<slug>&mode=instagram`

The local server also exposes:
- `POST /api/storage/presign-upload`
- `POST /api/storage/delete`
- `GET /api/push/vapid-public-key`
- `POST /api/push/subscribe`
- `POST /api/push/notify-review-event`

## Key File Map
- Preview bootstrap: `public/app.js`
- Preview data and review mutations: `public/hooks/usePreviewData.js`
- Preview derivations: `public/hooks/usePreviewComputed.js`
- Preview local note history: `public/hooks/useNotesHistory.js`
- Shared preview Supabase client: `public/services/supabaseClient.js`
- MinIO upload/delete client: `public/services/storageService.js`
- Browser push subscription helpers: `public/services/webPushService.js`
- Review notification trigger client: `public/services/reviewPushService.js`
- Admin bootstrap: `public/admin.js`
- Portal bootstrap: `public/portal.js`
- Local dev server: `server.js`
- Deployment rewrites: `vercel.json`
- Database schema baseline: `supabase/schema.sql`

## Manual Validation Checklist
1. Start the local server with `npm start`.
2. Open `/portal` and verify login plus client list load.
3. Open `/admin` and verify login plus one content tab load.
4. Open `/index?client=<slug>&mode=instagram`.
5. Open `/index?client=<slug>&mode=article`.
6. Open `/index?client=<slug>&mode=logo`.
7. Confirm storage upload/delete works if the touched change affects files.
8. Confirm review updates persist expected approval status and notes.
9. Confirm push notification subscription still succeeds if push-related code changed.

## Known Constraints
- `public/` is the production runtime source of truth.
- `public/admin.js` and `public/portal.js` still own local Supabase client wrappers.
- There is no automated test suite or lint script in `package.json`.
- `supabase/schema.sql` is a baseline, but runtime code also depends on logo-kit tables not defined in that file yet.
