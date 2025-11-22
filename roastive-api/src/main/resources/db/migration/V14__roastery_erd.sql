-- Roastery ERD extension: codes, sites, addresses, contacts, banking, tax/logistics, policies, brand assets, documents, integrations, memberships

-- 1) roastery_code 추가 (사람이 읽기 쉬운 고유 코드)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'roastery' AND column_name = 'roastery_code'
    ) THEN
        ALTER TABLE roastery ADD COLUMN roastery_code varchar(32);
        CREATE UNIQUE INDEX IF NOT EXISTS uq_roastery_code ON roastery(roastery_code);
    END IF;
END$$;

-- 공통: uuidv7 기본키/타임스탬프, FK는 연쇄 삭제 기본(도메인 성격별 선택)

CREATE TABLE IF NOT EXISTS roastery_site (
    site_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    site_code varchar(64) NOT NULL,
    site_name varchar(160) NOT NULL,
    type varchar(32) NOT NULL,
    is_default boolean NOT NULL DEFAULT false,
    address_id uuid,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_rs_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE,
    CONSTRAINT uq_rs_code UNIQUE (roastery_id, site_code)
);
CREATE INDEX IF NOT EXISTS idx_rs_roastery ON roastery_site(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_address (
    address_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    address_type varchar(32) NOT NULL,
    postal_code varchar(32),
    address_line1 varchar(200),
    address_line2 varchar(200),
    city varchar(120),
    state varchar(120),
    country varchar(2),
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_ra_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ra_roastery ON roastery_address(roastery_id);

-- roastery_site.address_id -> roastery_address
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_rs_address'
    ) THEN
        ALTER TABLE roastery_site
            ADD CONSTRAINT fk_rs_address FOREIGN KEY (address_id) REFERENCES roastery_address(address_id) ON DELETE SET NULL;
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS roastery_contact (
    contact_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    contact_name varchar(160) NOT NULL,
    position varchar(160),
    phone varchar(64),
    email varchar(160),
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_rc_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rc_roastery ON roastery_contact(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_bank_account (
    bank_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    bank_name varchar(120),
    account_no varchar(120),
    account_holder varchar(160),
    swift_bic varchar(64),
    iban varchar(64),
    currency varchar(8),
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_rb_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rb_roastery ON roastery_bank_account(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_tax_profile (
    tax_profile_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    vat_no varchar(64),
    tax_type varchar(64),
    invoice_emission varchar(32),
    invoice_email varchar(160),
    remarks text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_rtp_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rtp_roastery ON roastery_tax_profile(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_logistics_profile (
    logistics_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    default_carrier varchar(120),
    default_service varchar(120),
    pickup_cutoff_time time,
    ship_from_address_id uuid,
    return_address_id uuid,
    status varchar(32),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_rlp_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE,
    CONSTRAINT fk_rlp_ship_from FOREIGN KEY (ship_from_address_id) REFERENCES roastery_address(address_id) ON DELETE SET NULL,
    CONSTRAINT fk_rlp_return FOREIGN KEY (return_address_id) REFERENCES roastery_address(address_id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_rlp_roastery ON roastery_logistics_profile(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_cutoff_policy (
    policy_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    weekday int NOT NULL,
    cutoff_time time NOT NULL,
    timezone varchar(64) NOT NULL,
    status varchar(32) NOT NULL,
    effective_from date,
    effective_to date,
    CONSTRAINT fk_rcp2_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rcp2 ON roastery_cutoff_policy(roastery_id, weekday, effective_from);

CREATE TABLE IF NOT EXISTS roastery_price_policy (
    price_policy_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    rounding_mode varchar(32),
    price_precision int,
    currency varchar(8),
    effective_from date,
    effective_to date,
    status varchar(32),
    CONSTRAINT fk_rpp_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rpp_roastery ON roastery_price_policy(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_qa_policy (
    qa_policy_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    color_whole_min numeric,
    color_whole_max numeric,
    color_ground_min numeric,
    color_ground_max numeric,
    moisture_max numeric,
    cupping_score_min numeric,
    effective_from date,
    effective_to date,
    status varchar(32),
    CONSTRAINT fk_rqa_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rqa_roastery ON roastery_qa_policy(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_brand_asset (
    asset_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    kind varchar(64),
    url varchar(400),
    title varchar(200),
    meta jsonb,
    status varchar(32),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_rba_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rba_roastery ON roastery_brand_asset(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_document (
    document_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    doc_type varchar(64),
    file_url varchar(400),
    file_name varchar(200),
    uploaded_at timestamptz NOT NULL DEFAULT now(),
    uploaded_by uuid,
    CONSTRAINT fk_rd_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE,
    CONSTRAINT fk_rd_user FOREIGN KEY (uploaded_by) REFERENCES user_account(user_id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_rd_roastery ON roastery_document(roastery_id);

CREATE TABLE IF NOT EXISTS roastery_integration (
    integration_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id uuid NOT NULL,
    provider varchar(64) NOT NULL,
    config_json jsonb,
    status varchar(32),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_ri_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ri_roastery ON roastery_integration(roastery_id);

-- 이미 V2에 roastery_user 있음. 중복 생성 방지 위해 생성문 제외

-- Warehouse는 이미 V7에 존재. 중복 방지

-- Customer_roastery 매핑 (고객 도메인과 연계). customer 테이블은 V2에 존재함
CREATE TABLE IF NOT EXISTS customer_roastery (
    mapping_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    customer_id uuid NOT NULL,
    roastery_id uuid NOT NULL,
    status varchar(32),
    requested_at timestamptz,
    approved_at timestamptz,
    CONSTRAINT fk_cr_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_roastery FOREIGN KEY (roastery_id) REFERENCES roastery(roastery_id) ON DELETE CASCADE,
    CONSTRAINT uq_cr UNIQUE (customer_id, roastery_id)
);
CREATE INDEX IF NOT EXISTS idx_cr_customer ON customer_roastery(customer_id);
CREATE INDEX IF NOT EXISTS idx_cr_roastery ON customer_roastery(roastery_id);


