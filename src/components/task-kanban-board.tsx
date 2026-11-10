"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import TaskCard, { type Task } from "./task-card";

type ColumnStatus = Task["status"];

const COLUMNS: { key: ColumnStatus; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

export default function TaskKanbanBoard({
  projectId,
  tasks,
  onAddSubtask,
}: {
  projectId: string;
  tasks: Task[];
  onAddSubtask?: (parentId: string, parentTitle: string) => void;
}) {
  const router = useRouter();
  const [local, setLocal] = useState(tasks);

  useEffect(() => {
    setLocal(tasks);
  }, [tasks]);

  // Children grouped by parent_id for nested rendering.
  const childrenById = new Map<string, Task[]>();
  for (const t of local) {
    if (t.parent_id) {
      const list = childrenById.get(t.parent_id) ?? [];
      list.push(t);
      childrenById.set(t.parent_id, list);
    }
  }

  async function move(taskId: string, status: ColumnStatus) {
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
              {local.filter((t) => t.status === col.key && t.parent_id === null).length}
            </span>
          </div>
          <div className="flex flex-col gap-2 px-3 pb-3">
            {local
              .filter((t) => t.status === col.key && t.parent_id === null)
              .sort((a, b) => a.order - b.order)
              .map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  projectId={projectId}
                  onMove={move}
                  onDelete={remove}
                  subtasks={childrenById.get(t.id)}
                  onAddSubtask={
                    onAddSubtask
                      ? () => onAddSubtask(t.id, t.title)
                      : undefined
                  }
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}