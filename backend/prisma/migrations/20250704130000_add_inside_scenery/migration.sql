INSERT INTO "sceneries" ("slug", "name", "image_url", "is_default")
VALUES
  ('inside', 'Inside', 'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/inside_scenery.jpg', false)
ON CONFLICT ("slug") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "image_url" = EXCLUDED."image_url",
  "is_default" = EXCLUDED."is_default";