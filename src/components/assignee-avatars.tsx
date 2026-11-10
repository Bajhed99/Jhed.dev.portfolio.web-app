"use client";

import { useEffect, useState } from "react";
import { getUsersByIds } from "@/lib/actions/users";
import type { AssignableUser } from "@/lib/actions/users";

type AssigneeAvatarsProps = {
  /** User IDs assigned to a task. */
  ids: string[];
};

const roleColors: Record<AssignableUser["role"], string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  client: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

/**
 * AssigneeAvatars — renders small pills for each assignee on a task.
 *
 * Resolves user IDs → emails via a server action (RLS enforced). Renders
 * nothing when there are no assignees.
 */
export default function AssigneeAvatars({ ids }: AssigneeAvatarsProps) {
  const [users, setUsers] = useState<AssignableUser[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUsersByIds(ids)
      .then((res) => {
        if (cancelled) return;
        if ("error" in res) {
          setUsers([]);
        } else {
          setUsers(res.users);
        }
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (ids.length === 0) return null;
  if (users === null) {
    return (
      <span className="text-xs text-zinc-400">{ids.length} assigned</span>
    );
  }
  if (users.length === 0) {
    return <span className="text-xs text-zinc-400">Unresolved</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {users.map((u) => (
        <span
          key={u.id}
          title={u.email}
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${roleColors[u.role]}`}
        >
          {u.email.split("@")[0]}
        </span>
      ))}
    </div>
  );
}