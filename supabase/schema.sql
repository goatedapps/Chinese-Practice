-- Run this once in the Supabase SQL editor for this project.
-- Backs the app's cross-device sync layer (see src/lib/sync.ts) -- one row
-- per synced localStorage store per user, keyed by the same string constant
-- the app already uses locally (e.g. "hanyuPracticePet_v1"), so no separate
-- key-mapping table is needed. Only the five stores that are meaningfully
-- cross-device (pet, history, achievements, tingxieProgress, the chosen
-- content level) ever get a row here -- the day-scoped stores (todaySummary,
-- specialQuest) stay local-only by design, see CLAUDE.md's Auth /
-- cross-device sync section.

create table if not exists user_state (
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table user_state enable row level security;

create policy "Users can read their own state"
  on user_state for select
  using (auth.uid() = user_id);

create policy "Users can insert their own state"
  on user_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own state"
  on user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
