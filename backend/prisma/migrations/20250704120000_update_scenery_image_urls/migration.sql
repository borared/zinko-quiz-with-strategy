-- Point scenery catalog images at Supabase public storage
UPDATE "sceneries"
SET "image_url" = 'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/city.jpg'
WHERE "slug" = 'city';

UPDATE "sceneries"
SET "image_url" = 'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/halloween_scenery.jpg'
WHERE "slug" = 'halloween';