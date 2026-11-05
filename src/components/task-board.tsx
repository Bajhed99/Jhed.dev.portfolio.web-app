"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import { TaskStatusSelect } from "./task-status-select";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  order: number;
};

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

export default function TaskBoard({
  projectId,
  tasks,
}: {
  projectId: string;
  tasks: Task[];
}) {
  const router = useRouter();
  const [local, setLocal] = useState(tasks);

  useEffect(() => {
    setLocal(tasks);
  }, [tasks]);

  async function move(taskId: string, status: Task["status"]) {
    const prev = local;
    setLocal((t) =>
      t.map((x) => (x.id === taskId ? { ...x, status } : x)),
    );
    const res = await updateTaskStatus(taskId, status, projectId);
    if (res && "error" in res) {
      setLocal(prev);
    } else {
      router.refresh();
    }
  }

  async function remove(taskId: string) {
    const prev = local;
    setLocal((t) => t.filter((x) => x.id !== taskId));
    const res = await deleteTask(taskId, projectId);
    if (res && "error" in res) {
      setLocal(prev);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {col.label}
            </h3>
            <span className="text-xs text-zinc-400">
              {local.filter((t) => t.status === col.key).length}
            </span>
          </div>
          <div className="flex flex-col gap-2 px-3 pb-3">
            {local
              .filter((t) => t.status === col.key)
              .sort((a, b) => a.order - b.order)
              .map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  projectId={projectId}
                  onMove={move}
                  onDelete={remove}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({
  task,
  projectId,
  onMove,
  onDelete,
}: {
  task: Task;
  projectId: string;
  onMove: (id: string, status: Task["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const priorityColors: Record<Task["priority"], string> = {
    low: "text-zinc-400",
    medium: "text-blue-500",
    high: "text-red-500",
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium">{task.title}</h4>
        <span className={`text-xs ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description ? (
        <p className="mt-1 line-clamp-3 text-xs text-zinc-500">
          {task.description}
        </p>
      ) : null}
      {task.due_date ? (
        <p className="mt-2 text-xs text-zinc-400">
          Due {new Date(task.due_date).toLocaleDateString()}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        <TaskStatusSelect
          value={task.status}
          onChange={(s) => onMove(task.id, s)}
        />
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="text-xs text-zinc-400 hover:text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}