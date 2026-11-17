"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, updateClient } from "@/lib/actions/clients";

type ActionState = { id: string } | { success: true } | { error: string } | null;

interface Props {
  mode: "create" | "edit";
  clientId?: string;
  initial?: Partial<{
    name: string;
    company: string;
    email: string;
    notes: string;
    visibility: "public" | "private";
    show_name_publicly: boolean;
    show_company_publicly: boolean;
  }>;
}

export default function ClientForm({ mode, clientId, initial }: Props) {
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
        show_name_publicly: formData.get("show_name_publicly") === "on",
        show_company_publicly: formData.get("show_company_publicly") === "on",
      };
      if (mode === "create") {
        return createClient(input);
      }
      return updateClient(clientId!, input);
    },
    null as ActionState,
  );

  useEffect(() => {
    if (state && ("id" in state || "success" in state)) {
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
          Client record visibility
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
        <p className="mt-1 text-xs text-zinc-500">
          Only public client records can be considered for public portfolio display.
        </p>
      </div>

      <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-medium">Public display preferences</legend>
        <p className="text-sm text-zinc-500">
          Choose which client details may appear on your public portfolio. Both are
          disabled by default.
        </p>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="show_name_publicly"
            defaultChecked={initial?.show_name_publicly ?? false}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300"
          />
          <span>
            <span className="block font-medium">Show client name publicly</span>
            <span className="text-xs text-zinc-500">
              Allows the client&apos;s name to appear on public project pages.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="show_company_publicly"
            defaultChecked={initial?.show_company_publicly ?? false}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300"
          />
          <span>
            <span className="block font-medium">Show company name publicly</span>
            <span className="text-xs text-zinc-500">
              Allows the company name to appear on public project pages.
            </span>
          </span>
        </label>
      </fieldset>

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