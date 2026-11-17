import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import ClientForm from "@/components/client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: client } = await supabase
    .from("clients")
    .select(
      "id, name, company, email, notes, visibility, show_name_publicly, show_company_publicly",
    )
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div>
      <Link
        href="/clients"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to clients
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">
        Edit {client.name}
      </h1>
      <ClientForm
        mode="edit"
        clientId={client.id}
        initial={{
          name: client.name,
          company: client.company ?? "",
          email: client.email ?? "",
          notes: client.notes ?? "",
          visibility: client.visibility,
          show_name_publicly: client.show_name_publicly,
          show_company_publicly: client.show_company_publicly,
        }}
      />
    </div>
  );
}
