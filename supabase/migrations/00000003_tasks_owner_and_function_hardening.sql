-- 00000003_tasks_owner_and_function_hardening.sql
-- Align the deployed schema with task creation code and harden internal helpers.
-- Safe to run on databases where these objects already exist.

-- Task creation records the authenticated admin as the task owner.
alter table public.tasks
  add column if not exists owner_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_owner_id_fkey'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_owner_id_fkey
      foreign key (owner_id)
      references public.users(id)
      on delete set null;
  end if;
end
$$;

-- Cover foreign keys used by joins and RLS predicates.
create index if not exists clients_owner_id_idx
  on public.clients(owner_id);

create index if not exists projects_client_id_idx
  on public.projects(client_id);

create index if not exists projects_owner_id_idx
  on public.projects(owner_id);

create index if not exists tasks_project_id_idx
  on public.tasks(project_id);

create index if not exists tasks_owner_id_idx
  on public.tasks(owner_id);

create index if not exists users_client_id_idx
  on public.users(client_id);

-- Fixed search_path prevents object-shadowing in SECURITY DEFINER functions.
-- All non-system objects are schema-qualified.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $function$
  select u.role
  from public.users as u
  where u.id = (select auth.uid())
$function$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'client')
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- current_user_role() is called by authenticated RLS policies. Keep that
-- permission while removing inherited/public and anonymous RPC access.
revoke all on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;

-- Trigger/event-trigger functions are not intended to be callable as RPCs.
revoke all on function public.handle_new_user() from public, anon, authenticated;
do $
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$;
