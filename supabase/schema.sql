-- Sequence for generating registration sequence numbers
create sequence if not exists participant_seq start 1;

-- 1. Profiles Table
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  participant_id text unique not null,
  full_name text not null,
  reg_no text unique not null,
  college text not null,
  branch text not null,
  department text not null,
  section text not null,
  contact text not null,
  email text not null,
  created_at timestamptz default now()
);

-- 2. Teams Table
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code varchar(20) unique not null, -- e.g. PHT01-DWFW
  lead_id uuid not null references profiles(id),
  status text not null default 'round1' check (status in ('round1','shortlisted')),
  created_at timestamptz default now()
);
create unique index if not exists teams_name_ci on teams (lower(name));

-- 3. Team Members Table (One team per participant enforced by PK on profile_id)
create table if not exists team_members (
  profile_id uuid primary key references profiles(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  role text not null check (role in ('lead','member')),
  joined_at timestamptz default now()
);

-- 4. Event Settings Table (Singleton ID = 1)
create table if not exists event_settings (
  id int primary key default 1 check (id = 1),
  countdown_label text default 'ROUND 1 STARTS IN',
  countdown_target timestamptz,
  round1_unlocked boolean not null default false,
  round2_open boolean not null default true,
  registration_label text default 'REGISTRATION CLOSES IN',
  registration_deadline timestamptz default '2026-10-03T23:59:59+05:30',
  registration_open boolean not null default true
);

-- Insert singleton row if not present
insert into event_settings (id, countdown_label, countdown_target, round1_unlocked, round2_open, registration_label, registration_deadline, registration_open)
values (1, 'ROUND 1 STARTS IN', '2026-10-04T09:00:00+05:30', false, true, 'REGISTRATION CLOSES IN', '2026-10-03T23:59:59+05:30', true)
on conflict (id) do nothing;

-- Enable Row Level Security
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table event_settings enable row level security;

-- RLS Policies
create policy "Anyone authenticated can view profiles" on profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Anyone authenticated can view teams" on teams
  for select using (auth.role() = 'authenticated');

create policy "Anyone authenticated can view team members" on team_members
  for select using (auth.role() = 'authenticated');

create policy "Anyone can read event settings" on event_settings
  for select using (true);
