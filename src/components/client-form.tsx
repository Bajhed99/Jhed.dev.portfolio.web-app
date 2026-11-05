"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, updateClient } from "@/lib/actions/clients";

type ActionState = { id: string } | { error: string } | null;

interface Props {
  mode: "create" | "edit";
  clientId?: string;
  initial?: Partial<{
    name: string;
    company: string;
    email: string;
    notes: string;
    visibility: "public" | "private";
  }>;
}

export default function ClientForm({ mode, initial }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
      const input = {
        name: (formData.get("name") as string) ?? "",
        email: (formData.get("email") as string) ?? "",
        company: (formData.get("company") as string) ?? "",
        notes: (formData.get("notes") as string) ?? "",
        visibility:
          (formData.get("visibility") as "public" | "private") ?? "private",
      };
      if (mode === "create") {
        return createClient(input);
      }
      return updateClient(clientId!, input);
    },
    null as ActionState,
  );

  useEffect(() => {
    if (state && "id" in state) {
      router.push("/clients");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initial?.name}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div>
        <label htmlFor="company" className="mb-1 block text-sm font-medium">
          Company
        </label>
        <input
          id="company"
          name="company"
          defaultValue={initial?.company}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={initial?.email}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={initial?.notes}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div>
        <label htmlFor="visibility" className="mb-1 block text-sm font-medium">
          Visibility
        </label>
        <select
          id="visibility"
          name="visibility"
          defaultValue={initial?.visibility ?? "private"}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>

      {state && "error" in state && state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          {pending ? "Saving…" : mode === "create" ? "Create client" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}