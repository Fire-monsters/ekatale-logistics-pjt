-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateEnum
CREATE TYPE "auth"."Role" AS ENUM ('farmer', 'village_agent', 'warehouse', 'sme', 'grocery', 'consumer', 'transport', 'admin');

-- CreateEnum
CREATE TYPE "auth"."Language" AS ENUM ('en', 'lg', 'sw', 'ac', 'rn', 'fr');

-- CreateEnum
CREATE TYPE "auth"."KycStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "auth"."OtpPurpose" AS ENUM ('register', 'login', 'payment', 'delivery');

-- CreateTable
CREATE TABLE "auth"."users" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phone" VARCHAR(20) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "auth"."Role" NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "language_pref" "auth"."Language" NOT NULL DEFAULT 'en',
    "kyc_status" "auth"."KycStatus" NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "auth"."otps" (
    "otp_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phone" VARCHAR(20) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "purpose" "auth"."OtpPurpose" NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("otp_id")
);

-- CreateTable
CREATE TABLE "auth"."refresh_tokens" (
    "token_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "device_info" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "auth"."farmer_profiles" (
    "farmer_id" UUID NOT NULL,
    "national_id" VARCHAR(50),
    "district" VARCHAR(100) NOT NULL,
    "village" VARCHAR(100),
    "gps_lat" DECIMAL(10,8),
    "gps_lng" DECIMAL(11,8),
    "farm_size_acres" DECIMAL(8,2),
    "cooperative_id" UUID,
    "payment_provider" VARCHAR(20),
    "payment_number" VARCHAR(20),
    "crops_grown" TEXT[],
    "registered_by_agent_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_profiles_pkey" PRIMARY KEY ("farmer_id")
);

-- CreateTable
CREATE TABLE "auth"."village_agent_profiles" (
    "agent_id" UUID NOT NULL,
    "territory_district" VARCHAR(100) NOT NULL,
    "territory_villages" TEXT[],
    "commission_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.02,
    "total_farmers_reg" INTEGER NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_agent_profiles_pkey" PRIMARY KEY ("agent_id")
);

-- CreateTable
CREATE TABLE "auth"."agent_farmer_links" (
    "link_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_id" UUID NOT NULL,
    "farmer_id" UUID NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_farmer_links_pkey" PRIMARY KEY ("link_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "auth"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_profiles_national_id_key" ON "auth"."farmer_profiles"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_farmer_links_agent_id_farmer_id_key" ON "auth"."agent_farmer_links"("agent_id", "farmer_id");

-- AddForeignKey
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."farmer_profiles" ADD CONSTRAINT "farmer_profiles_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "auth"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."village_agent_profiles" ADD CONSTRAINT "village_agent_profiles_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "auth"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."agent_farmer_links" ADD CONSTRAINT "agent_farmer_links_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "auth"."village_agent_profiles"("agent_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."agent_farmer_links" ADD CONSTRAINT "agent_farmer_links_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "auth"."farmer_profiles"("farmer_id") ON DELETE CASCADE ON UPDATE CASCADE;
