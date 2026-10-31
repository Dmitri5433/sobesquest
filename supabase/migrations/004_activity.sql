-- ============================================================
-- SobesQuest — дни активности игроков (для стриков и теплокарты)
-- Выполните ПОСЛЕ 001_schema.sql
-- ============================================================

-- Обезличенная сводка: в какие дни игрок проявлял активность
-- (решение задачи, собеседование, комментарий). Вид выполняется с правами
-- владельца, поэтому не раскрывает содержимое solves — только даты.
create or replace view public.activity_days as
select user_id, (solved_at at time zone 'utc')::date as day
  from public.solves
union
select user_id, (created_at at time zone 'utc')::date as day
  from public.interview_runs
union
select user_id, (created_at at time zone 'utc')::date as day
  from public.comments;
