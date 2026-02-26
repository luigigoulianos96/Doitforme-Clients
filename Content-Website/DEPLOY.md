# Deployment Guide (Vercel + Supabase)

## 1. Supabase Setup
1. Create a project at https://supabase.com
2. Run `supabase/schema.sql` in SQL Editor.
3. Create admin user from Authentication -> Users.
4. From Project Settings -> API copy:
   - Project URL
   - anon public key

## 2. Frontend Config
1. Copy `public/config.example.js` to `public/config.js`
2. Set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - optional `STORAGE_BUCKET`

Never use service role keys in frontend config.

## 3. Local Run
```bash
cd "/Users/luigigoulianos/Projects/Clients/Doitforme-Clients/Content Website"
npm start
```

Local URLs:
- `http://localhost:4180/public/portal.html`
- `http://localhost:4180/public/admin.html`
- `http://localhost:4180/public/index.html`

## 4. Vercel Deploy
1. Push repository to GitHub.
2. Import project in Vercel.
3. Build settings:
   - Framework: `Other`
   - Build command: none
   - Output directory: none (serve static files directly)
4. Ensure `vercel.json` is included in deploy.

## 5. Post-Deploy Validation
1. Open `/portal` (or `/public/portal.html`).
2. Login with admin account.
3. Create/select client.
4. Open admin and upload one media item.
5. Open preview link with query params:
   - `/index?client=<slug>&mode=instagram`
6. Confirm data load and one review action update.

## 6. Common Production Issues

### 401/403 from Supabase
- Check anon key in `public/config.js`.
- Check RLS policies and authenticated session.

### Missing files or broken routes
- Check `vercel.json` rewrites.
- Check runtime files exist in `public/`.

### Preview page empty
- Check `client` query param matches existing `clients.slug`.
- Check expected `posts` rows for that client.
