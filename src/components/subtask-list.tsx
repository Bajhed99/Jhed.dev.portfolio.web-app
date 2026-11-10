"use client";

import { useState } from "react";

export type Subtask = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  order: number;
  parent_id: string | null;
  tags: string[];
  estimate_hours?: number | null;
};

const statusColors: Record<Subtask["status"], string> = {
  todo: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  review: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

function SubtaskRow({
  subtask,
  projectId,
  onMove,
  onDelete,
  onAddSubtask,
  children,
}: {
  subtask: Subtask;
  projectId: string;
  onMove: (id: string, status: Subtask["status"]) => void;
  onDelete: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
  children?: Subtask[];
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!children;

  return (
    <li className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <select
          value={subtask.status}
          onChange={(e) =>
            onMove(subtask.id, e.target.value as "todo" | "in-progress" | "review" | "done")
          }
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[subtask.status]}`}
        >
          {subtask.status.replace("-", " ")}
        </span>
        <span className="text-sm font-medium">{subtask.title}</span>
        {subtask.due_date ? (
          <span className="ml-auto text-xs text-zinc-400">
            Due {new Date(subtask.due_date).toLocaleDateString()}
          </span>
        ) : null}
        {subtask.estimate_hours != null ? (
          <span className="text-xs text-zinc-400">{subtask.estimate_hours}h</span>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(subtask.id)}
          className="text-xs text-zinc-400 hover:text-red-600"
        >
          Delete
        </button>
      </div>
      {onAddSubtask ? (
        <button
          type="button"
          onClick={() => onAddSubtask(subtask.id)}
          className="mt-2 w-full rounded-md border border-dashed border-zinc-300 px-2 py-1 text-xs text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:hover:text-zinc-300"
        >
          + Add sub-subtask
        </button>
      ) : null}
      {hasChildren ? (
        <div className="mt-2 pl-2">
          <SubtaskList
            subtasks={children}
            projectId={projectId}
            onMove={onMove}
            onDelete={onDelete}
            onAddSubtask={onAddSubtask}
          />
        </div>
      ) : null}
    </li>
  );
}

export default function SubtaskList({
  subtasks,
  projectId,
  onMove,
  onDelete,
  onAddSubtask,
  allSubtasks = [],
}: {
  subtasks: Subtask[];
  projectId: string;
  onMove: (id: string, status: Subtask["status"]) => void;
  onDelete: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
  /** Full subtask set (used to find children of each subtask). */
  allSubtasks?: Subtask[];
}) {
  const childrenById = new Map<string, Subtask[]>();
  for (const s of allSubtasks) {
    if (s.parent_id) {
      const list = childrenById.get(s.parent_id) ?? [];
      list.push(s);
      childrenById.set(s.parent_id, list);
    }
  }

  return (
    <ul className="mt-2 space-y-1.5">
      {subtasks
        .sort((a, b) => a.order - b.order)
        .map((s) => (
          <SubtaskRow
            key={s.id}
            subtask={s}
            projectId={projectId}
            onMove={onMove}
            onDelete={onDelete}
            onAddSubtask={onAddSubtask}
            children={childrenById.get(s.id)}
          />
        ))}
    </ul>
  );
}