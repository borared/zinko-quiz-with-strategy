-- Drop the deprecated coins column
ALTER TABLE "users" DROP COLUMN IF EXISTS "coins";

-- Add Full-Text Search GIN index for quiz titles
CREATE INDEX IF NOT EXISTS quizzes_title_fts_idx ON quizzes USING GIN (to_tsvector('english', title));
