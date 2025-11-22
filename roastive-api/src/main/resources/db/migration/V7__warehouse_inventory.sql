-- Warehouse & Inventory tables

CREATE TABLE IF NOT EXISTS warehouse (
    warehouse_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    warehouse_name varchar(160) NOT NULL,
    type varchar(32) NOT NULL,
    location varchar(160),
    max_capacity numeric(18,3),
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_warehouse_name UNIQUE (roastery_id, warehouse_name)
);
CREATE INDEX IF NOT EXISTS idx_warehouse_roastery_type_status ON warehouse(roastery_id, type, status);

CREATE TABLE IF NOT EXISTS warehouse_receiving (
    receiving_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    warehouse_id uuid NOT NULL,
    purchase_id uuid,
    detail_id uuid,
    item_id uuid,
    lot_no varchar(80) NOT NULL,
    received_quantity numeric(18,4) NOT NULL,
    received_date timestamptz NOT NULL,
    operator varchar(120),
    remarks text,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_wr_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_wr_warehouse_item_lot ON warehouse_receiving(warehouse_id, item_id, lot_no);

CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    warehouse_id uuid NOT NULL,
    item_id uuid NOT NULL,
    lot_no varchar(80) NOT NULL,
    quantity numeric(18,4) NOT NULL,
    last_updated timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_inventory UNIQUE (roastery_id, warehouse_id, item_id, lot_no)
);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_item ON warehouse_inventory(warehouse_id, item_id);

CREATE TABLE IF NOT EXISTS warehouse_transfer (
    transfer_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    from_warehouse_id uuid NOT NULL,
    to_warehouse_id uuid NOT NULL,
    item_id uuid NOT NULL,
    lot_no varchar(80) NOT NULL,
    transfer_quantity numeric(18,4) NOT NULL,
    transfer_date timestamptz NOT NULL,
    operator varchar(120),
    remarks text,
    status varchar(32) NOT NULL,
    idempotency_key varchar(64) UNIQUE,
    void_reason varchar(160),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transfer_main ON warehouse_transfer(roastery_id, from_warehouse_id, to_warehouse_id, item_id, lot_no);

CREATE TABLE IF NOT EXISTS warehouse_adjustment (
    adjustment_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    warehouse_id uuid NOT NULL,
    item_id uuid NOT NULL,
    lot_no varchar(80) NOT NULL,
    delta_quantity numeric(18,4) NOT NULL,
    reason_code varchar(32) NOT NULL,
    adjusted_at timestamptz NOT NULL,
    operator varchar(120),
    remarks text,
    status varchar(32) NOT NULL,
    idempotency_key varchar(64) UNIQUE,
    void_reason varchar(160),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_adjustment_main ON warehouse_adjustment(roastery_id, warehouse_id, item_id, lot_no);

CREATE TABLE IF NOT EXISTS inventory_status_log (
    log_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    source_type varchar(32) NOT NULL,
    source_id uuid NOT NULL,
    action varchar(16) NOT NULL,
    warehouse_id uuid,
    other_warehouse_id uuid,
    item_id uuid NOT NULL,
    lot_no varchar(80) NOT NULL,
    delta numeric(18,4) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_status_source ON inventory_status_log(roastery_id, source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status_item ON inventory_status_log(warehouse_id, item_id, lot_no);


