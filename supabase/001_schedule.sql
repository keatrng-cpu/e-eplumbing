-- Ellingson Plumbing — scheduled-work calendar.
--
-- Replaces the Netlify Blobs "fill" blob, which had two problems the shop
-- would eventually feel:
--
--   1. Race. book.js read the whole blob, added to it and wrote it back. Two
--      visitors submitting at once both read `used: 3`, both wrote `used: 5`,
--      and the day was oversold by one job.
--   2. No reconciliation. A hold carried no link to the lead that caused it,
--      so an abandoned or cancelled request left a slot consumed forever with
--      nothing to look it up by. On a 4-slot day that is a quarter of a truck.
--
-- Both are fixed here: ee_hold_slot() claims the day inside one transaction
-- with a row lock, and every hold is a row keyed by the same reference number
-- the customer sees on /thanks.html.
--
-- Apply with the Supabase CLI against the project, never from CI:
--   supabase db push      (or paste into the SQL editor)

create extension if not exists pgcrypto;

-- Tunables live here, not in code, so the shop can change capacity without a
-- deploy. Keep DAILY_SLOTS in step with schedule.js.
create table if not exists public.ee_settings (
  id            boolean primary key default true check (id),
  daily_slots   int  not null default 4,
  horizon_days  int  not null default 21,
  updated_at    timestamptz not null default now()
);
insert into public.ee_settings (id) values (true) on conflict (id) do nothing;

-- One row per booked job. The day's load is the sum of its live holds, so a
-- cancellation is a single update and the calendar corrects itself.
create table if not exists public.ee_holds (
  ref         text primary key,
  day         date not null,
  slots       int  not null check (slots > 0),
  service     text not null default '',
  scope       text not null default '',
  arrival     text not null default '',
  status      text not null default 'held' check (status in ('held','confirmed','cancelled','done')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ee_holds_day on public.ee_holds (day) where status in ('held','confirmed');

-- Current load per day, counting only holds that still occupy the truck.
create or replace view public.ee_fill as
  select day, sum(slots)::int as used
  from public.ee_holds
  where status in ('held','confirmed')
  group by day;

-- Office days are Mon–Fri (OPERATIONS.md). Emergencies run every day but never
-- consume a calendar slot, so they never reach this function at all.
create or replace function public.ee_is_workday(d date)
returns boolean language sql immutable as $$
  select extract(isodow from d) between 1 and 5;
$$;

/**
 * Claim `p_need` slots, atomically.
 *
 * Takes the requested day when it still has room, otherwise the first open
 * workday from tomorrow out to the horizon. Returns the day actually held and
 * whether it differs from what was asked for, so the UI can say "that day
 * filled up — we've held Tuesday instead" rather than silently moving it.
 *
 * Today is never offered: by the time anyone is looking at a booking calendar,
 * the day's slate is already on the truck.
 */
create or replace function public.ee_hold_slot(
  p_ref      text,
  p_need     int,
  p_day      date default null,
  p_service  text default '',
  p_scope    text default '',
  p_arrival  text default ''
) returns table (day date, day_changed boolean, used int, daily_slots int)
language plpgsql security definer set search_path = public as $$
declare
  v_slots   int;
  v_horizon int;
  v_pick    date;
  v_cursor  date;
  v_used    int;
begin
  select daily_slots, horizon_days into v_slots, v_horizon from ee_settings where id;

  -- Serialize every concurrent hold behind one advisory lock. The whole search
  -- plus the insert happens inside it, so two visitors can never both land the
  -- same last opening.
  perform pg_advisory_xact_lock(hashtext('ee_hold_slot'));

  -- An existing ref is idempotent: a retried or double-submitted request
  -- returns the day it already holds instead of consuming a second slot.
  select h.day into v_pick from ee_holds h where h.ref = p_ref and h.status in ('held','confirmed');
  if found then
    select coalesce(f.used, 0) into v_used from ee_fill f where f.day = v_pick;
    return query select v_pick, false, v_used, v_slots;
    return;
  end if;

  if p_day is not null and ee_is_workday(p_day) and p_day > current_date then
    select coalesce(f.used, 0) into v_used from ee_fill f where f.day = p_day;
    if v_slots - coalesce(v_used, 0) >= p_need then v_pick := p_day; end if;
  end if;

  if v_pick is null then
    v_cursor := current_date + 1;
    while v_cursor <= current_date + v_horizon loop
      if ee_is_workday(v_cursor) then
        select coalesce(f.used, 0) into v_used from ee_fill f where f.day = v_cursor;
        if v_slots - coalesce(v_used, 0) >= p_need then
          v_pick := v_cursor;
          exit;
        end if;
      end if;
      v_cursor := v_cursor + 1;
    end loop;
  end if;

  if v_pick is null then
    -- Booked solid to the horizon. Returning null is not a failure: the lead
    -- still reaches the office, which calls to work something out.
    return query select null::date, false, null::int, v_slots;
    return;
  end if;

  insert into ee_holds (ref, day, slots, service, scope, arrival)
  values (p_ref, v_pick, p_need, coalesce(p_service, ''), coalesce(p_scope, ''), coalesce(p_arrival, ''));

  select coalesce(f.used, 0) into v_used from ee_fill f where f.day = v_pick;
  return query select v_pick, (p_day is not null and p_day is distinct from v_pick), v_used, v_slots;
end;
$$;

-- Releasing a slot is now possible, which it was not with the blob.
create or replace function public.ee_release_hold(p_ref text)
returns boolean language sql security definer set search_path = public as $$
  update ee_holds set status = 'cancelled', updated_at = now()
  where ref = p_ref and status in ('held','confirmed')
  returning true;
$$;

-- The site talks to these only through the service-role key, from a Netlify
-- function — never from the browser. The service role bypasses RLS, so these
-- policies exist to state that intent explicitly rather than leaving the
-- tables policy-less and relying on the implicit deny.
--
-- These hold a customer's booked day and the shop's capacity. If the anon key
-- could read ee_holds, anyone could enumerate the week's job load; if it could
-- write, anyone could fill the calendar and take the truck off the road. So
-- anon and authenticated get nothing, deliberately and in writing.
alter table public.ee_holds    enable row level security;
alter table public.ee_settings enable row level security;

drop policy if exists ee_holds_no_public    on public.ee_holds;
drop policy if exists ee_settings_no_public on public.ee_settings;

create policy ee_holds_no_public on public.ee_holds
  for all to anon, authenticated
  using (false) with check (false);

create policy ee_settings_no_public on public.ee_settings
  for all to anon, authenticated
  using (false) with check (false);
