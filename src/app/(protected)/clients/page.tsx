import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { toggleClientVisibility } from "@/lib/actions/clients";
import { ClientVisibilityToggle } from "@/components/visibility-toggle";

export const revalidate = 0;

export default async function ClientsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, company, email, visibility, owner_id")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-zinc-500">
            Manage client records. Public clients appear on the portfolio.
          </p>
        </div>
        <Link
          href="/clients/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          + New client
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {clients && clients.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/clients/${c.id}/edit`}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{c.company ?? "—"}</td>
                  <td className="px-4 py-3">
                    <ClientVisibilityToggle
                      id={c.id}
                      visibility={c.visibility}
                      action={toggleClientVisibility}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/clients/${c.id}/edit`}
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
            No clients yet.
          </p>
        )}
      </div>
    </div>
  );
}