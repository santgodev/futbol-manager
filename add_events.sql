ALTER TABLE match_result_submissions ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;
