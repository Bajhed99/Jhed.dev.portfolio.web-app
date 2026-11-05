import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ count: clients }, { count: projects }, { count: tasks }] =
    await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }),
    ]);

  const { data: recentTasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, project_id")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { label: "Clients", value: clients ?? 0, href: "/clients" },
    { label: "Projects", value: projects ?? 0, href: "/projects" },
    { label: "Tasks", value: tasks ?? 0, href: "/projects" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Signed in as {user.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent tasks</h2>
          <Link
            href="/projects"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            View all →
          </Link>
        </div>
        {recentTasks && recentTasks.length > 0 ? (
          <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {recentTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-zinc-500">
                    Project {t.project_id?.slice(0, 8)}
                    {t.due_date ? ` · due ${t.due_date}` : ""}
                  </p>
                </div>
                <StatusPill status={t.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            No tasks yet.{" "}
            <Link href="/projects" className="hover:underline">
              Create a project
            </Link>{" "}
            to get started.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    todo: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    review: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs capitalize ${
        colors[status] ?? colors.todo
      }`}
    >
      {status.replace("-", " ")}
    </span>
  );
}