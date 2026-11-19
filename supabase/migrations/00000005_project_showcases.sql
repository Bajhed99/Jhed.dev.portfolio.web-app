-- 00000005_project_showcases.sql
--
-- Adds dedicated portfolio publication controls and structured
-- showcase content without changing existing project visibility.
--
-- Public access is provided through a restricted view.
-- Direct anonymous access to showcase records is not permitted.

BEGIN;

ALTER TABLE public.projects
ADD COLUMN showcase_published boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.projects.showcase_published IS
'Controls publication on the public portfolio independently of CRM project visibility.';

CREATE TABLE public.project_showcases (
    project_id uuid PRIMARY KEY
        REFERENCES public.projects(id)
        ON DELETE CASCADE,
    slug text NOT NULL UNIQUE,
    cover_image_url text,
    gallery_images text[] NOT NULL DEFAULT '{}',
    technologies text[] NOT NULL DEFAULT '{}',
    services text[] NOT NULL DEFAULT '{}',
    challenge text,
    solution text,
    outcomes text,
    content_markdown text,
    external_links jsonb NOT NULL DEFAULT '[]'::jsonb,
    seo_title text,
    seo_description text,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT project_showcases_slug_format
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT project_showcases_external_links_array
        CHECK (jsonb_typeof(external_links) = 'array')
);

COMMENT ON TABLE public.project_showcases IS
'Portfolio-specific content associated with operational projects.';
COMMENT ON COLUMN public.project_showcases.content_markdown IS
'Long-form case-study content stored as Markdown.';
COMMENT ON COLUMN public.project_showcases.external_links IS
'JSON array of approved external project links.';

ALTER TABLE public.project_showcases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.project_showcases FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_showcases TO authenticated;

CREATE POLICY "admins_select_project_showcases"
ON public.project_showcases FOR SELECT TO authenticated
USING (public.current_user_role() = 'admin');

CREATE POLICY "admins_insert_project_showcases"
ON public.project_showcases FOR INSERT TO authenticated
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "admins_update_project_showcases"
ON public.project_showcases FOR UPDATE TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "admins_delete_project_showcases"
ON public.project_showcases FOR DELETE TO authenticated
USING (public.current_user_role() = 'admin');

CREATE VIEW public.public_projects
WITH (security_barrier = true)
AS
SELECT
    p.id,
    p.title,
    p.description,
    p.status,
    p.start_date,
    p.end_date,
    pc.name AS client_name,
    pc.company AS client_company,
    s.slug,
    s.cover_image_url,
    s.gallery_images,
    s.technologies,
    s.services,
    s.challenge,
    s.solution,
    s.outcomes,
    s.content_markdown,
    s.external_links,
    s.seo_title,
    s.seo_description
FROM public.projects AS p
INNER JOIN public.project_showcases AS s ON s.project_id = p.id
LEFT JOIN public.public_clients AS pc ON pc.id = p.client_id
WHERE p.showcase_published IS TRUE;

REVOKE ALL ON TABLE public.public_projects FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.public_projects TO anon, authenticated;

COMMIT;
