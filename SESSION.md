# Session Summary: Jhed.dev Portfolio App

**Last updated:** 2026-11-13

## Communication Rule (STRICT)

**All communication must be in English. No other language — not Chinese, not any other — not even a single word or phrase, in messages, code comments, or this file.** If a non-English word slips through, call it out and re-state in English. The user does not understand other languages and will say so.

## Overview

Next.js 16 portfolio web app with client/project/task management + Supabase auth/backend. Project root: `C:\\Users\\sjhed\\OneDrive\\Desktop\\Jhed.dev.portfolio.web-app`

## Latest Session Updates (2026-11-13)

### PR #2 merged and application warning fixed

- GitHub PR #2, **"Fix post-merge task hierarchy and Supabase security findings"**, was successfully merged into `main` by the user.
- The PR includes task hierarchy/subtask fixes, corrected parent ID handling for add-subtask actions in both board views, preservation of zero-valued task estimates using nullish coalescing, migration hardening/security changes, and the Next.js async route parameter handling.
- The user updated `src/components/add-task-form.tsx` to remove the `selected` attribute from the Medium option and set `defaultValue="medium"` on the parent `<select>`.
- The user ran the application after this change and reported that it showed no issues.
- Do not claim that the current local working tree is synchronized with `main` unless checked.

### Supabase migrations and live database state

The user confirmed that migration `00000004_restrict_public_task_columns.sql` was successfully applied to the live Supabase project.

| Migration | Status | Notes |
|---|---|---|
| `00000001` | Applied | Initial database schema |
| `00000002_task_hierarchy.sql` | Applied | Task hierarchy columns and structure |
| `00000003_tasks_owner_and_function_hardening.sql` | Applied | Previously applied to the live database; later edits to this migration file were merged afterward and were not rerun |
| `00000004_restrict_public_task_columns.sql` | Applied | User confirmed successful application on 2026-11-13 |

Important migration 00000003 detail:
- The original migration was applied before later edits were made to its SQL file.
- Those later edits included adding `tasks_owner_id_idx` and guarding the revoke of `public.rls_auto_enable()` with a `to_regprocedure()` check.
- The later edits were merged to GitHub but were not rerun as migration 00000003 against the existing live database.
- Migration 00000004 also includes an idempotent creation of `tasks_owner_id_idx`, so the index is intended to be covered by migration 00000004.
- Do not assume the function-revoke guard was executed against the live database merely because the updated SQL file was merged.

Migration 00000004 behavior:
- Revokes table-level SELECT on `public.tasks` from `anon` and `PUBLIC`.
- Grants anonymous SELECT only on the approved public task columns: `id`, `project_id`, `title`, `description`, `assignee_ids`, `status`, `priority`, `due_date`, `order`, `created_at`, `parent_id`, `tags`, and `estimate_hours`.
- Does not grant anonymous SELECT on internal `owner_id`.
- User confirmed successful execution in Supabase. The actual resulting privileges have not yet been independently verified with read-only SQL checks.

### Live Supabase permission and application access verification (COMPLETED 2026-11-14)

Read-only checks were completed against the live Supabase project (`ohczaisjoqcfipsmlrgj`). No database changes, application changes, or data writes were made.

#### Database access results

| Role | Visible projects | Visible tasks | Result |
|---|---:|---:|---|
| `anon` | 7 | 11 | Public project/task rows only |
| `admin` | 7 | 11 | All current projects and their tasks |
| `client` | 5 | 10 | Client-scoped projects and tasks |

Additional checks:
- RLS is enabled on `public.projects` and `public.tasks`.
- Anonymous task SELECT is limited to the approved public columns: `id`, `project_id`, `title`, `description`, `assignee_ids`, `status`, `priority`, `due_date`, `order`, `created_at`, `parent_id`, `tags`, and `estimate_hours`.
- Anonymous users cannot SELECT `public.tasks.owner_id`.
- No table-level SELECT grant on `public.tasks` was found for `anon`; no PUBLIC table grants were found on the inspected `tasks` and `projects` tables.
- The public task policy scopes task visibility through the associated project's public visibility. The current data returned 7 public projects and 11 associated tasks.
- Authenticated role simulations returned the expected admin and client scoping. `public.current_user_role()` returned the expected role in each simulation.
- The SQL role simulations used read-only transactions and were rolled back.

#### Database hardening observation

- `anon` currently has table-level INSERT, UPDATE, and DELETE privileges on `public.tasks`, along with column-level write grants. No anonymous INSERT, UPDATE, or DELETE RLS policies were found, so these grants do not currently provide row access through the inspected RLS model. They are nevertheless unnecessary privileges and should be considered for revocation in a separate, explicitly approved hardening change.
- No permissions were changed during this verification. Do not revoke grants or alter policies without the user's explicit authorization.

#### Application code review

