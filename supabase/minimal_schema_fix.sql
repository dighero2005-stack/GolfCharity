-- Quick fix: add optional columns if you want lottery features without the full migration.
-- Run in Supabase → SQL Editor.

ALTER TABLE draws ADD COLUMN IF NOT EXISTS draw_month text;
ALTER TABLE draws ADD COLUMN IF NOT EXISTS draw_type text DEFAULT 'random';
ALTER TABLE draws ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';

ALTER TABLE user_subscription ADD COLUMN IF NOT EXISTS renewal_date timestamptz;

ALTER TABLE scores ADD COLUMN IF NOT EXISTS score_date date DEFAULT CURRENT_DATE;
