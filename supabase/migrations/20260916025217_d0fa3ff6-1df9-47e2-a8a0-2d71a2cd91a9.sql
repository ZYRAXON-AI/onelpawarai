GRANT SELECT ON public.founder_updates TO anon, authenticated;

CREATE POLICY "Published founder updates are publicly readable"
ON public.founder_updates
FOR SELECT
TO anon, authenticated
USING (is_published = true);
