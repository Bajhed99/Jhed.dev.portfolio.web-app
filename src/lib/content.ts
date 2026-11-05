import { promises as fs } from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

export interface ShowcaseProject {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  visibility: "public" | "private";
  images: string[];
  link?: string;
  client?: string;
  year?: number;
}

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value: unknown = line.slice(idx + 1).trim();
    if ((value as string).startsWith("[") && (value as string).endsWith("]")) {
      value = (value as string)
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    data[key] = value;
  }
  return { data, content: match[2] };
}

export async function getShowcaseProjects(): Promise<ShowcaseProject[]> {
  let files: string[];
  try {
    files = await fs.readdir(CONTENT_DIR);
  } catch {
    return [];
  }
  files = files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  const projects: ShowcaseProject[] = [];
  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, "");
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
    const { data } = parseFrontmatter(raw);

    projects.push({
      slug,
      title: (data.title as string) ?? slug,
      description: (data.description as string) ?? "",
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      visibility:
        (data.visibility as "public" | "private") ?? "public",
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      link: data.link as string | undefined,
      client: data.client as string | undefined,
      year: data.year as number | undefined,
    });
  }
  return projects.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

export async function getShowcaseProject(
  slug: string,
): Promise<ShowcaseProject | null> {
  const projects = await getShowcaseProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}