- The protected project detail route requires authentication and scopes client access to the client's own projects. Admin access is broader.
- Project and client management server actions reviewed enforce admin authorization.
- Task create/update/delete server actions reviewed enforce admin authorization. A client may encounter an editable-looking task form, but saving invokes an admin-only action; this is a UI/authorization mismatch to address, not evidence that client writes succeeded.
- The project detail page displays an Edit link to clients even though project editing is intended to be admin-only. Verify the edit route guard before treating this as a security defect; the visible link is at least a UI inconsistency.
- The public portfolio showcase is sourced from local Markdown files under `content/projects/`, not from the Supabase `projects` table. `src/lib/content.ts` defaults a missing visibility value to `public`; review each content file before publishing it.

#### Verification limits and remaining checks

- The live Supabase migration history table could not be queried at the expected `supabase_migrations.schema_migrations` path. Verification therefore relied on the live schema, grants, RLS policies, and role simulations rather than migration-history records.
- Actual browser login/session flows were not tested. Admin and client behavior was checked through code review and database role simulation, not an interactive browser session.
- The public homepage and `/showcase/[slug]` rendering were not browser-tested.
- Do not treat the anonymous write grants as fixed. They remain a recommended hardening item pending explicit approval.

## What Was Done This Session (2026-11-11)

### ClickUp-style task hierarchy feature (COMPLETED)

| File | Action |
|------|--------|
| `supabase/migrations/00000002_task_hierarchy.sql` | APPLIED — pasted into Supabase dashboard SQL editor |
| `apply-migration-2.mjs` | NEW — applies migration via Supabase REST API (reads creds from `.env.local`) |
| `src/lib/database.types.ts` | MODIFIED — added new task fields + `Relationships: []` to every table |
| `src/lib/actions/tasks.ts` | MODIFIED — extended `TaskSchema` with `parentId`, `tags`, `estimateHours` |
| `src/components/task-kanban-board.tsx` | MODIFIED — now uses shared `TaskCard`, nests subtasks under parent, "+ Add subtask" button |
| `src/components/task-card.tsx` | MODIFIED — shared card w/ tags, status select, delete, **subtask nesting**, estimate, parent label |
| `src/components/subtask-list.tsx` | MODIFIED — recursive nesting (sub-subtasks), estimate display, "+ Add sub-subtask" |
| `src/components/task-form.tsx` | MODIFIED — parent select, estimate, tags fields |
| `src/components/add-task-form.tsx` | MODIFIED — estimate + tags inputs, hidden parentId, **`defaultParentTitle` now rendered** |
| `src/components/task-board.tsx` | MODIFIED — list view now uses shared `TaskCard` with nesting + add-subtask |
| `src/components/task-board-wrapper.tsx` | NEW — client shell holding active-parent state, connects board → inline add form |
| `src/app/(protected)/projects/[id]/page.tsx` | MODIFIED — uses `TaskBoardWrapper`, single flat task query (allTasks) |
| `src/app/(protected)/tasks/[id]/page.tsx` | MODIFIED — sibling tasks query for parent select |

### TypeScript `never` cascade fix (96 errors → 0)

Root cause: hand-written `Database` types were missing the `Relationships` field that `@supabase/postgrest-js` `GenericTable` requires. Without it the whole query-builder type chain collapsed to `never`. Added `Relationships: []` to clients/users/projects/tasks.

Also fixed: `createSupabaseServerClient()` calls in auth.ts needed `await`, `supabase.auth.signUpWithPassword` → `signInWithPassword`, budget type coercion, client/project form `ActionState` union, task `project_id` nullable handling.

### `assignee_ids` feature (COMPLETED 2026-11-11)

The last interrupted-session stub. `assignee_ids` existed in the DB schema and the `TaskSchema`, but every form hardcoded `assigneeIds: []` and there was no UI.

| File | Action |
|------|--------|
| `src/components/assignee-picker.tsx` | EXISTING — multi-select checkbox picker, fetches users via `getAssignableUsers()`, role-colored pills, select-all/deselect-all, click-outside-to-close |
| `src/components/assignee-avatars.tsx` | NEW — small colored name chips rendered on each task card, resolves IDs to emails via `getUsersByIds()` |
| `src/lib/actions/users.ts` | MODIFIED — added `getUsersByIds(ids)` server action (RLS enforced) |
| `src/components/add-task-form.tsx` | MODIFIED — added `AssigneePicker`, local `useState` for selected IDs, passes real `assigneeIds` to `createTask` (was `[]`) |
| `src/components/task-form.tsx` | MODIFIED — added `AssigneePicker`, pre-filled from `task.assignee_ids`, passes real `assigneeIds` to `updateTask` (was `[]`) |
| `src/components/task-card.tsx` | MODIFIED — added `assignee_ids: string[]` field + `<AssigneeAvatars />` render |
| `src/app/(protected)/projects/[id]/page.tsx` | MODIFIED — queries now select `assignee_ids` (allTasks + subtasks) |
| `src/app/(protected)/tasks/[id]/page.tsx` | MODIFIED — query now selects `assignee_ids` so the edit form pre-fills the picker |

**Verification:** `npx tsc --noEmit` passes with 0 errors. `npm run build` succeeds, all 12 routes compile. Dev server was stopped by the system due to low memory (not a code problem).

