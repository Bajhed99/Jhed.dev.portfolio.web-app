"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "../supabase";
import { requireAdmin } from "../auth";

const ProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(10000).optional().or(z.literal("")),
  status: z
    .enum(["active", "completed", "on-hold", "cancelled"])
    .optional()
    .nullable(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().min(0).optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
  visibility: z.enum(["public", "private"]).default("private"),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

export interface ActionError {
  error: string;
}

export async function createProject(
  input: ProjectInput,
): Promise<{ id: string } | ActionError> {
  const user = await requireAdmin();
  const parsed = ProjectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status ?? null,
      start_date: parsed.data.startDate || null,
      end_date: parsed.data.endDate || null,
      budget:
        parsed.data.budget === "" || parsed.data.budget == null
          ? null
          : parsed.data.budget,
      client_id: parsed.data.clientId || null,
      owner_id: user.id,
      visibility: parsed.data.visibility,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/projects");
  revalidatePath("/");
  return { id: data.id };
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const parsed = ProjectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status ?? null,
      start_date: parsed.data.startDate || null,
      end_date: parsed.data.endDate || null,
      budget:
        parsed.data.budget === "" || parsed.data.budget == null
          ? null
          : parsed.data.budget,
      client_id: parsed.data.clientId || null,
      visibility: parsed.data.visibility,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(
  id: string,
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  revalidatePath("/");
  return { success: true };
}

export async function toggleProjectVisibility(
  id: string,
  visibility: "public" | "private",
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("projects")
    .update({ visibility })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  revalidatePath("/");
  return { success: true };
}