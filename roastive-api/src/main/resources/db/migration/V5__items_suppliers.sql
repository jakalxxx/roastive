-- Items & Suppliers core tables

-- item_master
CREATE TABLE IF NOT EXISTS item_master (
    item_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    category varchar(32) NOT NULL,
    name varchar(160) NOT NULL,
    base_unit varchar(16) NOT NULL,
    description text,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_item_master UNIQUE (roastery_id, name, base_unit)
);

-- item_green_bean
CREATE TABLE IF NOT EXISTS item_green_bean (
    item_id uuid PRIMARY KEY,
    origin varchar(120),
    farm varchar(120),
    variety varchar(120),
    process varchar(60),
    crop_year int,
    grade varchar(60),
    moisture numeric(5,2),
    density numeric(6,2),
    cupping_score numeric(5,2),
    cup_note text,
    CONSTRAINT fk_igb_item FOREIGN KEY (item_id) REFERENCES item_master(item_id) ON DELETE CASCADE
);

-- item_material
CREATE TABLE IF NOT EXISTS item_material (
    item_id uuid PRIMARY KEY,
    category_detail varchar(60),
    material_type varchar(60),
    color varchar(60),
    size varchar(60),
    dimensions varchar(120),
    thickness numeric(10,3),
    spec text,
    CONSTRAINT fk_im_item FOREIGN KEY (item_id) REFERENCES item_master(item_id) ON DELETE CASCADE
);

-- item_logistics
CREATE TABLE IF NOT EXISTS item_logistics (
    item_id uuid PRIMARY KEY,
    logistics_type varchar(60),
    provider varchar(120),
    CONSTRAINT fk_il_item FOREIGN KEY (item_id) REFERENCES item_master(item_id) ON DELETE CASCADE
);

-- item_uom
CREATE TABLE IF NOT EXISTS item_uom (
    uom_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    item_id uuid NOT NULL,
    from_unit varchar(16) NOT NULL,
    to_unit varchar(16) NOT NULL,
    factor numeric(18,6) NOT NULL,
    CONSTRAINT fk_uom_item FOREIGN KEY (item_id) REFERENCES item_master(item_id) ON DELETE CASCADE,
    CONSTRAINT uq_item_uom UNIQUE (item_id, from_unit, to_unit)
);
CREATE INDEX IF NOT EXISTS idx_item_uom_item ON item_uom(item_id);

-- supplier
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    supplier_name varchar(160) NOT NULL,
    contact_name varchar(120),
    phone varchar(60),
    email varchar(190),
    business_reg_no varchar(60),
    address text,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_supplier UNIQUE (roastery_id, supplier_name)
);

-- supplier_contact
CREATE TABLE IF NOT EXISTS supplier_contact (
    contact_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    supplier_id uuid NOT NULL,
    contact_name varchar(120) NOT NULL,
    phone varchar(64),
    email varchar(160),
    role varchar(64),
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_supplier_contact_supplier FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_supplier_contact_primary ON supplier_contact(supplier_id, is_primary);

-- supplier_contract
CREATE TABLE IF NOT EXISTS supplier_contract (
    contract_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    supplier_id uuid NOT NULL,
    contract_no varchar(64) NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    incoterm varchar(16),
    currency varchar(8),
    payment_terms varchar(80),
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_sc_supplier FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE CASCADE,
    CONSTRAINT uq_sc UNIQUE (supplier_id, contract_no)
);
CREATE INDEX IF NOT EXISTS idx_sc_supplier_status ON supplier_contract(supplier_id, status);

-- supplier_contract_price
CREATE TABLE IF NOT EXISTS supplier_contract_price (
    contract_price_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    contract_id uuid NOT NULL,
    item_id uuid NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    valid_from timestamptz NOT NULL,
    valid_to timestamptz,
    min_qty numeric(18,4),
    CONSTRAINT fk_scp_contract FOREIGN KEY (contract_id) REFERENCES supplier_contract(contract_id) ON DELETE CASCADE,
    CONSTRAINT fk_scp_item FOREIGN KEY (item_id) REFERENCES item_master(item_id) ON DELETE RESTRICT,
    CONSTRAINT uq_scp UNIQUE (contract_id, item_id, valid_from)
);
CREATE INDEX IF NOT EXISTS idx_scp_item ON supplier_contract_price(item_id);

-- supplier_item
CREATE TABLE IF NOT EXISTS supplier_item (
    supplier_item_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    supplier_id uuid NOT NULL,
    item_id uuid NOT NULL,
    vendor_sku varchar(80),
    vendor_name varchar(160),
    lead_time_days int,
    moq numeric(18,3),
    currency varchar(8),
    last_price numeric(18,4),
    last_price_date timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_si_supplier FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE CASCADE,
    CONSTRAINT fk_si_item FOREIGN KEY (item_id) REFERENCES item_master(item_id) ON DELETE CASCADE,
    CONSTRAINT uq_supplier_item UNIQUE (supplier_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_supplier_item_item ON supplier_item(item_id);


