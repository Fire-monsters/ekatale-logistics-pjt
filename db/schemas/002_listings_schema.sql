-- ============================================================
-- 002_listings_schema.sql
-- E-Katale — Listings, Commodity Taxonomy, Produce Photos
-- Run as: psql -U ekatale_app -d ekatale -h localhost
--         -f db/schemas/002_listings_schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- COMMODITY TAXONOMY
-- Three-level hierarchy: Category → Commodity → Variety
-- e.g. Grains → Maize → White Maize / Yellow Maize
-- ------------------------------------------------------------

CREATE TABLE listings.commodity_categories (
    category_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    name_lg         VARCHAR(100),   -- Luganda
    name_sw         VARCHAR(100),   -- Swahili
    icon_url        TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE listings.commodities (
    commodity_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID NOT NULL 
                    REFERENCES listings.commodity_categories(category_id),
    name            VARCHAR(100) NOT NULL,
    name_lg         VARCHAR(100),
    name_sw         VARCHAR(100),
    unit_options    TEXT[] NOT NULL DEFAULT '{kg,tonne,sack,crate,bunch}',
    default_unit    VARCHAR(20) NOT NULL DEFAULT 'kg',
    perishable      BOOLEAN NOT NULL DEFAULT false,
    requires_cold   BOOLEAN NOT NULL DEFAULT false,
    avg_shelf_days  INTEGER,            -- avg days before spoilage
    season_months   INTEGER[],          -- e.g. {3,4,5} for Mar-May
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE listings.commodity_varieties (
    variety_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity_id    UUID NOT NULL 
                    REFERENCES listings.commodities(commodity_id),
    name            VARCHAR(100) NOT NULL,
    name_lg         VARCHAR(100),
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- PRODUCE LISTINGS
-- Created by farmers, reviewed by warehouse
-- ------------------------------------------------------------

CREATE TABLE listings.produce_listings (
    listing_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Ownership
    farmer_id           UUID NOT NULL,  
    -- References auth.users — cross-schema FK kept as soft ref
    -- enforced at application layer to keep schemas decoupled

    -- What is being listed
    commodity_id        UUID NOT NULL 
                        REFERENCES listings.commodities(commodity_id),
    variety_id          UUID 
                        REFERENCES listings.commodity_varieties(variety_id),
    quantity            DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit                VARCHAR(20) NOT NULL DEFAULT 'kg',
    asking_price_ugx    DECIMAL(12, 2),   -- null = open to warehouse offer
    quality_description TEXT,
    quality_grade       VARCHAR(5) 
                        CHECK (quality_grade IN ('A', 'B', 'C')),

    -- Location of the produce
    location_district   VARCHAR(100) NOT NULL,
    location_village    VARCHAR(100),
    location_gps_lat    DECIMAL(10, 8),
    location_gps_lng    DECIMAL(11, 8),

    -- Availability
    available_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    is_forward_listing  BOOLEAN NOT NULL DEFAULT false,

    -- Listing lifecycle status
    -- Draft: saved but not submitted
    -- Pending: submitted, awaiting warehouse review
    -- Active: approved, visible to warehouse
    -- Offer Received: warehouse made a price offer
    -- Order Confirmed: warehouse placed buy order
    -- Collected: truck picked up produce
    -- Delivered: produce arrived at warehouse
    -- Paid: farmer payment sent
    -- Cancelled: listing withdrawn
    -- Rejected: rejected by warehouse with reason
    status              VARCHAR(20) NOT NULL DEFAULT 'draft'
                        CHECK (status IN (
                            'draft', 'pending', 'active',
                            'offer_received', 'order_confirmed',
                            'collected', 'delivered', 'paid',
                            'cancelled', 'rejected'
                        )),

    rejection_reason    TEXT,

    -- AI analysis results
    ai_quality_score        DECIMAL(5, 2),   -- 0.00 to 100.00
    ai_disease_detected     BOOLEAN,
    ai_disease_name         VARCHAR(255),
    ai_disease_confidence   DECIMAL(5, 2),
    ai_treatment_advice     TEXT,
    ai_safe_to_list         BOOLEAN,
    ai_analysed_at          TIMESTAMPTZ,

    -- Sync support for offline-created listings
    client_uuid             UUID UNIQUE,  -- device-generated for idempotency
    synced_at               TIMESTAMPTZ,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- LISTING PHOTOS
-- Up to 4 photos per listing, stored as S3 URLs
-- ------------------------------------------------------------

CREATE TABLE listings.listing_photos (
    photo_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID NOT NULL 
                    REFERENCES listings.produce_listings(listing_id) 
                    ON DELETE CASCADE,
    s3_key          TEXT NOT NULL,       -- S3 object key
    cdn_url         TEXT NOT NULL,       -- CloudFront URL served to clients
    photo_order     SMALLINT NOT NULL    -- 1 to 4, display order
                    CHECK (photo_order BETWEEN 1 AND 4),
    is_primary      BOOLEAN NOT NULL DEFAULT false,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one primary photo per listing
CREATE UNIQUE INDEX idx_one_primary_photo
    ON listings.listing_photos(listing_id)
    WHERE is_primary = true;

-- ------------------------------------------------------------
-- PRICE OFFERS
-- Warehouse makes an offer against a listing
-- Farmer can accept or counter
-- ------------------------------------------------------------

CREATE TABLE listings.price_offers (
    offer_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id          UUID NOT NULL 
                        REFERENCES listings.produce_listings(listing_id),
    warehouse_id        UUID NOT NULL,   -- soft ref to auth.users
    offered_price_ugx   DECIMAL(12, 2) NOT NULL CHECK (offered_price_ugx > 0),
    offered_quantity    DECIMAL(10, 2) NOT NULL CHECK (offered_quantity > 0),
    note                TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                            'pending', 'accepted', 
                            'rejected', 'countered', 'expired'
                        )),
    farmer_counter_price DECIMAL(12, 2),
    expires_at          TIMESTAMPTZ NOT NULL 
                        DEFAULT (NOW() + INTERVAL '48 hours'),
    responded_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- LISTING STATUS HISTORY
-- Full audit trail of every status change
-- ------------------------------------------------------------

CREATE TABLE listings.listing_status_history (
    history_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID NOT NULL 
                    REFERENCES listings.produce_listings(listing_id),
    from_status     VARCHAR(20),
    to_status       VARCHAR(20) NOT NULL,
    changed_by      UUID NOT NULL,      -- soft ref to auth.users
    changed_by_role VARCHAR(30) NOT NULL,
    note            TEXT,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- MARKET PRICE REFERENCE
-- Populated by the AI pricing engine every 4 hours
-- Used for price check screen and warehouse offers
-- ------------------------------------------------------------

CREATE TABLE listings.market_prices (
    price_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity_id    UUID NOT NULL 
                    REFERENCES listings.commodities(commodity_id),
    district        VARCHAR(100) NOT NULL,
    price_floor_ugx DECIMAL(12, 2) NOT NULL,
    price_ceil_ugx  DECIMAL(12, 2) NOT NULL,
    avg_price_ugx   DECIMAL(12, 2) NOT NULL,
    trend           VARCHAR(10) NOT NULL 
                    CHECK (trend IN ('rising', 'stable', 'falling')),
    confidence_pct  DECIMAL(5, 2),
    data_source     VARCHAR(50) NOT NULL DEFAULT 'ai_engine',
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep only latest 90 days of price data at this table level
-- Older data moves to ai schema for model training
CREATE INDEX idx_market_prices_commodity_district 
    ON listings.market_prices(commodity_id, district);
CREATE INDEX idx_market_prices_recorded 
    ON listings.market_prices(recorded_at DESC);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------

CREATE INDEX idx_listings_farmer       
    ON listings.produce_listings(farmer_id);
CREATE INDEX idx_listings_status       
    ON listings.produce_listings(status);
CREATE INDEX idx_listings_commodity    
    ON listings.produce_listings(commodity_id);
CREATE INDEX idx_listings_district     
    ON listings.produce_listings(location_district);
CREATE INDEX idx_listings_available    
    ON listings.produce_listings(available_from);
CREATE INDEX idx_listings_client_uuid  
    ON listings.produce_listings(client_uuid);
CREATE INDEX idx_photos_listing        
    ON listings.listing_photos(listing_id);
CREATE INDEX idx_offers_listing        
    ON listings.price_offers(listing_id);
CREATE INDEX idx_offers_warehouse      
    ON listings.price_offers(warehouse_id);

-- Full-text search on quality description
CREATE INDEX idx_listings_quality_fts
    ON listings.produce_listings
    USING GIN (to_tsvector('english', COALESCE(quality_description, '')));

-- ------------------------------------------------------------
-- AUTO-UPDATE updated_at TRIGGER
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION listings.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON listings.produce_listings
    FOR EACH ROW EXECUTE FUNCTION listings.update_updated_at();

-- ------------------------------------------------------------
-- SEED — COMMODITY CATEGORIES
-- ------------------------------------------------------------

INSERT INTO listings.commodity_categories 
    (name, name_lg, name_sw, sort_order) VALUES
    ('Grains & Cereals',   'Ebyakabona',      'Nafaka',         1),
    ('Legumes & Pulses',   'Ebijanjalo',       'Mikunde',        2),
    ('Root Crops',         'Ebisaanyi',        'Mazao ya Mizizi', 3),
    ('Vegetables',         'Ebijanjalo Byitiiti','Mboga',        4),
    ('Fruits',             'Ebibala',          'Matunda',        5),
    ('Banana & Plantain',  'Omatooke',         'Ndizi',          6),
    ('Cash Crops',         'Ebimera by''Okutunda','Mazao ya Biashara',7),
    ('Livestock',          'Ebisolo',          'Mifugo',         8),
    ('Dairy & Eggs',       'Amata n''Amagi',   'Maziwa na Mayai',9),
    ('Agro-Processed',     'Ebyakozesebwa',    'Bidhaa za Kilimo',10);

-- ------------------------------------------------------------
-- SEED — COMMODITIES (core Uganda crops)
-- ------------------------------------------------------------

INSERT INTO listings.commodities 
    (category_id, name, name_lg, name_sw, 
     default_unit, perishable, season_months) VALUES

-- Grains
((SELECT category_id FROM listings.commodity_categories WHERE name='Grains & Cereals'),
 'Maize','Kasooli','Mahindi','kg',false,'{3,4,8,9}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Grains & Cereals'),
 'Rice','Mwere','Mchele','kg',false,'{4,5,10,11}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Grains & Cereals'),
 'Sorghum','Ente','Mtama','kg',false,'{4,5}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Grains & Cereals'),
 'Millet','Bulo','Uwele','kg',false,'{8,9}'),

-- Legumes
((SELECT category_id FROM listings.commodity_categories WHERE name='Legumes & Pulses'),
 'Beans','Ebijanjalo','Maharagwe','kg',false,'{4,5,9,10}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Legumes & Pulses'),
 'Groundnuts','Ebinyewa','Karanga','kg',false,'{4,5}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Legumes & Pulses'),
 'Soybeans','Soya','Soya','kg',false,'{4,5}'),

-- Root crops
((SELECT category_id FROM listings.commodity_categories WHERE name='Root Crops'),
 'Cassava','Muwogo','Muhogo','kg',false,'{1,2,7,8}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Root Crops'),
 'Sweet Potato','Lumonde','Viazi Vitamu','kg',true,'{3,4,9,10}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Root Crops'),
 'Irish Potato','Ddiringanyi','Viazi','kg',false,'{4,5,10,11}'),

