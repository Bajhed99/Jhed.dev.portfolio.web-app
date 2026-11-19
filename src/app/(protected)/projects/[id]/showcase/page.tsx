import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase";
import ShowcaseForm from "@/components/showcase-form";

export default async function ProjectShowcaseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: project, error: projectError }, { data: showcase, error: showcaseError }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, showcase_published")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("project_showcases")
      .select("*")
      .eq("project_id", id)
      .maybeSingle(),
  ]);

  if (projectError || showcaseError) {
    return <p className="text-sm text-red-600">Unable to load showcase editor.</p>;
  }
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl">
      <Link href={`/projects/${id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        ← Back to project
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Portfolio showcase</h1>
      <p className="mt-1 text-sm text-zinc-500">{project.title}</p>

      <ShowcaseForm
        projectId={project.id}
        published={project.showcase_published}
        initial={{
          slug: showcase?.slug ?? "",
          coverImageUrl: showcase?.cover_image_url ?? "",
          galleryImages: showcase?.gallery_images ?? [],
          technologies: showcase?.technologies ?? [],
          services: showcase?.services ?? [],
          challenge: showcase?.challenge ?? "",
          solution: showcase?.solution ?? "",
          outcomes: showcase?.outcomes ?? "",
          contentMarkdown: showcase?.content_markdown ?? "",
          externalLinks: Array.isArray(showcase?.external_links) ? showcase.external_links as { label: string; url: string }[] : [],
          seoTitle: showcase?.seo_title ?? "",
          seoDescription: showcase?.seo_description ?? "",
        }}
      />
    </main>
  );
}
