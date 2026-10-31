-- ============================================================
-- SobesQuest — схема базы данных (Supabase / Postgres)
-- Выполните этот файл в Supabase Dashboard -> SQL Editor
-- ============================================================

-- ---------- Профили игроков ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now()
);

-- Автоматическое создание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      'Игрок-' || left(new.id::text, 4)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Проверка «текущий пользователь — админ?» (security definer, чтобы
-- использовать в RLS без рекурсии политик)
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- Задачи по коду ----------
create table public.tasks (
  id bigint generated always as identity primary key,
  level text not null check (level in ('junior', 'middle', 'senior')),
  title text not null,
  description text not null,
  starter_code text not null default '',
  function_name text not null,
  tests jsonb not null default '[]'::jsonb,      -- [{ "args": [...], "expected": ... }]
  test_code text,                                 -- альтернатива tests: произвольный JS-код с assert
  hints jsonb not null default '[]'::jsonb,       -- ["подсказка 1", "подсказка 2"]
  solution_code text,
  xp int not null default 10,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Теоретические вопросы ----------
create table public.theory_questions (
  id bigint generated always as identity primary key,
  level text not null check (level in ('junior', 'middle', 'senior', 'hr')),
  question text not null,
  answer text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Компании ----------
create table public.companies (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  emoji text not null default '🏢',
  color text not null default '#8b5cf6',
  tagline text not null default '',
  description text not null default '',
  required_level text not null check (required_level in ('junior', 'middle', 'senior')),
  questions jsonb not null default '[]'::jsonb,  -- фирменные вопросы собеседования
  sort_order int not null default 0
);

-- ---------- Решённые задачи ----------
create table public.solves (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id bigint not null references public.tasks(id) on delete cascade,
  solved_at timestamptz not null default now(),
  unique (user_id, task_id)
);

-- ---------- Пройденные собеседования ----------
create table public.interview_runs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  company_slug text references public.companies(slug) on delete set null,
  level text not null check (level in ('junior', 'middle', 'senior')),
  score int not null check (score between 0 and 100),
  details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Отзывы о компаниях ----------
create table public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade, -- null у сеяных отзывов
  author_name text not null default 'Аноним',
  company_slug text references public.companies(slug) on delete cascade,
  rating int not null check (rating between 1 and 5),
  text text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.tasks            enable row level security;
alter table public.theory_questions enable row level security;
alter table public.companies        enable row level security;
alter table public.solves           enable row level security;
alter table public.interview_runs   enable row level security;
alter table public.reviews          enable row level security;

-- profiles: читать могут все (нужно для рейтинга), менять роли может только админ
create policy "profiles readable" on public.profiles
  for select using (true);
create policy "profiles admin update" on public.profiles
  for update using (public.is_admin());

-- tasks: читать опубликованные может кто угодно; писать — только админ
create policy "tasks read published" on public.tasks
  for select using (is_published or public.is_admin());
create policy "tasks admin write" on public.tasks
  for insert with check (public.is_admin());
create policy "tasks admin update" on public.tasks
  for update using (public.is_admin());
create policy "tasks admin delete" on public.tasks
  for delete using (public.is_admin());

-- theory_questions: аналогично
create policy "theory read published" on public.theory_questions
  for select using (is_published or public.is_admin());
create policy "theory admin write" on public.theory_questions
  for insert with check (public.is_admin());
create policy "theory admin update" on public.theory_questions
  for update using (public.is_admin());
create policy "theory admin delete" on public.theory_questions
  for delete using (public.is_admin());

-- companies: читать все, писать админ
create policy "companies read" on public.companies
  for select using (true);
create policy "companies admin write" on public.companies
  for insert with check (public.is_admin());
create policy "companies admin update" on public.companies
  for update using (public.is_admin());
create policy "companies admin delete" on public.companies
  for delete using (public.is_admin());

-- solves: свои решения видит владелец и админ; вставляет только владелец
create policy "solves read own" on public.solves
  for select using (user_id = auth.uid() or public.is_admin());
create policy "solves insert own" on public.solves
  for insert with check (user_id = auth.uid());

-- interview_runs: свои прохождения
create policy "runs read own" on public.interview_runs
  for select using (user_id = auth.uid() or public.is_admin());
create policy "runs insert own" on public.interview_runs
  for insert with check (user_id = auth.uid());

-- reviews: читать всем, писать свои, удалять свои
create policy "reviews read" on public.reviews
  for select using (true);
create policy "reviews insert own" on public.reviews
  for insert with check (user_id = auth.uid());
create policy "reviews delete own" on public.reviews
  for delete using (user_id = auth.uid() or public.is_admin());

-- ============================================================
-- Рейтинг: агрегированное представление (обходит RLS, раскрывает
-- только публичную статистику: имя, XP, число решённых задач)
-- XP = сумма XP решённых задач + score/10 за каждое собеседование
-- ============================================================
create or replace view public.leaderboard as
select
  p.id,
  p.username,
  p.role,
  p.created_at,
  coalesce(t.xp, 0) + coalesce(i.bonus, 0) as xp,
  coalesce(s.solved, 0) as solved_count
from public.profiles p
left join (
  select s.user_id, sum(t.xp) as xp
  from public.solves s
  join public.tasks t on t.id = s.task_id and t.is_published
  group by s.user_id
) t on t.user_id = p.id
left join (
  select user_id, sum(score / 10) as bonus
  from public.interview_runs
  group by user_id
) i on i.user_id = p.id
left join (
  select user_id, count(*) as solved
  from public.solves
  group by user_id
) s on s.user_id = p.id
order by xp desc, solved_count desc, p.created_at asc;
