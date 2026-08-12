ALTER TABLE public.report_cards
  ADD COLUMN IF NOT EXISTS snapshot_data JSONB;

COMMENT ON COLUMN public.report_cards.snapshot_data IS
  'Salinan permanen identitas, nilai, bobot, mapel, guru, dan presensi saat rapor difinalisasi';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'report_cards_snapshot_data_check'
       AND conrelid = 'public.report_cards'::regclass
  ) THEN
    ALTER TABLE public.report_cards
      ADD CONSTRAINT report_cards_snapshot_data_check
      CHECK (snapshot_data IS NULL OR jsonb_typeof(snapshot_data) = 'object');
  END IF;
END;
$$;
