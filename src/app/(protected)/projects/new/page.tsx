import Link from "next/link";
import ProjectForm from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <Link
        href="/projects"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to projects
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">New project</h1>
      <ProjectForm mode="create" />
    </div>
  );
}