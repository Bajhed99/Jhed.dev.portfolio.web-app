import Link from "next/link";
import { getShowcaseProjects } from "@/lib/content";
import Nav from "@/components/nav";

export default async function Home() {
  const projects = await getShowcaseProjects();
  const publicProjects = projects.filter((p) => p.visibility === "public");

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Work I ship.
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Client engagements, project delivery, and web work. Some projects are
              public; others are shared privately with the client.
            </p>
          </div>

          {publicProjects.length === 0 ? (
            <div className="mt-16 rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
              <p className="text-zinc-500">
                No public projects yet. Showcase entries are added as markdown files
                under{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                  content/projects/
                </code>
                .
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publicProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/showcase/${project.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div className="aspect-video bg-zinc-100 dark:bg-zinc-900">
                    {project.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-semibold group-hover:underline">
                      {project.title}
                    </h2>
                    {project.client ? (
                      <p className="text-sm text-zinc-500">
                        {project.client}
                        {project.year ? ` · ${project.year}` : ""}
                      </p>
                    ) : null}
                    <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {project.description}
                    </p>
                    {project.tags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}