import Link from "next/link";
import { getPublishedShowcaseProjects } from "@/lib/showcase";
import Nav from "@/components/nav";

export default async function Home() {
  const projects = await getPublishedShowcaseProjects();

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
              Client engagements, project delivery, and web work. Each case study
              highlights the challenge, approach, and outcome.
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="mt-16 rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
              <p className="text-zinc-500">No published projects yet.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/showcase/${project.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div className="aspect-video bg-zinc-100 dark:bg-zinc-900">
                    {project.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.cover_image_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-semibold group-hover:underline">
                      {project.title}
                    </h2>
                    {project.client_company || project.client_name ? (
                      <p className="text-sm text-zinc-500">
                        {project.client_company || project.client_name}
                        {project.start_date
                          ? ` · ${new Date(project.start_date).getFullYear()}`
                          : ""}
                      </p>
                    ) : null}
                    <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {project.description || project.challenge || project.solution || ""}
                    </p>
                    {project.technologies.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {technology}
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
