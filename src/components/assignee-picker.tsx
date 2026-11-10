"use client";

import { useEffect, useState } from "react";
import { getAssignableUsers } from "@/lib/actions/users";
import type { AssignableUser } from "@/lib/actions/users";

type AssigneePickerProps = {
  /** Currently selected assignee user IDs. */
  value: string[];
  /** Called whenever the selection changes. */
  onChange: (ids: string[]) => void;
};

const roleColors: Record<AssignableUser["role"], string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  client: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

/**
 * AssigneePicker — multi-select of users who can be assigned to a task.
 *
 * Fetches the assignable user list once (server action enforces RLS), then
 * renders a scrollable checklist. Selecting "me" is a one-click shortcut.
 */
export default function AssigneePicker({ value, onChange }: AssigneePickerProps) {
  const [users, setUsers] = useState<AssignableUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAssignableUsers()
      .then((res) => {
        if (cancelled) return;
        if ("error" in res) {
          setError(res.error);
        } else {
          setUsers(res.users);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load users");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  }

  function toggleAll() {
    if (!users) return;
    const allSelected = users.every((u) => value.includes(u.id));
    onChange(allSelected ? [] : users.map((u) => u.id));
  }

  const selectedCount = value.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
      >
        <span>
          {selectedCount === 0 ? (
            <span className="text-zinc-400">Assignees</span>
          ) : selectedCount === 1 ? (
            <span>{users?.find((u) => u.id === value[0])?.email ?? "1 assignee"}</span>
          ) : (
            <span>{selectedCount} assignees</span>
          )}
        </span>
        <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {error ? (
            <p className="px-3 py-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : users === null ? (
            <p className="px-3 py-2 text-xs text-zinc-400">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-400">No assignable users</p>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleAll}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {users.every((u) => value.includes(u.id))
                  ? "Deselect all"
                  : "Select all"}
              </button>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              {users.map((u) => {
                const checked = value.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(u.id)}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-700"
                    />
                    <span className="flex-1 truncate text-sm">{u.email}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${roleColors[u.role]}`}
                    >
                      {u.role}
                    </span>
                  </label>
                );
              })}
            </>
          )}
        </div>
      ) : null}

      {/* Click outside to close */}
      {open ? (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}