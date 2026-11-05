import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/nav";
import { getShowcaseProject } from "@/lib/content";

export function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: `${params.slug} — jhed.dev` };
}

export default async function ShowcasePage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getShowcaseProject(params.slug);
  if (!project || project.visibility !== "public") notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-12">
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
          {project.client ? (
            <p className="mt-2 text-zinc-500">
              {project.client}
              {project.year ? ` · ${project.year}` : ""}
            </p>
          ) : null}
          {project.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
              {project.description}
            </p>
          </div>

          {project.images.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {project.images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${project.title} ${i + 1}`}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
                />
              ))}
            </div>
          ) : null}

          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
            >
              View live →
            </a>
          ) : null}
        </article>
      </main>
    </>
  );
}