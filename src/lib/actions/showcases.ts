"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase";

const ExternalLinkSchema = z.object({
  label: z.string().trim().min(1).max(100),
  url: z.string().trim().url().max(2000),
});

const ShowcaseSchema = z.object({
  projectId: z.string().uuid(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  coverImageUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
  galleryImages: z.array(z.string().trim().url().max(2000)).max(30),
  technologies: z.array(z.string().trim().min(1).max(80)).max(50),
  services: z.array(z.string().trim().min(1).max(80)).max(50),
  challenge: z.string().max(10000).optional().or(z.literal("")),
  solution: z.string().max(10000).optional().or(z.literal("")),
  outcomes: z.string().max(10000).optional().or(z.literal("")),
  contentMarkdown: z.string().max(50000).optional().or(z.literal("")),
  externalLinks: z.array(ExternalLinkSchema).max(20),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ShowcaseInput = z.infer<typeof ShowcaseSchema>;

export type ShowcaseActionResult =
  | { success: true }
  | { error: string };

export async function saveProjectShowcase(
  input: ShowcaseInput,
): Promise<ShowcaseActionResult> {
  await requireAdmin();

  const parsed = ShowcaseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid showcase data." };
  }

  const value = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("project_showcases").upsert(
    {
      project_id: value.projectId,
      slug: value.slug,
      cover_image_url: value.coverImageUrl || null,
      gallery_images: value.galleryImages,
      technologies: value.technologies,
      services: value.services,
      challenge: value.challenge || null,
      solution: value.solution || null,
      outcomes: value.outcomes || null,
      content_markdown: value.contentMarkdown || null,
      external_links: value.externalLinks,
      seo_title: value.seoTitle || null,
      seo_description: value.seoDescription || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "project_id" },
  );

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/showcase");
  revalidatePath(`/showcase/${value.slug}`);
  revalidatePath("/projects");
  revalidatePath(`/projects/${value.projectId}`);
  return { success: true };
}

export async function setShowcasePublished(
  projectId: string,
  published: boolean,
): Promise<ShowcaseActionResult> {
  await requireAdmin();

  if (!z.string().uuid().safeParse(projectId).success) {
    return { error: "Invalid project ID." };
  }

  const supabase = await createSupabaseServerClient();

  if (published) {
    const { data: showcase, error: showcaseError } = await supabase
      .from("project_showcases")
      .select("slug")
      .eq("project_id", projectId)
      .maybeSingle();

    if (showcaseError) return { error: showcaseError.message };
    if (!showcase) {
      return { error: "Create and save the showcase details before publishing this project." };
    }
  }

  const { error } = await supabase
    .from("projects")
    .update({ showcase_published: published })
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/showcase");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
