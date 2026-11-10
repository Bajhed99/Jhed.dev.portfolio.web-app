import Link from "next/link";
import ClientForm from "@/components/client-form";

export default function NewClientPage() {
  return (
    <div>
      <Link
        href="/clients"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to clients
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">New client</h1>
      <ClientForm mode="create" />
    </div>
  );
}