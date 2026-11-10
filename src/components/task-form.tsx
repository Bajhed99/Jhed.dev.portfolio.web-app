"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTask } from "@/lib/actions/tasks";
import AssigneePicker from "./assignee-picker";

type Task = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  parent_id: string | null;
  tags: string[];
  assignee_ids?: string[];
};

export default function TaskForm({
  task,
  siblings = [],
}: {
  task: Task;
  siblings?: { id: string; title: string }[];
}) {
  const router = useRouter();
  const projectId = task.project_id ?? "";
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task.assignee_ids ?? []);
  const [state, formAction, pending] = useActionState(
    async (_prev: { success?: true } | { error?: string } | null, formData: FormData) =>
      updateTask(task.id, {
        projectId,
        title: (formData.get("title") as string) ?? "",
        description: (formData.get("description") as string) ?? "",
        status:
          (formData.get("status") as
            | "todo"
            | "in-progress"
            | "review"
            | "done") ?? "todo",
        priority:
          (formData.get("priority") as "low" | "medium" | "high") ?? "medium",
        dueDate: (formData.get("dueDate") as string) ?? "",
        assigneeIds,
        parentId: (formData.get("parentId") as string) ?? "",
        tags: (formData.get("tags") as string)
          ? (formData.get("tags") as string)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        estimateHours: Number(formData.get("estimateHours") as string) || undefined,
      }),
    null as { success?: true } | { error?: string } | null,
  );

  useEffect(() => {
    if (state && "success" in state) {
      router.push(`/projects/${task.project_id}`);
    }
  }, [state, router, task.project_id]);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={task.title}
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
          defaultValue={task.description ?? ""}
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
            defaultValue={task.status}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={task.priority}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="mb-1 block text-sm font-medium">
          Due date
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={task.due_date ?? ""}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="parentId" className="mb-1 block text-sm font-medium">
            Parent task (subtask)
          </label>
          <select
            id="parentId"
            name="parentId"
            defaultValue={task.parent_id ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">— None —</option>
            {siblings.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="estimateHours" className="mb-1 block text-sm font-medium">
            Estimate (hours)
          </label>
          <input
            id="estimateHours"
            name="estimateHours"
            type="number"
            step="0.5"
            min="0"
            defaultValue=""
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="mb-1 block text-sm font-medium">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={(task.tags ?? []).join(", ")}
          placeholder="backend, urgent, design"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Assignees</label>
        <AssigneePicker value={assigneeIds} onChange={setAssigneeIds} />
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
          {pending ? "Saving…" : "Save changes"}
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