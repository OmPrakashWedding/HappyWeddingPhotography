-- Happy Wedding Photography — Supabase schema
-- Matches Documents/wedding-photography-website-dev-plan.md §4.
-- Run this once in Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS).

create extension if not exists "pgcrypto";

-- =========================================================
-- services — master list of offerings + rates
-- =========================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('photography', 'videography', 'cinematography')),
  description text,
  rate numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- leads — every enquiry, from the website form or entered by staff
-- =========================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  event_type text,
  event_date date,
  message text,
  source text not null default 'website' check (source in ('website', 'manual')),
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'lost')),
  requested_service_ids uuid[],
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- projects — a lead that paid an advance and became a booked client
-- =========================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  client_name text not null,
  client_phone text,
  client_email text,
  event_date date,
  service_ids uuid[],
  advance_paid numeric,
  total_amount numeric,
  status text not null default 'booked' check (status in ('booked', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- invoices — one-to-many with projects
-- =========================================================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  invoice_number text,
  amount numeric,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  issued_date date,
  due_date date,
  notes text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- notes — free-text notes against a lead or project
-- =========================================================
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  project_id uuid references public.projects(id),
  body text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.projects enable row level security;
alter table public.invoices enable row level security;
alter table public.notes enable row level security;

-- Table-level grants — required in addition to the RLS policies below.
-- Supabase only auto-grants SELECT to `anon` by default, not INSERT/UPDATE/
-- DELETE, so without these the leads_public_insert policy below is never
-- even reached (Postgres checks base privileges before RLS).
grant usage on schema public to anon, authenticated;

grant select on public.services to anon, authenticated;
grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.invoices to authenticated;
grant select, insert, update, delete on public.notes to authenticated;

-- services: everyone can read; only signed-in staff can write
drop policy if exists "services_public_select" on public.services;
create policy "services_public_select" on public.services
  for select to anon, authenticated using (true);

drop policy if exists "services_staff_write" on public.services;
create policy "services_staff_write" on public.services
  for all to authenticated using (true) with check (true);

-- leads: anonymous website visitors can INSERT only (never read/update/delete);
-- signed-in staff (the future CRM app) get full access
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert to anon
  with check (source = 'website');

drop policy if exists "leads_staff_all" on public.leads;
create policy "leads_staff_all" on public.leads
  for all to authenticated using (true) with check (true);

-- projects / invoices / notes: staff-only, no anonymous access at all
drop policy if exists "projects_staff_all" on public.projects;
create policy "projects_staff_all" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "invoices_staff_all" on public.invoices;
create policy "invoices_staff_all" on public.invoices
  for all to authenticated using (true) with check (true);

drop policy if exists "notes_staff_all" on public.notes;
create policy "notes_staff_all" on public.notes
  for all to authenticated using (true) with check (true);
