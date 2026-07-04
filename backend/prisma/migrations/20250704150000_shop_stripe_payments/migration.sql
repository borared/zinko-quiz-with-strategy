-- Switch shop pricing from coins to USD cents (Stripe)
ALTER TABLE "sceneries" ADD COLUMN IF NOT EXISTS "price_cents" INTEGER;
ALTER TABLE "avatars" ADD COLUMN IF NOT EXISTS "price_cents" INTEGER;

UPDATE "sceneries"
SET "price_cents" = 299
WHERE "slug" = 'halloween';

UPDATE "sceneries"
SET "price_cents" = 399
WHERE "slug" = 'inside';

WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at" ASC NULLS LAST, "id" ASC) AS rn
  FROM "avatars"
  WHERE "is_purchasable" = true
)
UPDATE "avatars" AS a
SET "price_cents" = CASE
  WHEN r.rn = 1 THEN 149
  WHEN r.rn = 2 THEN 199
  WHEN r.rn = 3 THEN 249
  WHEN r.rn = 4 THEN 299
  ELSE 349
END
FROM ranked AS r
WHERE a."id" = r."id";

CREATE TABLE IF NOT EXISTS "shop_orders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "item_type" TEXT NOT NULL,
  "item_slug" TEXT NOT NULL,
  "amount_cents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "stripe_session_id" TEXT,
  "stripe_payment_intent" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
  "completed_at" TIMESTAMPTZ(6),
  CONSTRAINT "shop_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "shop_orders_stripe_session_id_key"
  ON "shop_orders"("stripe_session_id");
CREATE INDEX IF NOT EXISTS "shop_orders_user_id_idx" ON "shop_orders"("user_id");
CREATE INDEX IF NOT EXISTS "shop_orders_status_idx" ON "shop_orders"("status");

ALTER TABLE "shop_orders"
  ADD CONSTRAINT "shop_orders_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id")
  ON DELETE CASCADE ON UPDATE NO ACTION;