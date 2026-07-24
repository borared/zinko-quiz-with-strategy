-- Scenery catalog + per-user unlocks
CREATE TABLE IF NOT EXISTS "sceneries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT "sceneries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sceneries_slug_key" ON "sceneries"("slug");

CREATE TABLE IF NOT EXISTS "user_sceneries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "scenery_id" UUID NOT NULL,
  "obtained_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT "user_sceneries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_sceneries_user_id_scenery_id_key"
  ON "user_sceneries"("user_id", "scenery_id");
CREATE INDEX IF NOT EXISTS "user_sceneries_user_id_idx" ON "user_sceneries"("user_id");

ALTER TABLE "user_sceneries"
  ADD CONSTRAINT "user_sceneries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "user_sceneries"
  ADD CONSTRAINT "user_sceneries_scenery_id_fkey"
  FOREIGN KEY ("scenery_id") REFERENCES "sceneries"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

INSERT INTO "sceneries" ("slug", "name", "image_url", "is_default")
VALUES
  ('city', 'City', '/background_battle/city.jpg', true),
  ('halloween', 'Halloween', '/background_battle/halloween_scenery.jpg', false)
ON CONFLICT ("slug") DO NOTHING;