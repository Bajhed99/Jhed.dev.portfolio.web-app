"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/lib/actions/tasks";

export default function AddTaskForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      createTask({
        projectId,
        title: (formData.get("title") as string) ?? "",
        description: (formData.get("description") as string) ?? "",
        status: "todo",
        priority:
          (formData.get("priority") as "low" | "medium" | "high") ?? "medium",
        dueDate: (formData.get("dueDate") as string) ?? "",
        assigneeIds: [],
      }),
    null,
  );

  useEffect(() => {
    if (state && "id" in state) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="min-w-[200px] flex-1">
        <label
          htmlFor="title"
          className="mb-1 block text-xs font-medium text-zinc-500"
        >
          New task
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="Task title"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label
          htmlFor="priority"
          className="mb-1 block text-xs font-medium text-zinc-500"
        >
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="low">Low</option>
          <option value="medium" selected>
            Medium
          </option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="dueDate"
          className="mb-1 block text-xs font-medium text-zinc-500"
        >
          Due
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {state && "error" in state && state.error ? (
        <p className="w-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}