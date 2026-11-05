"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface VisibilityToggleProps {
  id: string;
  visibility: "public" | "private";
  action: (
    id: string,
    visibility: "public" | "private",
  ) => Promise<{ success: true } | { error: string }>;
}

export function ClientVisibilityToggle({
  id,
  visibility,
  action,
}: VisibilityToggleProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { success?: true } | { error?: string } | null) =>
      action(id, visibility === "public" ? "private" : "public"),
    null,
  );

  useEffect(() => {
    if (state && "success" in state) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="inline">
      <button
        type="submit"
        disabled={pending}
        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize transition disabled:opacity-50 ${
          visibility === "public"
            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
        title={visibility === "public" ? "Click to make private" : "Click to make public"}
      >
        {pending ? "…" : visibility}
      </button>
    </form>
  );
}