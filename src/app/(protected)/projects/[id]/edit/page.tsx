import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import ProjectForm from "@/components/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, description, status, start_date, end_date, budget, client_id, visibility")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  return (
    <div>
      <Link
        href="/projects"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to projects
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">
        Edit {project.title}
      </h1>
      <ProjectForm
        mode="edit"
        projectId={project.id}
        initial={{
          title: project.title,
          description: project.description ?? "",
          status: project.status ?? "active",
          startDate: project.start_date ?? "",
          endDate: project.end_date ?? "",
          budget: project.budget != null ? String(project.budget) : "",
          clientId: project.client_id ?? "",
          visibility: project.visibility,
        }}
      />
    </div>
  );
}