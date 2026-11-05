import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { toggleProjectVisibility } from "@/lib/actions/projects";
import { ClientVisibilityToggle } from "@/components/visibility-toggle";

export const revalidate = 0;

export default async function ProjectsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, title, status, visibility, client_id, start_date, end_date, budget",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-zinc-500">
            Managed engagements. Public projects appear on the portfolio.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          + New project
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {projects && projects.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timeline</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/projects/${p.id}`}
                      className="hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status ?? "active"} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {p.start_date ? new Date(p.start_date).toLocaleDateString() : "—"}
                    {p.end_date ? ` → ${new Date(p.end_date).toLocaleDateString()}` : ""}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {p.budget != null ? `$${Number(p.budget).toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ClientVisibilityToggle
                      id={p.id}
                      visibility={p.visibility}
                      action={toggleProjectVisibility}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/projects/${p.id}/edit`}
                      className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-12 text-center text-zinc-500">
            No projects yet.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "on-hold":
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    cancelled:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        colors[status] ?? colors.active
      }`}
    >
      {status.replace("-", " ")}
    </span>
  );
}