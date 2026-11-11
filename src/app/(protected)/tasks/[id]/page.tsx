import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import TaskForm from "@/components/task-form";

export const revalidate = 0;

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data: task } = await supabase
    .from("tasks")
    .select(
      "id, project_id, title, description, status, priority, due_date, parent_id, tags, assignee_ids, estimate_hours",
    )
    .eq("id", params.id)
    .single();

  if (!task) notFound();

  const projectId = task.project_id;
  if (!projectId) notFound();

  // Scoping: admins see all; client users only tasks under their client's projects.
  if (user.role !== "admin") {
    const { data: project } = await supabase
      .from("projects")
      .select("client_id")
      .eq("id", projectId)
      .single();
    if (!project || project.client_id !== user.clientId) redirect("/projects");
  }

  // Sibling top-level tasks (excluding self) so the user can pick a parent.
  const { data: siblings } = await supabase
    .from("tasks")
    .select("id, title")
    .eq("project_id", projectId)
    .is("parent_id", null)
    .neq("id", params.id)
    .order("order", { ascending: true });

  return (
    <div>
      <Link
        href="/projects"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to projects
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{task.title}</h1>
      <TaskForm task={task} siblings={siblings ?? []} />
    </div>
  );
}