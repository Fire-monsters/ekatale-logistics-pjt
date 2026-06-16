-- =============================================================================
-- 002_listings_schema.sql
-- E-Katale: Produce Listings, Commodity Taxonomy, Prices, Notifications
-- Run after 001_auth_schema.sql
-- =============================================================================

-- Enable UUID generation (already enabled in auth schema but safe to repeat)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SCHEMA: listings
-- =============================================================================
CREATE SCHEMA IF NOT EXISTS listings;

-- ---------------------------------------------------------------------------
-- Commodity taxonomy — seeded once, then read-only at runtime
-- ---------------------------------------------------------------------------
CREATE TABLE listings.commodities (
  commodity_id    VARCHAR(50) PRIMARY KEY,          -- 'maize', 'beans', etc.
  name_en         VARCHAR(100) NOT NULL,
  name_lg         VARCHAR(100),                     -- Luganda
  name_sw         VARCHAR(100),                     -- Swahili
  category        VARCHAR(50)  NOT NULL,            -- 'Grains','Legumes','Roots','Vegetables','Cash Crops'
  unit_default    VARCHAR(20)  NOT NULL DEFAULT 'kg',
  emoji           VARCHAR(10),
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Produce listings
-- ---------------------------------------------------------------------------
CREATE TABLE listings.produce_listings (
  listing_id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id           UUID         NOT NULL,        -- FK → auth.users.user_id
  commodity_id        VARCHAR(50)  NOT NULL REFERENCES listings.commodities(commodity_id),
  quantity            NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit                VARCHAR(20)  NOT NULL DEFAULT 'kg',
  grade               CHAR(1)      NOT NULL DEFAULT 'B' CHECK (grade IN ('A','B','C')),
  asking_price_per_unit NUMERIC(12,2),              -- NULL = accept market price
  availability_date   DATE,
  district            VARCHAR(100),
  village             VARCHAR(100),
  gps_lat             DECIMAL(10,8),
  gps_lng             DECIMAL(11,8),
  quality_description TEXT,
  ai_score            SMALLINT     CHECK (ai_score BETWEEN 0 AND 100),
  ai_disease_flag     BOOLEAN      NOT NULL DEFAULT FALSE,
  ai_report           JSONB,
  status              VARCHAR(30)  NOT NULL DEFAULT 'PENDING_REVIEW'
                      CHECK (status IN (
                        'DRAFT','PENDING_REVIEW','ACTIVE','ORDER_CONFIRMED',
                        'COLLECTED','DISPATCHED','DELIVERED','PAID',
                        'COMPLETED','CANCELLED','REJECTED','EXPIRED'
                      )),
  rejection_reason    TEXT,
  warehouse_notes     TEXT,
  final_price_per_unit NUMERIC(12,2),              -- set by warehouse on collection
  total_amount        NUMERIC(15,2),               -- final_price * quantity
  commission_amount   NUMERIC(15,2),               -- 3% platform fee
  net_amount          NUMERIC(15,2),               -- total - commission
  source              VARCHAR(20)  NOT NULL DEFAULT 'app'
                      CHECK (source IN ('app','ussd','agent')),
  offline_id          VARCHAR(100) UNIQUE,         -- client-generated UUID for offline sync
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ  DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_listings_farmer     ON listings.produce_listings(farmer_id);
CREATE INDEX idx_listings_status     ON listings.produce_listings(status);
CREATE INDEX idx_listings_commodity  ON listings.produce_listings(commodity_id);
CREATE INDEX idx_listings_district   ON listings.produce_listings(district);
CREATE INDEX idx_listings_created    ON listings.produce_listings(created_at DESC);
CREATE INDEX idx_listings_offline_id ON listings.produce_listings(offline_id) WHERE offline_id IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION listings.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings.produce_listings
  FOR EACH ROW EXECUTE FUNCTION listings.set_updated_at();

-- ---------------------------------------------------------------------------
-- Listing photos
-- ---------------------------------------------------------------------------
CREATE TABLE listings.listing_photos (
  photo_id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID         NOT NULL REFERENCES listings.produce_listings(listing_id) ON DELETE CASCADE,
  storage_key  VARCHAR(500) NOT NULL,              -- S3/R2 object key
  url          VARCHAR(1000) NOT NULL,
  is_primary   BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order   SMALLINT     NOT NULL DEFAULT 0,
  file_size_kb INTEGER,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_listing ON listings.listing_photos(listing_id);

-- Ensure only one primary photo per listing
CREATE UNIQUE INDEX idx_photos_primary
  ON listings.listing_photos(listing_id)
  WHERE is_primary = TRUE;

-- ---------------------------------------------------------------------------
-- Status history (audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE listings.listing_status_history (
  history_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID        NOT NULL REFERENCES listings.produce_listings(listing_id) ON DELETE CASCADE,
  from_status  VARCHAR(30),
  to_status    VARCHAR(30)  NOT NULL,
  changed_by   UUID,                              -- user_id of who changed it
  changed_by_role VARCHAR(30),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_listing ON listings.listing_status_history(listing_id);

-- ---------------------------------------------------------------------------
-- Price guidance (set by admin / warehouse, read by farmers)
-- ---------------------------------------------------------------------------
CREATE TABLE listings.price_guidance (
  price_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_id   VARCHAR(50) NOT NULL REFERENCES listings.commodities(commodity_id),
  region_id      VARCHAR(100) NOT NULL,            -- district or 'national'
  unit           VARCHAR(20) NOT NULL DEFAULT 'kg',
  floor_price    NUMERIC(12,2) NOT NULL,
  ceiling_price  NUMERIC(12,2) NOT NULL,
  current_price  NUMERIC(12,2) NOT NULL,
  trend          VARCHAR(10) NOT NULL DEFAULT 'STABLE' CHECK (trend IN ('RISING','FALLING','STABLE')),
  trend_pct      NUMERIC(5,2),
  valid_from     DATE        NOT NULL DEFAULT CURRENT_DATE,
  valid_to       DATE,
  source         VARCHAR(50) DEFAULT 'admin',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_price_commodity_region_date
  ON listings.price_guidance(commodity_id, region_id, valid_from DESC);

CREATE INDEX idx_price_commodity ON listings.price_guidance(commodity_id);


-- SCHEMA: notifications

CREATE SCHEMA IF NOT EXISTS notifications;

CREATE TABLE notifications.notifications (
  notification_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL,            -- FK → auth.users.user_id
  channel         VARCHAR(20) NOT NULL DEFAULT 'PUSH'
                  CHECK (channel IN ('PUSH','SMS','IN_APP')),
  title           VARCHAR(255) NOT NULL,
  message         TEXT        NOT NULL,
  data            JSONB,                           -- arbitrary payload for deep links
  is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
  sent_at         TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user       ON notifications.notifications(user_id, created_at DESC);
CREATE INDEX idx_notif_unread     ON notifications.notifications(user_id) WHERE is_read = FALSE;

-- Push token registry

CREATE TABLE notifications.push_tokens (
  token_id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  token       VARCHAR(500) NOT NULL,
  platform    VARCHAR(10) NOT NULL CHECK (platform IN ('android','ios')),
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_push_token_value ON notifications.push_tokens(token);
CREATE INDEX idx_push_token_user  ON notifications.push_tokens(user_id) WHERE is_active = TRUE;

-- USSD sessions (stateful session tracking)

CREATE TABLE notifications.ussd_sessions (
  session_id   VARCHAR(100) PRIMARY KEY,           -- Africa's Talking sessionId
  phone        VARCHAR(20)  NOT NULL,
  state        VARCHAR(50)  NOT NULL DEFAULT 'MAIN_MENU',
  context      JSONB        NOT NULL DEFAULT '{}', -- accumulated inputs
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ  NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes')
);

CREATE INDEX idx_ussd_phone ON notifications.ussd_sessions(phone);

-- SEED: commodity taxonomy

INSERT INTO listings.commodities (commodity_id, name_en, name_lg, name_sw, category, unit_default, emoji) VALUES
  ('maize',        'Maize',        'Kasooli',    'Mahindi',    'Grains',     'kg',   '🌽'),
  ('beans',        'Beans',        'Bigere',     'Maharagwe',  'Legumes',    'kg',   '🫘'),
  ('cassava',      'Cassava',      'Muwogo',     'Muhogo',     'Roots',      'kg',   '🍠'),
  ('matooke',      'Matooke',      'Matooke',    'Ndizi',      'Fruits',     'bunch','🍌'),
  ('sweet_potato', 'Sweet Potato', 'Lumonde',    'Kiazi Tamu', 'Roots',      'kg',   '🥔'),
  ('groundnuts',   'Groundnuts',   'Ebinyeebwa', 'Karanga',    'Legumes',    'kg',   '🥜'),
  ('sorghum',      'Sorghum',      'Obulo',      'Mtama',      'Grains',     'kg',   '🌾'),
  ('vegetables',   'Vegetables',   'Ebinyebwa',  'Mboga',      'Vegetables', 'kg',   '🥬'),
  ('tomatoes',     'Tomatoes',     'Nyanya',     'Nyanya',     'Vegetables', 'crate','🍅'),
  ('coffee',       'Coffee',       'Kawuufu',    'Kahawa',     'Cash Crops', 'kg',   '☕'),
  ('fruits',       'Fruits',       'Ebibala',    'Matunda',    'Fruits',     'kg',   '🍊'),
  ('onions',       'Onions',       'Abasuuja',   'Vitunguu',   'Vegetables', 'kg',   '🧅'),
  ('rice',         'Rice',         'Muchere',    'Mchele',     'Grains',     'kg',   '🍚'),
  ('sunflower',    'Sunflower',    'Sunflower',  'Alizeti',    'Cash Crops', 'kg',   '🌻')
ON CONFLICT (commodity_id) DO NOTHING;

-- SEED: initial price guidance (national baseline)

INSERT INTO listings.price_guidance (commodity_id, region_id, floor_price, ceiling_price, current_price, trend, trend_pct) VALUES
  ('maize',        'national', 900,  1800, 1500, 'RISING',  5.3),
  ('beans',        'national', 2000, 4000, 2800, 'STABLE',  0.0),
  ('cassava',      'national', 300,  700,  500,  'STABLE',  0.0),
  ('matooke',      'national', 1500, 3000, 2000, 'FALLING', -2.1),
  ('sweet_potato', 'national', 400,  900,  600,  'RISING',  3.2),
  ('groundnuts',   'national', 3000, 6000, 4500, 'STABLE',  0.0),
  ('sorghum',      'national', 700,  1400, 1000, 'RISING',  1.5),
  ('tomatoes',     'national', 800,  2500, 1500, 'RISING',  8.0),
  ('coffee',       'national', 4000, 8000, 6000, 'RISING',  12.0),
  ('vegetables',   'national', 500,  1500, 900,  'STABLE',  0.0)
ON CONFLICT DO NOTHING;