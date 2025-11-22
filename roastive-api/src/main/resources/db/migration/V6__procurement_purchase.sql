-- Procurement: Purchase Master & Detail

CREATE TABLE IF NOT EXISTS purchase_master (
    purchase_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    supplier_id uuid NOT NULL,
    purchase_no varchar(40) NOT NULL UNIQUE,
    invoice_no varchar(80),
    purchase_date timestamptz NOT NULL,
    expected_arrival timestamptz,
    currency varchar(16) NOT NULL,
    payment_terms varchar(80),
    payment_date timestamptz,
    status varchar(32) NOT NULL,
    remarks text,
    total_amount numeric(18,4) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_pm_supplier FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_purchase_master_roastery_supplier_status ON purchase_master(roastery_id, supplier_id, status);

CREATE TABLE IF NOT EXISTS purchase_detail (
    detail_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    purchase_id uuid NOT NULL,
    item_id uuid NOT NULL,
    quantity numeric(18,4) NOT NULL,
    unit varchar(16) NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    amount numeric(18,4) NOT NULL,
    lot_hint varchar(80),
    remarks text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_pd_purchase FOREIGN KEY (purchase_id) REFERENCES purchase_master(purchase_id) ON DELETE CASCADE,
    CONSTRAINT fk_pd_item FOREIGN KEY (item_id) REFERENCES item_master(item_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_purchase_detail_purchase ON purchase_detail(purchase_id);


