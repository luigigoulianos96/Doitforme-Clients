# Gym Way - Free Live Setup (Vercel + Supabase)

## 1. Supabase project
1. Create a free project at https://supabase.com
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
cd "/Users/luigigoulianos/Projects/Clients/Doitforme-Clients/Content Website"
npm start
```
- Public: `http://localhost:4180/public/index.html`
- Admin: `http://localhost:4180/public/admin.html`

## 4. Deploy free on Vercel
1. Push repo to GitHub.
2. Import project in Vercel (Hobby free).
3. Build settings:
- Framework: Other
- Root: repository root
- Build command: none
- Output: none (static files served as-is)

## 5. Set live config on Vercel
Because this app is frontend static + Supabase API calls, update `public/config.js` with real Supabase values before deploy.
Never use service role key in frontend.

## 6. Usage flow
1. Open `/public/portal.html`
2. Sign in with admin account
3. `Add client feed` for each client
4. Open client Admin from portal and upload images/videos + captions
5. Share each client preview link from portal (unique `?client=...`)

## 7. Multi-client migration note
If this project was already running with old schema, run `/supabase/schema.sql` again.
It now adds `clients` table and `posts.client_id` to support unlimited client feeds.
