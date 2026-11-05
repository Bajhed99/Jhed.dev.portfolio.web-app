-- 00000001_initial.sql
-- Portfolio web app: users, clients, projects, tasks.
-- Authorization is enforced at the database layer via Row-Level Security.

-- ---------------------------------------------------------------------------
-- Tables. Inter-table FKs are deferred to ALTER statements below because
-- clients ↔ users is circular (users.client_id → clients, clients.owner_id → users).
-- ---------------------------------------------------------------------------
create table clients (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  company      text,
  notes        text,
  owner_id     uuid,
  visibility   text not null check (visibility in ('public', 'private')) default 'private',
  created_at   timestamptz not null default now()
);

create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null check (role in ('admin', 'client')) default 'client',
  client_id  uuid,
  created_at timestamptz not null default now()
);

create table projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  status       text check (status in ('active', 'completed', 'on-hold', 'cancelled')),
  start_date   date,
  end_date     date,
  budget       numeric,
  client_id    uuid,
  owner_id     uuid,
  visibility   text not null check (visibility in ('public', 'private')) default 'private',
  created_at   timestamptz not null default now()
);

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid,
  title        text not null,
  description  text,
  assignee_ids uuid[] default '{}',
  status       text not null check (status in ('todo', 'in-progress', 'review', 'done')) default 'todo',
  priority     text not null check (priority in ('low', 'medium', 'high')) default 'medium',
  due_date     date,
  "order"      integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inter-table foreign keys (added after all tables exist to break the cycle).
-- ---------------------------------------------------------------------------
alter table clients
  add constraint clients_owner_id_fkey foreign key (owner_id) references users(id) on delete set null;

alter table users
  add constraint users_client_id_fkey foreign key (client_id) references clients(id) on delete set null;

alter table projects
  add constraint projects_client_id_fkey foreign key (client_id) references clients(id) on delete set null,
  add constraint projects_owner_id_fkey foreign key (owner_id) references users(id) on delete set null;

alter table tasks
  add constraint tasks_project_id_fkey foreign key (project_id) references projects(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- Helper: current user's role, bypassing RLS (avoids policy self-reference).
-- ---------------------------------------------------------------------------
create or replace function current_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Auto-profile trigger: every new auth user gets a profile row.
-- Default role is 'client' (safe). The seed script promotes the owner to 'admin'.
-- Nobody can self-promote — role changes go through the admin-only UPDATE policy.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

-- users: see your own row; admins see all.
alter table users enable row level security;

create policy "users_select_own" on users
  for select to authenticated
  using (id = auth.uid());

create policy "admins_select_all_users" on users
  for select to authenticated
  using (current_user_role() = 'admin');

create policy "admins_update_users" on users
  for update to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

-- clients
alter table clients enable row level security;

-- anon sees only public clients
create policy "anon_select_public_clients" on clients
  for select to anon
  using (visibility = 'public');

create policy "users_select_clients" on clients
  for select to authenticated
  using (
    current_user_role() = 'admin'
    or id = (select client_id from users where id = auth.uid())
  );

create policy "admins_insert_clients" on clients
  for insert to authenticated
  with check (current_user_role() = 'admin');

create policy "admins_update_clients" on clients
  for update to authenticated
  using (current_user_role() = 'admin');

create policy "admins_delete_clients" on clients
  for delete to authenticated
  using (current_user_role() = 'admin');

-- projects
alter table projects enable row level security;

create policy "anon_select_public_projects" on projects
  for select to anon
  using (visibility = 'public');

create policy "users_select_projects" on projects
  for select to authenticated
  using (
    current_user_role() = 'admin'
    or client_id = (select client_id from users where id = auth.uid())
  );

create policy "admins_insert_projects" on projects
  for insert to authenticated
  with check (current_user_role() = 'admin');

create policy "admins_update_projects" on projects
  for update to authenticated
  using (current_user_role() = 'admin');

create policy "admins_delete_projects" on projects
  for delete to authenticated
  using (current_user_role() = 'admin');

-- tasks: scope through projects (RLS on projects applies to the subquery)
alter table tasks enable row level security;

create policy "anon_select_public_tasks" on tasks
  for select to anon
  using (
    exists (
      select 1 from projects p
      where p.id = tasks.project_id and p.visibility = 'public'
    )
  );

create policy "users_select_tasks" on tasks
  for select to authenticated
  using (project_id in (select id from projects));

create policy "admins_insert_tasks" on tasks
  for insert to authenticated
  with check (current_user_role() = 'admin');

create policy "admins_update_tasks" on tasks
  for update to authenticated
  using (current_user_role() = 'admin');

create policy "admins_delete_tasks" on tasks
  for delete to authenticated
  using (current_user_role() = 'admin');