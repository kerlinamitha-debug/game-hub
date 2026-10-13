# Game Hub Admin Setup

The admin dashboard is at `/admin.html`. GitHub Pages only hosts the static files; Supabase provides sign-in, database storage, and access control.

## 1. Create a Supabase project
1. Open https://supabase.com/ and create a project.
2. In Project Settings / API, copy the Project URL and the anon/publishable key. Never use the `service_role` key in website code.
3. Open SQL Editor and run the contents of `supabase_setup.sql`, replacing every `owner@example.com` with the exact email address you will use as the sole admin.

## 2. Create the one admin account
1. In Supabase Dashboard, open Authentication > Users.
2. Add a user using your admin email and set a strong password. Disable public sign-ups in Authentication settings if that setting is available.
3. Use this same email in the `ADMIN_EMAIL` setting in `admin.js`.

## 3. Configure admin.js
Replace:
- `PASTE_SUPABASE_PROJECT_URL_HERE` with the Supabase Project URL.
- `PASTE_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE` with the anon/publishable key.
- `PASTE_YOUR_ADMIN_EMAIL_HERE` with your admin email.

The URL and anon/publishable key are intended for browser use. Database permissions are enforced by Row Level Security policies in Supabase, not by hiding the admin page.

## 4. Manage games
Visit `https://kerlinamitha-debug.github.io/game-hub/admin.html`, sign in, and add/edit/delete entries. For downloads, use links to files you have the rights to distribute. The public catalog connection is the next integration step after these settings are filled in.

## Security notes
- Do not commit your GitHub password, Supabase database password, or Supabase service_role key.
- Keep the SQL policy email identical to the admin email.
- Anyone may open the admin page, but only the authenticated email allowed by the database policies can modify game records.