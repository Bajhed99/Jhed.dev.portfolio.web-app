"use client";

import { useState } from "react";
import TaskKanbanBoard from "./task-kanban-board";
import TaskBoard from "./task-board";
import AddTaskForm from "./add-task-form";
import type { Task } from "./task-card";

type ViewMode = "kanban" | "list";

/**
 * TaskBoardWrapper — client shell for a project's task view.
 *
 * It owns the "active parent" state so a user can click "+ Add subtask"
 * anywhere on the board (kanban or list) and the inline add-task form at the
 * bottom of the page flips into subtask-creation mode, showing which parent
 * it belongs to. This is the ClickUp-style flow: click a task → add a child.
 */
export default function TaskBoardWrapper({
  projectId,
  tasks,
  viewMode = "kanban",
}: {
  projectId: string;
  tasks: Task[];
  viewMode?: ViewMode;
}) {
  const [activeParent, setActiveParent] = useState<{
    id: string;
    title: string;
  } | null>(null);

  function handleAddSubtask(parentId: string, parentTitle: string) {
    setActiveParent({ id: parentId, title: parentTitle });
    // Scroll the inline form into view on small screens.
    if (typeof window !== "undefined") {
      const el = document.getElementById("inline-add-task-form");
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function clearParent() {
    setActiveParent(null);
  }

  return (
    <div>
      {viewMode === "kanban" ? (
        <TaskKanbanBoard
          projectId={projectId}
          tasks={tasks}
          onAddSubtask={handleAddSubtask}
        />
      ) : (
        <TaskBoard
          projectId={projectId}
          tasks={tasks}
          onAddSubtask={handleAddSubtask}
        />
      )}

      <div className="mt-6" id="inline-add-task-form">
        <AddTaskForm
          projectId={projectId}
          parentId={activeParent?.id}
          defaultParentTitle={activeParent?.title ?? undefined}
        />
        {activeParent ? (
          <button
            type="button"
            onClick={clearParent}
            className="mt-2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ← Add a top-level task instead
          </button>
        ) : null}
      </div>
    </div>
  );
}