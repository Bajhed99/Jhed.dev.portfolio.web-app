"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/lib/actions/projects";

type ActionState = { id: string } | { success: true } | { error: string } | null;

interface Props {
  mode: "create" | "edit";
  projectId?: string;
  initial?: Partial<{
    title: string;
    description: string;
    status: "active" | "completed" | "on-hold" | "cancelled";
    startDate: string;
    endDate: string;
    budget: string;
    clientId: string;
    visibility: "public" | "private";
  }>;
}

export default function ProjectForm({ mode, projectId, initial }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
      const budgetRaw = (formData.get("budget") as string) ?? "";
      const input = {
        title: (formData.get("title") as string) ?? "",
        description: (formData.get("description") as string) ?? "",
        status:
          (formData.get("status") as
            | "active"
            | "completed"
            | "on-hold"
            | "cancelled"
            | null) ?? null,
        startDate: (formData.get("startDate") as string) ?? "",
        endDate: (formData.get("endDate") as string) ?? "",
        budget: budgetRaw === "" ? undefined : Number(budgetRaw),
        clientId: (formData.get("clientId") as string) ?? "",
        visibility:
          (formData.get("visibility") as "public" | "private") ?? "private",
      };
      if (mode === "create") {
        return createProject(input);
      }
      return updateProject(projectId!, input);
    },
    null as ActionState,
  );

  useEffect(() => {
    if (state && "id" in state) {
      router.push(`/projects/${(state as any).id}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initial?.title}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ""}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "active"}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="clientId" className="mb-1 block text-sm font-medium">
            Client
          </label>
          <input
            id="clientId"
            name="clientId"
            defaultValue={initial?.clientId ?? ""}
            placeholder="Client UUID"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={initial?.startDate ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={initial?.endDate ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label htmlFor="budget" className="mb-1 block text-sm font-medium">
            Budget
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.budget ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
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
          {pending ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
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