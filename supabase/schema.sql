-- AgentWise pre-registration / sign-up capture
-- Run this once in your Supabase project's SQL editor.
-- This must be an AgentWise-owned Supabase project, not a personal account.
--
-- If an older version of this table exists with only test data, drop it first:
--   drop table if exists public.registrations cascade;
-- then run this file in full.

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  first_name text not null,
  last_name text not null,
  phone text not null,          -- store in E.164 format, e.g. +447911123456
  email text not null,
  firm text not null,
  role text not null check (role in ('Agent', 'Broker', 'Buying agent', 'Owner / Principal', 'Developer', 'Investor', 'Other')),
  primary_market text not null,
  work_type text[],              -- optional, e.g. {'Sales', 'Lettings'}
  consent boolean not null default false,

  -- 'member' = arrived via an existing WhatsApp invite (Door One)
  -- 'applicant' = unrecognised number, self-applied (Door Two)
  source text not null check (source in ('member', 'applicant')),

  -- for applicants only: the 24-hour review state
  -- members don't need this, the app itself matches them by phone
  status text not null default 'n/a' check (status in ('n/a', 'pending', 'approved', 'declined')),

  reviewed_by text,
  reviewed_at timestamptz
);

-- one phone number, one record
create unique index if not exists registrations_phone_unique on public.registrations (phone);

-- Row Level Security: the public can INSERT, and nothing else.
-- Nobody, including logged-in members, can read this table from the client.
-- Emily and the team view submissions via the Supabase dashboard Table Editor,
-- logged in with their own AgentWise Supabase account, not via the public site.
alter table public.registrations enable row level security;

drop policy if exists "public can insert" on public.registrations;
create policy "public can insert"
  on public.registrations
  for insert
  to anon
  with check (true);

-- No select/update/delete policy for anon = fully locked from the client.
-- Admins reviewing applicants do so from the Supabase dashboard for now,
-- until the proper admin panel (Final Launch Scope v1.0, section 5.9) ships.
