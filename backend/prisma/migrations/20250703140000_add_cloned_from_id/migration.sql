ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "cloned_from_id" UUID;

CREATE INDEX IF NOT EXISTS "quizzes_creator_id_cloned_from_id_idx"
  ON "quizzes" ("creator_id", "cloned_from_id");