-- Tax Invoice tables

CREATE TABLE IF NOT EXISTS tax_invoice_master (
    invoice_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    order_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    invoice_date timestamptz NOT NULL,
    currency varchar(8) NOT NULL,
    supply_amount numeric(18,2) NOT NULL,
    vat_amount numeric(18,2) NOT NULL,
    total_amount numeric(18,2) NOT NULL,
    tax_rate numeric(5,2) NOT NULL,
    status varchar(16) NOT NULL,
    remarks text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tim_main ON tax_invoice_master(roastery_id, order_id);
CREATE INDEX IF NOT EXISTS idx_tim_status_date ON tax_invoice_master(roastery_id, status, invoice_date);

CREATE TABLE IF NOT EXISTS tax_invoice_detail (
    detail_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    invoice_id uuid NOT NULL,
    order_detail_id uuid,
    product_id uuid,
    variant_id uuid,
    description varchar(240) NOT NULL,
    quantity numeric(18,3) NOT NULL,
    unit varchar(16) NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    supply_amount numeric(18,2) NOT NULL,
    vat_amount numeric(18,2) NOT NULL,
    total_amount numeric(18,2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tid_main ON tax_invoice_detail(roastery_id, invoice_id);

CREATE TABLE IF NOT EXISTS tax_invoice_party_snapshot (
    snapshot_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    invoice_id uuid NOT NULL,
    party_type varchar(16) NOT NULL,
    business_reg_no varchar(32),
    name varchar(160) NOT NULL,
    representative varchar(120),
    address varchar(240),
    email varchar(160),
    phone varchar(64),
    snapshot_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tips_main ON tax_invoice_party_snapshot(roastery_id, invoice_id);
CREATE INDEX IF NOT EXISTS idx_tips_party ON tax_invoice_party_snapshot(roastery_id, party_type);

CREATE TABLE IF NOT EXISTS tax_invoice_export_log (
    export_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    invoice_id uuid NOT NULL,
    provider varchar(32) NOT NULL,
    file_name varchar(200) NOT NULL,
    checksum_md5 varchar(32),
    status varchar(16) NOT NULL,
    error_message text,
    exported_by bigint,
    exported_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tiel_main ON tax_invoice_export_log(roastery_id, invoice_id, provider);


