-- Remove rows that would block foreign keys
DELETE FROM "notifications"
WHERE "user_id" NOT IN (SELECT "clerk_id" FROM "users");

DELETE FROM "quizzes" q
WHERE NOT EXISTS (
  SELECT 1 FROM "users" u WHERE u."clerk_id" = q."creator_id"
);

-- Indexes for relation lookups
CREATE INDEX IF NOT EXISTS "questions_quiz_id_idx" ON "questions"("quiz_id");
CREATE INDEX IF NOT EXISTS "quizzes_creator_id_idx" ON "quizzes"("creator_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");

-- notifications.user_id -> users.clerk_id
DO $$ BEGIN
  ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- quizzes.creator_id -> users.clerk_id
DO $$ BEGIN
  ALTER TABLE "quizzes"
    ADD CONSTRAINT "quizzes_creator_id_fkey"
    FOREIGN KEY ("creator_id") REFERENCES "users"("clerk_id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;