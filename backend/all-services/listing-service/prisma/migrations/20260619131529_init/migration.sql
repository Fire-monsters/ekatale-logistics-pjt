-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "listings";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "notifications";

-- CreateTable
CREATE TABLE "auth"."users" (
    "user_id" UUID NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "listings"."commodities" (
    "commodity_id" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_lg" VARCHAR(100),
    "name_sw" VARCHAR(100),
    "category" VARCHAR(50) NOT NULL,
    "unit_default" VARCHAR(20) NOT NULL,
    "emoji" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commodities_pkey" PRIMARY KEY ("commodity_id")
);

-- CreateTable
CREATE TABLE "listings"."produce_listings" (
    "listing_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "farmer_id" UUID NOT NULL,
    "commodity_id" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL DEFAULT 'kg',
    "grade" CHAR(1) NOT NULL DEFAULT 'B',
    "asking_price_per_unit" DECIMAL(12,2),
    "availability_date" DATE,
    "district" VARCHAR(100),
    "village" VARCHAR(100),
    "gps_lat" DECIMAL(10,8),
    "gps_lng" DECIMAL(11,8),
    "quality_description" TEXT,
    "ai_score" INTEGER,
    "ai_disease_flag" BOOLEAN NOT NULL DEFAULT false,
    "ai_report" JSONB,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
    "rejection_reason" TEXT,
    "warehouse_notes" TEXT,
    "final_price_per_unit" DECIMAL(12,2),
    "total_amount" DECIMAL(15,2),
    "commission_amount" DECIMAL(15,2),
    "net_amount" DECIMAL(15,2),
    "source" VARCHAR(20) NOT NULL DEFAULT 'app',
    "offline_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "produce_listings_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "listings"."listing_photos" (
    "photo_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "file_size_kb" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("photo_id")
);

-- CreateTable
CREATE TABLE "listings"."listing_status_history" (
    "history_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "from_status" VARCHAR(30),
    "to_status" VARCHAR(30) NOT NULL,
    "changed_by" UUID,
    "changed_by_role" VARCHAR(30),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_status_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "listings"."price_guidance" (
    "price_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commodity_id" VARCHAR(50) NOT NULL,
    "region_id" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(20) NOT NULL DEFAULT 'kg',
    "floor_price" DECIMAL(12,2) NOT NULL,
    "ceiling_price" DECIMAL(12,2) NOT NULL,
    "current_price" DECIMAL(12,2) NOT NULL,
    "trend" VARCHAR(10) NOT NULL DEFAULT 'STABLE',
    "trend_pct" DECIMAL(5,2),
    "valid_from" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" DATE,
    "source" VARCHAR(50) DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_guidance_pkey" PRIMARY KEY ("price_id")
);

-- CreateTable
CREATE TABLE "notifications"."notifications" (
    "notification_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "channel" VARCHAR(20) NOT NULL DEFAULT 'PUSH',
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "notifications"."push_tokens" (
    "token_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "platform" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "notifications"."ussd_sessions" (
    "session_id" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "state" VARCHAR(50) NOT NULL DEFAULT 'MAIN_MENU',
    "context" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ussd_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "produce_listings_offline_id_key" ON "listings"."produce_listings"("offline_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "notifications"."push_tokens"("token");

-- AddForeignKey
ALTER TABLE "listings"."produce_listings" ADD CONSTRAINT "produce_listings_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "listings"."commodities"("commodity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings"."listing_photos" ADD CONSTRAINT "listing_photos_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"."produce_listings"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings"."listing_status_history" ADD CONSTRAINT "listing_status_history_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"."produce_listings"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings"."price_guidance" ADD CONSTRAINT "price_guidance_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "listings"."commodities"("commodity_id") ON DELETE RESTRICT ON UPDATE CASCADE;
