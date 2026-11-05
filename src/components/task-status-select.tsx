"use client";

import { ChangeEvent } from "react";

const OPTIONS: { key: "todo" | "in-progress" | "review" | "done"; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

export function TaskStatusSelect({
  value,
  onChange,
}: {
  value: "todo" | "in-progress" | "review" | "done";
  onChange: (status: "todo" | "in-progress" | "review" | "done") => void;
}) {
  return (
    <select
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
        onChange(e.target.value as "todo" | "in-progress" | "review" | "done")
      }
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
    >
      {OPTIONS.map((o) => (
        <option key={o.key} value={o.key}>
          {o.label}
        </option>
      ))}
    </select>
  );
}