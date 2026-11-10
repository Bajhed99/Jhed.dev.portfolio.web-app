-- 00000002_task_hierarchy.sql
-- ClickUp-style task hierarchy, tags, assignees, and time estimates.
--
-- NOTE: the exec_sql RPC endpoint's parser rejects
--   `ADD CONSTRAINT IF NOT EXISTS ...` (it errors at `not`),
--   so the foreign key is added idempotently inside a DO block that
--   checks pg_constraint first.

alter table tasks
  add column if not exists parent_id uuid,
  add column if not exists tags text[] default '{}',
  add column if not exists estimate_hours numeric;

-- Self-referencing parent. ON DELETE SET NULL so orphaned subtasks flatten to top-level.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_parent_id_fkey'
  ) then
    alter table tasks
      add constraint tasks_parent_id_fkey
      foreign key (parent_id) references tasks(id) on delete set null;
  end if;
end
$$;

-- Indexes for fast subtask lookups and tag containment queries.
create index if not exists tasks_parent_id_idx on tasks (parent_id);
create index if not exists tasks_tags_idx on tasks using gin (tags);