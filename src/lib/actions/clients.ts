"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "../supabase";
import { requireAdmin } from "../auth";

const ClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  visibility: z.enum(["public", "private"]).default("private"),
});

export type ClientInput = z.infer<typeof ClientSchema>;

export interface ActionError {
  error: string;
}

export async function createClient(
  input: ClientInput,
): Promise<{ id: string } | ActionError> {
  const user = await requireAdmin();
  const parsed = ClientSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
      company: parsed.data.company || null,
      notes: parsed.data.notes || null,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/clients");
  revalidatePath("/");
  return { id: data.id };
}

export async function updateClient(
  id: string,
  input: ClientInput,
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const parsed = ClientSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("clients")
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
      company: parsed.data.company || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteClient(
  id: string,
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/clients");
  revalidatePath("/");
  return { success: true };
}

export async function toggleClientVisibility(
  id: string,
  visibility: "public" | "private",
): Promise<{ success: true } | ActionError> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("clients")
    .update({ visibility })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/clients");
  revalidatePath("/");
  return { success: true };
}