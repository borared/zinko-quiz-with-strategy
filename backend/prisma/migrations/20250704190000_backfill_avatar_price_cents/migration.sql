-- Free and legacy avatar rows can have NULL price_cents; Prisma expects Int.
UPDATE "avatars"
SET "price_cents" = 0
WHERE "price_cents" IS NULL;

ALTER TABLE "avatars"
  ALTER COLUMN "price_cents" SET DEFAULT 0;