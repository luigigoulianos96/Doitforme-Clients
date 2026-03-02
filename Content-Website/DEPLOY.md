# Deployment Guide

This project deploys as a static frontend plus serverless API routes, backed by Supabase and MinIO-compatible object storage.

## 1. Services Required

### Supabase
Used for:
- browser auth
- `clients`, `posts`, `profiles`, and push subscription data
- any additional logo-kit tables already used by runtime code

### MinIO or S3-compatible storage
Used for:
- admin uploads
- client feedback attachments
- presigned upload/delete flows served from `/api/storage/*`

### Web Push credentials
Used for:
- admin review notifications via `/api/push/*`

## 2. Supabase Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create at least one authenticated admin user in Supabase Auth.
4. Ensure that user has a matching `public.profiles` row with `is_admin = true`.
5. Copy:
   - Project URL
   - anon key
   - service role key

Important:
- `supabase/schema.sql` covers the baseline tables and policies.
- The runtime also references logo-kit tables (`logo_kits`, `logo_assets`, `logo_colors`, `logo_story_steps`, `logo_kit_feedback_assets`), so production must already include those tables as well.

## 3. Frontend Runtime Config
Create `public/config.js` from `public/config.example.js`.

Set:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STORAGE_BUCKET`
- `MINIO_BASE_URL`
- `MINIO_BUCKET`
- `MINIO_UPLOAD_ENDPOINT`
- `MINIO_DELETE_ENDPOINT`

Recommended defaults:
- `MINIO_UPLOAD_ENDPOINT`: `/api/storage/presign-upload`
- `MINIO_DELETE_ENDPOINT`: `/api/storage/delete`

Never put `SUPABASE_SERVICE_ROLE_KEY` in `public/config.js`.

## 4. Server / Function Environment Variables
Set the following in local `.env` and in Vercel Project Environment Variables:
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

Optional migration-script variables from `.env.example`:
- `SUPABASE_STORAGE_BUCKET`
- `MIGRATION_CONCURRENCY`
- `MIGRATION_SKIP_EXISTING`
- `MIGRATION_DRY_RUN`

## 5. Local Development Run
```bash
cd "/Users/luigigoulianos/Projects/Clients/Doitforme-Clients/Content-Website"
npm start
```

Local routes:
- `http://localhost:4180/`
- `http://localhost:4180/portal`
- `http://localhost:4180/admin`
- `http://localhost:4180/index`

Direct public paths also work:
- `http://localhost:4180/public/portal.html`
- `http://localhost:4180/public/admin.html`
- `http://localhost:4180/public/index.html`

Local API parity endpoints:
- `POST http://localhost:4180/api/storage/presign-upload`
- `POST http://localhost:4180/api/storage/delete`
- `GET http://localhost:4180/api/push/vapid-public-key`
- `POST http://localhost:4180/api/push/subscribe`
- `POST http://localhost:4180/api/push/notify-review-event`

## 6. Vercel Deployment
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set framework preset to `Other`.
4. Leave build command empty.
5. Leave output directory empty.
6. Add all environment variables listed above.
7. Deploy with `vercel.json` included at the repository root.

Notes:
- `vercel.json` rewrites clean URLs to the `public/` runtime.
- `api/*` files are deployed as Vercel Functions.
- No bundling step is required for the current setup.

## 7. Post-Deploy Validation
1. Open `/portal` and log in as an admin.
2. Verify client records load.
3. Open `/admin` and verify at least one content tab loads.
4. Upload one file and confirm storage succeeds.
5. Open a preview URL:
   - `/index?client=<slug>&mode=instagram`
6. Submit one approval or note change.
7. If push notifications are enabled, subscribe once from an admin browser and verify review events can be dispatched.
8. Open:
   - `/index?client=<slug>&mode=article`
   - `/index?client=<slug>&mode=logo`

## 8. Common Production Issues

### 401/403 from Supabase
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `public/config.js`.
- Check RLS policies and that the user has an admin profile when using portal/admin.

### Upload endpoints fail
- Check `MINIO_*` environment variables in Vercel.
- Check `MINIO_UPLOAD_ENDPOINT` and `MINIO_DELETE_ENDPOINT` in `public/config.js`.

### Push notifications fail
- Check VAPID environment variables.
- Check `SUPABASE_SERVICE_ROLE_KEY`.
- Check that `/api/push/*` rewrites and functions are deployed.

### Route opens a 404 or wrong page
- Check `vercel.json` rewrites.
- Confirm the runtime files still exist under `public/`.

### Preview page is empty
- Check `client` query param matches `clients.slug`.
- Check published records exist for that client in the selected mode.
- For logo mode, confirm the logo-kit tables contain published rows.
