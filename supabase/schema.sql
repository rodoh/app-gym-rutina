create table if not exists public.training_state (
  owner_id text primary key,
  routine jsonb not null,
  sessions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists training_state_set_updated_at on public.training_state;

create trigger training_state_set_updated_at
before update on public.training_state
for each row
execute function public.set_updated_at();

alter table public.training_state enable row level security;

drop policy if exists "training_state_read_anon" on public.training_state;
drop policy if exists "training_state_insert_anon" on public.training_state;
drop policy if exists "training_state_update_anon" on public.training_state;

create policy "training_state_read_anon"
on public.training_state
for select
to anon
using (owner_id = 'rodri');

create policy "training_state_insert_anon"
on public.training_state
for insert
to anon
with check (owner_id = 'rodri');

create policy "training_state_update_anon"
on public.training_state
for update
to anon
using (owner_id = 'rodri')
with check (owner_id = 'rodri');
