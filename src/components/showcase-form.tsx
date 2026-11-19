"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  saveProjectShowcase,
  setShowcasePublished,
  type ShowcaseInput,
} from "@/lib/actions/showcases";

type InitialData = Omit<ShowcaseInput, "projectId">;

export default function ShowcaseForm({
  projectId,
  published,
  initial,
}: {
  projectId: string;
  published: boolean;
  initial: InitialData;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(formData: FormData) {
    setSaving(true);
    setMessage(null);
    setError(null);

    const externalLinksRaw = String(formData.get("externalLinks") ?? "[]");
    let externalLinks: ShowcaseInput["externalLinks"];
    try {
      externalLinks = JSON.parse(externalLinksRaw);
      if (!Array.isArray(externalLinks)) throw new Error("Expected a JSON array.");
    } catch {
      setError("External links must be valid JSON in array format.");
      setSaving(false);
      return;
    }

    const input: ShowcaseInput = {
      projectId,
      slug: String(formData.get("slug") ?? ""),
      coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
      galleryImages: splitLines(formData.get("galleryImages")),
      technologies: splitLines(formData.get("technologies")),
      services: splitLines(formData.get("services")),
      challenge: String(formData.get("challenge") ?? ""),
      solution: String(formData.get("solution") ?? ""),
      outcomes: String(formData.get("outcomes") ?? ""),
      contentMarkdown: String(formData.get("contentMarkdown") ?? ""),
      externalLinks,
      seoTitle: String(formData.get("seoTitle") ?? ""),
      seoDescription: String(formData.get("seoDescription") ?? ""),
    };

    const result = await saveProjectShowcase(input);
    if ("error" in result) setError(result.error);
    else {
      setMessage("Showcase details saved.");
      router.refresh();
    }
    setSaving(false);
  }

  async function handlePublish() {
    setPublishing(true);
    setMessage(null);
    setError(null);
    const result = await setShowcasePublished(projectId, !published);
    if ("error" in result) setError(result.error);
    else {
      setMessage(published ? "Showcase unpublished." : "Showcase published.");
      router.refresh();
    }
    setPublishing(false);
  }

  return (
    <form action={handleSave} className="space-y-6">
      <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Publication</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Publication is separate from the project&apos;s CRM visibility setting.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={published ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-800" : "rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}>
            {published ? "Published" : "Unpublished"}
          </span>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || saving}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            {publishing ? "Updating…" : published ? "Unpublish showcase" : "Publish showcase"}
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Basic details</h2>
        <Field label="Slug" name="slug" required defaultValue={initial.slug} placeholder="project-name" />
        <Field label="Cover image URL" name="coverImageUrl" defaultValue={initial.coverImageUrl ?? ""} placeholder="https://..." />
        <Textarea label="Gallery image URLs (one per line)" name="galleryImages" defaultValue={initial.galleryImages.join("\n")} rows={4} />
        <Textarea label="Technologies (one per line)" name="technologies" defaultValue={initial.technologies.join("\n")} rows={3} />
        <Textarea label="Services (one per line)" name="services" defaultValue={initial.services.join("\n")} rows={3} />
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Case study</h2>
        <Textarea label="Challenge" name="challenge" defaultValue={initial.challenge ?? ""} rows={4} />
        <Textarea label="Solution" name="solution" defaultValue={initial.solution ?? ""} rows={4} />
        <Textarea label="Outcomes" name="outcomes" defaultValue={initial.outcomes ?? ""} rows={4} />
        <Textarea label="Full case study (Markdown)" name="contentMarkdown" defaultValue={initial.contentMarkdown ?? ""} rows={12} />
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Links and SEO</h2>
        <Textarea
          label="External links (JSON array)"
          name="externalLinks"
          defaultValue={JSON.stringify(initial.externalLinks, null, 2)}
          rows={5}
        />
        <Field label="SEO title" name="seoTitle" defaultValue={initial.seoTitle ?? ""} />
        <Textarea label="SEO description" name="seoDescription" defaultValue={initial.seoDescription ?? ""} rows={3} />
      </section>

      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-green-700">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving || publishing} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black">
          {saving ? "Saving…" : "Save showcase"}
        </button>
        <Link href="/" className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700">View portfolio</Link>
      </div>
    </form>
  );
}

function splitLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={name} name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
    </div>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
    </div>
  );
}
