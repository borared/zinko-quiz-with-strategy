-- Ensure username column exists on Zinko users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Enforce unique usernames (multiple NULLs remain allowed)
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users" ("username");