-- Banana
((SELECT category_id FROM listings.commodity_categories WHERE name='Banana & Plantain'),
 'Matooke','Matooke','Matoke','bunch',true,'{1,2,3,4,5,6,7,8,9,10,11,12}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Banana & Plantain'),
 'Dessert Banana','Omuniiko','Ndizi Tamu','bunch',true,'{1,2,3,4,5,6,7,8,9,10,11,12}'),

-- Cash crops
((SELECT category_id FROM listings.commodity_categories WHERE name='Cash Crops'),
 'Coffee (Robusta)','Kawuuwo','Kahawa','kg',false,'{10,11,12}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Cash Crops'),
 'Coffee (Arabica)','Kawuuwo','Kahawa Arabika','kg',false,'{10,11}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Cash Crops'),
 'Tea','Chai','Chai','kg',false,'{1,2,3,4,5,6,7,8,9,10,11,12}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Cash Crops'),
 'Vanilla','Vanilla','Vanilla','kg',false,'{6,7,8}'),

-- Vegetables
((SELECT category_id FROM listings.commodity_categories WHERE name='Vegetables'),
 'Tomatoes','Nyanya','Nyanya','kg',true,'{1,2,3,7,8,9}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Vegetables'),
 'Onions','Akatungulu','Vitunguu','kg',false,'{3,4,8,9}'),

((SELECT category_id FROM listings.commodity_categories WHERE name='Vegetables'),
 'Cabbage','Kabeeji','Kabichi','kg',true,'{1,2,7,8}'),

-- Livestock (for pastoralist module)
((SELECT category_id FROM listings.commodity_categories WHERE name='Livestock'),
 'Cattle','Ente','Ng''ombe','head',false,null),

((SELECT category_id FROM listings.commodity_categories WHERE name='Livestock'),
 'Goats','Embuzi','Mbuzi','head',false,null),

((SELECT category_id FROM listings.commodity_categories WHERE name='Livestock'),
 'Pigs','Embizzi','Nguruwe','head',false,null),

-- Dairy
((SELECT category_id FROM listings.commodity_categories WHERE name='Dairy & Eggs'),
 'Milk','Amata','Maziwa','litre',true,null),

((SELECT category_id FROM listings.commodity_categories WHERE name='Dairy & Eggs'),
 'Eggs','Amagi','Mayai','crate',true,null);