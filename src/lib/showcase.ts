import { createSupabaseServerClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type PublicShowcaseProject =
  Database["public"]["Views"]["public_projects"]["Row"];

export async function getPublishedShowcaseProjects(): Promise<PublicShowcaseProject[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("public_projects")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Failed to load published showcase projects:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getPublishedShowcaseProject(
  slug: string,
): Promise<PublicShowcaseProject | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("public_projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load showcase project:", error.message);
    return null;
  }

  return data;
}
