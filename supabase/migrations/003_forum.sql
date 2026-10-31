-- ============================================================
-- SobesQuest — форум: обсуждения задач
-- Выполните ПОСЛЕ 001_schema.sql и 002_seed.sql
-- Повторный запуск безопасен: сбрасывает обсуждения.
-- ============================================================

drop table if exists public.comments cascade;

create table public.comments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Аноним',
  task_id bigint not null references public.tasks(id) on delete cascade,
  parent_id bigint references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index comments_task_idx on public.comments (task_id, created_at);

alter table public.comments enable row level security;

-- Читать обсуждения могут все, писать и удалять свои — только авторы, удалять любые — админ
create policy "comments read" on public.comments
  for select using (true);
create policy "comments insert own" on public.comments
  for insert with check (user_id = auth.uid());
create policy "comments delete own" on public.comments
  for delete using (user_id = auth.uid() or public.is_admin());
