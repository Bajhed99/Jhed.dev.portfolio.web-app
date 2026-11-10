"use client";

import { useState } from "react";
import SubtaskList from "./subtask-list";
import AssigneeAvatars from "./assignee-avatars";

export type Task = {
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
  assignee_ids?: string[];
};

type TaskCardProps = {
  task: Task;
  projectId: string;
  onMove: (id: string, status: Task["status"]) => void;
  onDelete: (id: string) => void;
  /** Subtasks whose parent_id === task.id. Rendered nested under the card. */
  subtasks?: Task[];
  /** Optional: show an "Add subtask" button that opens the add-task form for this parent. */
  onAddSubtask?: (parentId: string) => void;
  /** Label shown next to the title when this task is itself a subtask. */
  parentTitle?: string | null;
};

const priorityColors: Record<Task["priority"], string> = {
  low: "text-zinc-400",
  medium: "text-blue-500",
  high: "text-red-500",
};

export default function TaskCard({
  task,
  projectId,
  onMove,
  onDelete,
  subtasks,
  onAddSubtask,
  parentTitle,
}: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const hasSubtasks = (subtasks?.length ?? 0) > 0;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-medium">{task.title}</h4>
          {parentTitle ? (
            <p className="mt-0.5 text-xs text-zinc-400">
              Subtask of{" "}
              <span className="font-medium text-zinc-500">{parentTitle}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1">
          {task.tags && task.tags.length > 0 ? (
            task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))
          ) : null}
        </div>
      </div>
      {task.description ? (
        <p className="mt-1 line-clamp-3 text-xs text-zinc-500">{task.description}</p>
      ) : null}
      <AssigneeAvatars ids={task.assignee_ids ?? []} />
      {task.due_date ? (
        <p className="mt-2 text-xs text-zinc-400">
          Due {new Date(task.due_date).toLocaleDateString()}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        <select
          value={task.status}
          onChange={(e) =>
            onMove(task.id, e.target.value as "todo" | "in-progress" | "review" | "done")
          }
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.estimate_hours != null ? (
            <span className="text-xs text-zinc-400">
              {task.estimate_hours}h
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="text-xs text-zinc-400 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Subtask nesting + add-subtask row */}
      <div className="mt-3">
        {onAddSubtask ? (
          <button
            type="button"
            onClick={() => onAddSubtask(task.id)}
            className="w-full rounded-md border border-dashed border-zinc-300 px-2 py-1.5 text-xs text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:hover:text-zinc-300"
          >
            + Add subtask
          </button>
        ) : null}
        {hasSubtasks ? (
          <div className="mt-2">
            <SubtaskList
              subtasks={subtasks!}
              projectId={projectId}
              onMove={onMove}
              onDelete={onDelete}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}