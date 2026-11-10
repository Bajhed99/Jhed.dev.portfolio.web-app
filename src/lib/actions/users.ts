"use server";

import { createSupabaseServerClient } from "../supabase";
import { requireAuth } from "../auth";

export type AssignableUser = {
  id: string;
  email: string;
  role: "admin" | "client";
  client_id: string | null;
};

/**
 * getAssignableUsers — returns users a task creator may assign tasks to.
 *
 * RLS on `public.users` already scopes this: admins see everyone, client
 * users see only their own row. We don't re-filter here so the policies stay
 * the single source of truth.
 */
export async function getAssignableUsers(): Promise<
  { users: AssignableUser[] } | { error: string }
> {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, client_id")
    .order("email", { ascending: true });

  if (error) return { error: error.message };
  return { users: (data as AssignableUser[]) ?? [] };
}

/**
 * getUsersByIds — resolves a list of user IDs to their email/role.
 *
 * Used by task cards to render assignee labels. RLS on `public.users`
 * scopes the result; an unauthenticated caller gets nothing.
 */
export async function getUsersByIds(
  ids: string[],
): Promise<{ users: AssignableUser[] } | { error: string }> {
  if (!ids.length) return { users: [] };
  await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, client_id")
    .in("id", ids)
    .order("email", { ascending: true });

  if (error) return { error: error.message };
  return { users: (data as AssignableUser[]) ?? [] };
}