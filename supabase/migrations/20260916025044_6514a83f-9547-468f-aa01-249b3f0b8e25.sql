ALTER TABLE public.founder_updates
  ADD COLUMN media_type TEXT,
  ADD COLUMN file_size BIGINT,
  ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.founder_updates
  ADD CONSTRAINT founder_updates_media_type_check
  CHECK (media_type IS NULL OR media_type IN ('image', 'video', 'document', 'audio', 'other'));

CREATE INDEX founder_updates_public_order_idx
  ON public.founder_updates (is_published, created_at DESC);
