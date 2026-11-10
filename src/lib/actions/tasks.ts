"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "../supabase";
import { requireAdmin } from "../auth";

const TaskSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(5000).optional().or(z.literal("")),
  status: z.enum(["todo", "in-progress", "review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional().or(z.literal("")),
  assigneeIds: z.array(z.string()).default([]),
  parentId: z.string().optional().or(z.null()),
  tags: z.array(z.string()).default([]),
  estimateHours: z.number().optional(),
});

export type TaskInput = z.infer<typeof TaskSchema>;

export interface ActionError {
  error: string;
}

export async function createTask(
  input: TaskInput,
): Promise<{ id: string } | ActionError> {
  const user = await requireAdmin();
  const parsed = TaskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.dueDate || null,
      assignee_ids: parsed.data.assigneeIds,
      parent_id: parsed.data.parentId || null,
      tags: parsed.data.tags,
      estimate_hours: parsed.data.estimateHours || null,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { id: data.id };
}

export async function updateTask(
  id: string,
  input: TaskInput,
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const parsed = TaskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      project_id: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.dueDate || null,
      assignee_ids: parsed.data.assigneeIds,
      parent_id: parsed.data.parentId || null,
      tags: parsed.data.tags,
      estimate_hours: parsed.data.estimateHours || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath(`/tasks/${id}`);
  return { success: true };
}

export async function updateTaskStatus(
  id: string,
  status: "todo" | "in-progress" | "review" | "done",
  projectId: string,
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteTask(
  id: string,
  projectId: string,
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}