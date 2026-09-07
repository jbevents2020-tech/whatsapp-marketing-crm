-- WhatsApp CRM database schema
-- Run this in the Supabase SQL Editor for this project.

create extension if not exists pgcrypto;

create table if not exists public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  recipient_type text not null check (recipient_type in ('personal','group','community','channel')),
  whatsapp_source text not null check (whatsapp_source in ('WhatsApp','WhatsApp Business')),
  phone text,
  link text,
  category text,
  area text,
  can_send boolean not null default true,
  permission_status text check (permission_status in ('verified','adminOnly','unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null default '',
  status text not null default 'Draft' check (status in ('Draft','In-progress','Completed')),
  selected_ids uuid[] not null default '{}',
  done_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipients enable row level security;
alter table public.campaigns enable row level security;

create policy "Users read own recipients" on public.recipients for select using (auth.uid() = user_id);
create policy "Users insert own recipients" on public.recipients for insert with check (auth.uid() = user_id);
create policy "Users update own recipients" on public.recipients for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own recipients" on public.recipients for delete using (auth.uid() = user_id);

create policy "Users read own campaigns" on public.campaigns for select using (auth.uid() = user_id);
create policy "Users insert own campaigns" on public.campaigns for insert with check (auth.uid() = user_id);
create policy "Users update own campaigns" on public.campaigns for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own campaigns" on public.campaigns for delete using (auth.uid() = user_id);

create index if not exists recipients_user_id_idx on public.recipients(user_id);
create index if not exists recipients_type_idx on public.recipients(recipient_type);
create index if not exists campaigns_user_id_idx on public.campaigns(user_id);
