# AgentWise Pre-Registration

The member pre-registration and applicant sign-up pages. Two doors, one database, per Final Launch Scope v1.0 section 5.1.

- `index.html`, "Join AgentWise", for existing members arriving via a WhatsApp invite (Door One).
- `apply.html`, "Apply to AgentWise", for new applicants with no member record (Door Two).

Both write into the same `registrations` table in Supabase, flagged by a `source` column so the app (and later, the admin review queue) can tell them apart.

## 1. Create the Supabase project

This must be an **AgentWise-owned** Supabase project, not a personal account. If one doesn't exist yet, create it at supabase.com under the company's own account/organisation.

## 2. Run the schema

In the Supabase dashboard, open the SQL Editor and run `supabase/schema.sql`. This creates the `registrations` table with Row Level Security locked down so the public can only insert, never read, update, or delete.

## 3. Configure the site

Copy `config.example.js` to `config.js` (already done in this repo, but re-check if you regenerate it) and fill in your project's URL and anon key, found in Supabase under Project Settings -> API.

```js
export const SUPABASE_URL = "https://xxxxx.supabase.co";
export const SUPABASE_ANON_KEY = "your-anon-key";
```

The anon key is safe to expose in client-side code, that's how Supabase is designed to work. Row Level Security, not secrecy, is what protects the data.

`config.js` is gitignored on purpose, so real keys never accidentally land in the repo history. When you deploy, add the same values as environment-safe static config, or just commit a filled-in `config.js` directly to a **private** repo if that's simpler, either is fine for this project's needs.

## 4. Run it locally

No build step. Any static file server works:

```
npx serve .
```

Then open `index.html` and `apply.html` in the browser and test a real submission against your Supabase project.

## 5. Deploy

Push this repo to GitHub, then connect it to Vercel (or Netlify) as a static site, no framework, no build command needed. Point your subdomain's DNS at the deployment once it's live.

## 6. Before any real invite goes out

This is a build-and-test tool until two things happen:

- The privacy notice and consent wording are cleared by Spencer West. The consent line in both pages currently links to a placeholder, `#`, replace it with the real privacy notice once it exists.
- The Supabase project is confirmed as AgentWise-owned, not a personal or demo project.

Until then, use this for internal testing only, don't push a live link into a WhatsApp group or share it externally.

## Viewing submissions

There's no admin UI in this build, that's Pixelfield's admin panel, scope section 5.9. For now, view and manage submissions directly in the Supabase dashboard's Table Editor, under the `registrations` table. Applicants land with `status = 'pending'`, update that field to `approved` or `declined` as you review them.

## Field list

`full_name`, `phone` (used as the E.164 match key against the app), `email`, `firm`, `role`, `markets`, `consent`, `source` (`member` / `applicant`), `status` (applicants only).
