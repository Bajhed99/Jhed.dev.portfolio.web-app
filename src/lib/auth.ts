import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase";
import type { Database } from "./database.types";

export type AppRole = "admin" | "client";

export interface SessionUser {
  id: string;
  email: string;
  role: AppRole;
  clientId: string | null;
}

/**
 * getCurrentUser — the ONLY place session verification lives.
 * Verifies the JWT claims server-side (never trust getSession()).
 * Returns null when there is no valid session.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const userId = data.claims.sub as string;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, role, client_id")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role as AppRole,
    clientId: profile.client_id,
  };
}

/** Guard for Server Components: redirect to login when unauthenticated. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Admin-only pages. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "admin") redirect("/");
  return user;
}

/**
 * Client-scoped pages. A client-role user may only access their own client record.
 * Admins can access any client.
 */
export async function requireClientAccess(clientId: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role === "admin") return user;
  if (user.clientId !== clientId) redirect("/");
  return user;
}

/** Sign in with email + password. */
export async function signInWithPassword(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}