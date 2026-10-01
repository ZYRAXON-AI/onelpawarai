CREATE TABLE public.founder_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 10000),
  link_url TEXT,
  file_path TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.founder_updates TO service_role;
ALTER TABLE public.founder_updates ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_founder_updates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER founder_updates_set_updated_at
BEFORE UPDATE ON public.founder_updates
FOR EACH ROW
EXECUTE FUNCTION public.set_founder_updates_updated_at();

CREATE POLICY "No direct client access to founder updates"
ON public.founder_updates
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct client access to founder files"
ON storage.objects
FOR ALL
TO anon, authenticated
USING (bucket_id = 'founder-content' AND false)
WITH CHECK (bucket_id = 'founder-content' AND false);