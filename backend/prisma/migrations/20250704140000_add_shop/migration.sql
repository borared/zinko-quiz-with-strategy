-- Zinko Shop: coins, item pricing, avatar ownership
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "coins" INTEGER NOT NULL DEFAULT 500;

ALTER TABLE "sceneries"
  ADD COLUMN IF NOT EXISTS "price_coins" INTEGER,
  ADD COLUMN IF NOT EXISTS "is_purchasable" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "avatars"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "price_coins" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "is_purchasable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "is_free" BOOLEAN NOT NULL DEFAULT false;

UPDATE "sceneries"
SET "price_coins" = 250, "is_purchasable" = true
WHERE "slug" = 'halloween';

UPDATE "sceneries"
SET "price_coins" = 350, "is_purchasable" = true
WHERE "slug" = 'inside';

UPDATE "users" SET "coins" = 500 WHERE "coins" = 0;

UPDATE "avatars"
SET "slug" = 'avatar-' || SUBSTRING("id"::text, 1, 8)
WHERE "slug" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "avatars_slug_key" ON "avatars"("slug");

ALTER TABLE "avatars" ALTER COLUMN "slug" SET NOT NULL;

WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at" ASC NULLS LAST, "id" ASC) AS rn
  FROM "avatars"
)
UPDATE "avatars" AS a
SET
  "is_free" = true,
  "is_purchasable" = false,
  "price_coins" = 0
FROM ranked AS r
WHERE a."id" = r."id" AND r.rn <= 3;

WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at" ASC NULLS LAST, "id" ASC) AS rn
  FROM "avatars"
)
UPDATE "avatars" AS a
SET
  "is_free" = false,
  "is_purchasable" = true,
  "price_coins" = CASE
    WHEN r.rn = 4 THEN 100
    WHEN r.rn = 5 THEN 150
    WHEN r.rn = 6 THEN 200
    WHEN r.rn = 7 THEN 250
    ELSE 300
  END
FROM ranked AS r
WHERE a."id" = r."id" AND r.rn > 3;

CREATE TABLE IF NOT EXISTS "user_avatars" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "avatar_id" UUID NOT NULL,
  "obtained_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT "user_avatars_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_avatars_user_id_avatar_id_key"
  ON "user_avatars"("user_id", "avatar_id");
CREATE INDEX IF NOT EXISTS "user_avatars_user_id_idx" ON "user_avatars"("user_id");

ALTER TABLE "user_avatars"
  ADD CONSTRAINT "user_avatars_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "user_avatars"
  ADD CONSTRAINT "user_avatars_avatar_id_fkey"
  FOREIGN KEY ("avatar_id") REFERENCES "avatars"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;