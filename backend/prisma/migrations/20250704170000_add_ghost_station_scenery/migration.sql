INSERT INTO "sceneries" ("slug", "name", "image_url", "is_default", "is_purchasable", "price_cents")
VALUES
  (
    'ghost-station',
    'Ghost Station',
    'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/inside_scenery.jpg',
    false,
    true,
    199
  )
ON CONFLICT ("slug") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "image_url" = EXCLUDED."image_url",
  "is_purchasable" = EXCLUDED."is_purchasable",
  "price_cents" = EXCLUDED."price_cents";