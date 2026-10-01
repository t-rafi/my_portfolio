-- Apply after reviewing existing grants and policies in the target Supabase project.
-- This migration is intentionally not run by the portfolio build.

BEGIN;

ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook ALTER COLUMN approved SET DEFAULT false;

-- Remove prior client-facing policies without assuming their names. Service-role
-- policies remain; service_role bypasses RLS for moderation and reporting.
DO $$
DECLARE existing_policy record;
BEGIN
  FOR existing_policy IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('guestbook', 'leads', 'visits')
      AND roles::text[] && ARRAY['public', 'anon', 'authenticated']::text[]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  END LOOP;
END $$;

REVOKE ALL ON TABLE public.guestbook, public.leads, public.visits
  FROM PUBLIC, anon, authenticated;

-- Only approved, non-sensitive fields are exposed to public readers.
CREATE OR REPLACE VIEW public.guestbook_public
  WITH (security_barrier = true)
AS
SELECT id, name, message, avatar_url, provider, created_at
FROM public.guestbook
WHERE approved = true;

REVOKE ALL ON TABLE public.guestbook_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.guestbook_public TO anon, authenticated;

CREATE POLICY guestbook_authenticated_insert
ON public.guestbook
FOR INSERT TO authenticated
WITH CHECK (approved = false AND length(message) BETWEEN 1 AND 500);
GRANT INSERT ON TABLE public.guestbook TO authenticated;

-- Existing rows are not rejected during deployment; these checks apply to new rows.
ALTER TABLE public.leads
  ADD CONSTRAINT leads_name_length_check
  CHECK (name IS NOT NULL AND length(btrim(name)) BETWEEN 1 AND 120) NOT VALID;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_email_length_check
  CHECK (email IS NOT NULL AND length(email) BETWEEN 3 AND 254) NOT VALID;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_email_format_check
  CHECK (email IS NOT NULL AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$') NOT VALID;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_company_length_check
  CHECK (company IS NULL OR length(btrim(company)) <= 200) NOT VALID;

CREATE POLICY leads_anon_insert
ON public.leads
FOR INSERT TO anon
WITH CHECK (true);
GRANT INSERT ON TABLE public.leads TO anon;

CREATE POLICY visits_anon_insert
ON public.visits
FOR INSERT TO anon
WITH CHECK (true);
GRANT INSERT ON TABLE public.visits TO anon;

COMMIT;
