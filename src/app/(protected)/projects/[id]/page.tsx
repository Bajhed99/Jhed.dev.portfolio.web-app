import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import TaskBoardWrapper from "@/components/task-board-wrapper";

export const revalidate = 0;

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string };
}) {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, title, description, status, start_date, end_date, budget, client_id, owner_id, visibility",
    )
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  // Admins see everything; client users only their own client's projects.
  if (user.role !== "admin" && project.client_id !== user.clientId) {
    redirect("/projects");
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, due_date, order, parent_id, tags, assignee_ids",
    )
    .eq("project_id", params.id)
    .order("order", { ascending: true });

  const { data: subtasks } = await supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, due_date, order, parent_id, tags, assignee_ids",
    )
    .eq("project_id", params.id)
    .not("parent_id", "is", null)
    .order("order", { ascending: true });

  // Build a flat list of all tasks (top-level + subtasks) so the wrapper
  // can find parent-child relationships, including nested grandchildren.
  const { data: allTasks } = await supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, due_date, order, parent_id, tags, assignee_ids",
    )
    .eq("project_id", params.id)
    .order("order", { ascending: true });

  const viewMode = searchParams?.view === "list" ? "list" : "kanban";

  return (
    <div>
      <Link
        href="/projects"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to projects
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
          {project.description ? (
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              {project.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
              project.status === "active"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : project.status === "completed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : project.status === "on-hold"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            {project.status?.replace("-", " ")}
          </span>
          <Link
            href={`/projects/${project.id}/edit`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Edit
          </Link>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-zinc-500">Start</dt>
          <dd>
            {project.start_date
              ? new Date(project.start_date).toLocaleDateString()
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">End</dt>
          <dd>
            {project.end_date
              ? new Date(project.end_date).toLocaleDateString()
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Budget</dt>
          <dd>
            {project.budget != null
              ? `$${Number(project.budget).toLocaleString()}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Client</dt>
          <dd>{project.client_id ?? "—"}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="flex gap-2">
            <Link
              href={`/projects/${project.id}?view=list`}
              className={`text-xs hover:text-zinc-900 dark:hover:text-zinc-100 ${
                viewMode === "list"
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500"
              }`}
            >
              List
            </Link>
            <span className="text-xs text-zinc-300">|</span>
            <Link
              href={`/projects/${project.id}`}
              className={`text-xs hover:text-zinc-900 dark:hover:text-zinc-100 ${
                viewMode === "kanban"
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500"
              }`}
            >
              Kanban
            </Link>
          </div>
        </div>

        <TaskBoardWrapper
          projectId={project.id}
          tasks={allTasks ?? []}
          viewMode={viewMode as "kanban" | "list"}
        />
      </div>
    </div>
  );
}