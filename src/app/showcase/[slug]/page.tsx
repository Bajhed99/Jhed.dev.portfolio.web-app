import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/nav";
import { getPublishedShowcaseProject } from "@/lib/showcase";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedShowcaseProject(slug);

  if (!project) return { title: "Project not found — jhed.dev" };

  return {
    title: project.seo_title || `${project.title} — jhed.dev`,
    description:
      project.seo_description ||
      project.description ||
      project.challenge ||
      undefined,
  };
}

export default async function ShowcasePage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedShowcaseProject(slug);
  if (!project) notFound();

  const externalLinks = Array.isArray(project.external_links)
    ? project.external_links.filter(
        (item): item is { label: string; url: string } =>
          typeof item === "object" &&
          item !== null &&
          "label" in item &&
          "url" in item &&
          typeof item.label === "string" &&
          typeof item.url === "string",
      )
    : [];

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Back to work
        </Link>

        <article className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          {project.client_company || project.client_name ? (
            <p className="mt-2 text-zinc-500">
              {project.client_company || project.client_name}
              {project.start_date
                ? ` · ${new Date(project.start_date).getFullYear()}`
                : ""}
            </p>
          ) : null}

          {project.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="mt-8 w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
            />
          ) : null}

          {project.services.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Services
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.services.map((service) => (
                  <span key={service} className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800">
                    {service}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {project.technologies.length > 0 ? (
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Technologies
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.technologies.map((technology) => (
                  <span key={technology} className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800">
                    {technology}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {project.challenge ? <CaseStudySection title="The challenge" content={project.challenge} /> : null}
          {project.solution ? <CaseStudySection title="The solution" content={project.solution} /> : null}
          {project.outcomes ? <CaseStudySection title="Outcomes" content={project.outcomes} /> : null}

          {project.content_markdown ? (
            <section className="mt-8">
              <div className="prose prose-zinc max-w-none whitespace-pre-wrap dark:prose-invert">
                {project.content_markdown}
              </div>
            </section>
          ) : null}

          {project.gallery_images.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">Project gallery</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {project.gallery_images.map((src, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`${project.title} gallery image ${index + 1}`}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {externalLinks.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">Links</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {externalLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </main>
    </>
  );
}

function CaseStudySection({ title, content }: { title: string; content: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
        {content}
      </p>
    </section>
  );
}
