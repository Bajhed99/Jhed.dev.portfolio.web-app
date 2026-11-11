-- 00000004_restrict_public_task_columns.sql
-- Keep public task reads available without exposing internal task ownership IDs.
-- PostgreSQL column grants allow anon to read public task fields while excluding owner_id.

revoke select on table public.tasks from anon, public;

grant select (
  id,
  project_id,
  title,
  description,
  assignee_ids,
  status,
  priority,
  due_date,
  "order",
  created_at,
  parent_id,
  tags,
  estimate_hours
) on table public.tasks to anon;

-- Also ensure the owner foreign key is indexed on databases that already ran
-- migration 00000003 before this corrective migration was added.
create index if not exists tasks_owner_id_idx
  on public.tasks(owner_id);
