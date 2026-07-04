---
name: supabase-setup
description: Checklist + helpers for the Supabase auth/data layer — applying the migration, enabling Google login, and becoming admin. Use when setting up Supabase, debugging login (redirect_uri_mismatch), or after changing the DB schema.
---

# Supabase setup

Stack: `@nuxtjs/supabase`, Google OAuth, RLS. Client keys are `CRMA_`-prefixed env (in gitignored `.env` locally; Vercel has them from the integration). Schema lives in `supabase/migrations/`.

## One-time setup (dashboards — no code)

1. **Apply the schema** — the project is linked to the Supabase CLI. From the repo:
   ```bash
   SUPABASE_DB_PASSWORD='<db-password>' supabase db push   # applies supabase/migrations/*
   ```
   (Requires `supabase login` once. Alternatively paste a migration file into Supabase → SQL Editor → Run — migrations are idempotent.)
2. **Google OAuth**:
   - Google Cloud Console → APIs & Services → Credentials → create **OAuth client ID → Web application**.
   - **Authorized redirect URIs** (exact, no trailing slash): `https://<project-ref>.supabase.co/auth/v1/callback`
   - Copy the **Client ID + Secret** → Supabase → Auth → Providers → **Google** → enable + paste.
3. **App redirect URLs**: Supabase → Auth → URL Configuration:
   - **Site URL**: `https://crmanalytics.imswarnil.com`
   - **Redirect URLs**: `http://localhost:3000/**` and `https://crmanalytics.imswarnil.com/**`
4. **Become admin** (after signing in once):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'swarnilsinghaicse@gmail.com');
   ```

## Debugging

- **`Error 400: redirect_uri_mismatch`** → the Supabase callback URL isn't in the Google client's *Authorized redirect URIs* (or it's in "JavaScript origins" by mistake, or you edited a different client). Add the exact `.../auth/v1/callback` URL and wait ~2–5 min.
- **Login succeeds but redirects home** → the `redirectTo` (`.../confirm`) isn't in Supabase's Redirect URLs.
- **Empty data / RLS errors** → the migration hasn't been applied, or the row's RLS policy blocks it.

## Changing the schema

Add a new timestamped file in `supabase/migrations/` (e.g. `supabase migration new <name>`) **and** keep `types/database.types.ts` in sync (the client is typed from it via `useDb()`), then `supabase db push`. Note: put `set check_function_bodies = off;` at the top if a function forward-references a table created later. Server admin ops use `requireAdmin(event)` from `server/utils/auth.ts` (service role).