## Supabase State (historical setup notes)

- Project name: `Jhed.dev.portfolio.web-app`
- Project ref: `ohczaisjoqcfipsmlrgj`
- Region: `ap-southeast-2`; Postgres 17.11; project status was ACTIVE_HEALTHY at last recorded check.
- Tables `clients`, `projects`, `tasks`, and `users` have RLS enabled.
- `.env.local` was recorded as containing only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No service-role key was available then; migrations were pasted into the Supabase dashboard SQL editor.
- Supabase migration history table was absent at the last recorded check, so migration tracking in Supabase may not reflect the manually applied SQL files. Verify actual schema and privileges rather than relying only on a migration-history table.
- Security advisor previously warned that leaked password protection was disabled. This is a dashboard setting and was not fixed in the recorded work.
- Existing performance advisor warnings included initplan/policy and multiple permissive policies. These were not all addressed.
- Current task RLS model: admins insert/update/delete; anonymous users may read public tasks through project visibility; authenticated client users may read tasks within permitted projects. Preserve this model; do not weaken policies.
- Migration 00000001 changes previously applied included `tasks.owner_id`, function search_path hardening, function grants/revokes, and foreign-key indexes. See the migration files and prior database notes for exact details.

## Known Gaps

- ❌ No sign-up/registration flow
- ❌ No unit tests
- ❌ No error boundaries / loading states
- ❌ Tasks restricted to admin role (`requireAdmin`) — client users can't create tasks yet
- ✅ Supabase permission/RLS verification after migration 00000004 completed on 2026-11-14 (see verification section above)
- ⚠️ Anonymous INSERT/UPDATE/DELETE grants on `public.tasks` remain present and are recommended for revocation after explicit approval
- ⚠️ The later function-revoke guard from the edited migration 00000003 was not independently verified on the live database
- ✅ `assignee_ids` — full UI now wired up (was a stub passing `[]`)

## How to Pick Up

1. `npm run dev` → `http://localhost:3000`
2. Login using the local development credentials configured for the project. Do not copy credentials into shared documentation or commit them.
3. Navigate: Dashboard → Projects → pick a project → kanban board (default) or list view
4. Click any task's "+ Add subtask" button → inline form flips to subtask mode showing the parent
5. Subtasks nest under their parent card (recursive — supports sub-subtasks)

## Git Hygiene / Commit History

### Original 2026-11-11 commit

**Committed as `145bf92`** — 32 files, 1430 insertions, 115 deletions:
- All `src/` feature work (task hierarchy + assignee UI)
- `supabase/migrations/00000002_task_hierarchy.sql`
- `supabase.json`, `supabase/seed-data.mjs`, `seed.mjs` (one-line fix)
- `content/projects/portfolio-website-redesign.md`
- `package.json` (`pg` ^8.23.1) + `package-lock.json`
- `.gitignore` additions

### Intentionally local helper files (last recorded state)

- `apply-migration.mjs`, `apply-migration-2.mjs` — helper scripts requiring `SUPABASE_SERVICE_ROLE_KEY`, which was not present in `.env.local` at the time.
- `migration_payload.json` — redundant migration SQL payload dump.
- Preserve these files unless the user explicitly asks to remove or commit them. Their current local status has not been rechecked.

### SESSION.md tracking status

- Originally, `SESSION.md` was listed in `.gitignore` as a local-only session note.
- The user later temporarily removed it from `.gitignore` and pushed it to GitHub so it could be inspected and updated from the repository.
- This file is currently present on the GitHub `main` branch as of this update.
- Do not assume whether the ignore rule has since been restored; inspect the current `.gitignore` before making Git hygiene recommendations.
- The user explicitly wants this session file maintained as the project handoff/context document.

## Quick Commands

- Kill Node: `Get-Process node | Stop-Process -Force` (PowerShell)
- Type check: `npx tsc --noEmit`
- Build: `npm run build`
- Restart: `npm run dev`
- Commit: `git commit -m "..." -m "body" -m "Co-Authored-By: Claude Code <noreply@anthropic.com>"` (use `-m` per paragraph — a single multiline `-m` breaks git arg parsing)

## Exclusive Vision Instructions (from user)

The user indicated they would share exclusive instructions that would clarify their vision for this project and align our understanding. These instructions are pending — the user said "standby for an exclusive instructions that I think and hope would give clarity to my vision for this project this will also align our visions and understanding on what should this project should be."

## Current Project State Summary

This is a Next.js 16 portfolio web app with:
- Supabase authentication (admin + client roles)
- Client, project, and task management
- ClickUp-style task hierarchy (parent/child subtasks)
- Tag system and time estimates (`estimateHours`)
- Assignee assignment UI
- Row-Level Security (RLS) for data protection
- Public showcase pages for portfolio items
- Admin dashboard for full management

The project has task management and portfolio showcase functionality in place. The current focus is post-merge verification of Supabase permissions and access behavior. Known gaps include testing coverage, sign-up flow, error/loading boundaries, and client-side task creation.
