
-- Users table — the root identity record for every person on the platform
CREATE TABLE auth.users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE,
    role            VARCHAR(30) NOT NULL
                    CHECK (role IN (
                        'farmer', 'village_agent', 'warehouse',
                        'sme', 'grocery', 'consumer',
                        'transport', 'admin'
                    )),
    full_name       VARCHAR(255) NOT NULL,
    language_pref   VARCHAR(10) NOT NULL DEFAULT 'en'
                    CHECK (language_pref IN ('en', 'lg', 'sw', 'ac', 'rn', 'fr')),
    kyc_status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OTP table — for phone verification and login
CREATE TABLE auth.otps (
    otp_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) NOT NULL,
    code            VARCHAR(6) NOT NULL,
    purpose         VARCHAR(20) NOT NULL
                    CHECK (purpose IN ('register', 'login', 'payment', 'delivery')),
    is_used         BOOLEAN NOT NULL DEFAULT false,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh tokens — for keeping users logged in
CREATE TABLE auth.refresh_tokens (
    token_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    device_info     JSONB,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_revoked      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Farmer profiles — extended data for farmer role
CREATE TABLE auth.farmer_profiles (
    farmer_id           UUID PRIMARY KEY REFERENCES auth.users(user_id) ON DELETE CASCADE,
    national_id         VARCHAR(50) UNIQUE,
    district            VARCHAR(100) NOT NULL,
    village             VARCHAR(100),
    gps_lat             DECIMAL(10, 8),
    gps_lng             DECIMAL(11, 8),
    farm_size_acres     DECIMAL(8, 2),
    cooperative_id      UUID,
    payment_provider    VARCHAR(20) CHECK (payment_provider IN ('mtn', 'airtel')),
    payment_number      VARCHAR(20),
    crops_grown         TEXT[],         -- array of crop names
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Village agent profiles
CREATE TABLE auth.village_agent_profiles (
    agent_id            UUID PRIMARY KEY REFERENCES auth.users(user_id) ON DELETE CASCADE,
    territory_district  VARCHAR(100) NOT NULL,
    territory_villages  TEXT[],
    commission_rate     DECIMAL(5, 4) NOT NULL DEFAULT 0.02, -- 2% default
    total_farmers_reg   INTEGER NOT NULL DEFAULT 0,
    total_earnings      DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent-farmer relationship — tracks which agent registered which farmer
CREATE TABLE auth.agent_farmer_links (
    link_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id        UUID NOT NULL REFERENCES auth.village_agent_profiles(agent_id),
    farmer_id       UUID NOT NULL REFERENCES auth.farmer_profiles(farmer_id),
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, farmer_id)
);

-- Indexes for fast lookups
CREATE INDEX idx_users_phone ON auth.users(phone);
CREATE INDEX idx_users_role ON auth.users(role);
CREATE INDEX idx_otps_phone_purpose ON auth.otps(phone, purpose);
CREATE INDEX idx_refresh_tokens_user ON auth.refresh_tokens(user_id);
CREATE INDEX idx_farmer_district ON auth.farmer_profiles(district);
CREATE INDEX idx_agent_territory ON auth.village_agent_profiles(territory_district);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION auth.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at();

CREATE TRIGGER trg_farmer_updated_at
    BEFORE UPDATE ON auth.farmer_profiles
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at();