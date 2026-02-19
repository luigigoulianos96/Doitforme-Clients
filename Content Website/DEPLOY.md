# Gym Way - Free Live Setup (Vercel + Supabase)

## 1. Supabase project
1. Create free project at https://supabase.com
2. Open SQL Editor and run `/supabase/schema.sql`.
3. Authentication -> Users -> Create user (your admin email/password).
4. SQL: make user admin (replace email):

```sql
insert into public.profiles (id, email, is_admin)
select id, email, true
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (id) do update set is_admin = true;
```

5. Project Settings -> API:
- copy `Project URL`
- copy `anon public` key

## 2. Local config
1. Copy `/public/config.example.js` to `/public/config.js`
2. Fill `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## 3. Local run
```bash
cd "/Users/luigigoulianos/Projects/Clients/Content Website"
PORT=4180 node server.js
```
- Public: `http://localhost:4180/index.html`
- Admin: `http://localhost:4180/admin.html`

## 4. Deploy free on Vercel
1. Push repo to GitHub.
2. Import project in Vercel (Hobby free).
3. Build settings:
- Framework: Other
- Root: repository root
- Output: `public`

## 5. Set live config on Vercel
Because this app is static, update `public/config.js` with real Supabase values before deploy.
Never use service role key in frontend.

## 6. Usage flow
1. Open `/admin.html`
2. Sign in with admin account
3. Upload images + `captions.txt`
4. Posts publish instantly
5. Share `/index.html` with client

## captions.txt format
- Preferred: one caption per paragraph (blank line between captions)
- Alternative: one caption per line

