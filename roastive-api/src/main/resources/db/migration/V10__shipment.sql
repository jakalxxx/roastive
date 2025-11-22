-- Shipment tables

CREATE TABLE IF NOT EXISTS shipment_master (
    shipment_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    order_id bigint NOT NULL,
    shipment_date timestamptz NOT NULL,
    status varchar(32) NOT NULL,
    tracking_no varchar(120),
    remarks text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT idx_shipment_master_roastery_order UNIQUE (roastery_id, order_id)
);
CREATE INDEX IF NOT EXISTS idx_shipment_master_main ON shipment_master(roastery_id, order_id);

CREATE TABLE IF NOT EXISTS shipment_detail (
    detail_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    shipment_id uuid NOT NULL,
    packaging_detail_id bigint,
    quantity int NOT NULL,
    CONSTRAINT fk_shipment_detail_master FOREIGN KEY (shipment_id) REFERENCES shipment_master(shipment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shipment_address_snapshot (
    snapshot_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    shipment_id bigint NOT NULL,
    address_type varchar(16) NOT NULL,
    postal_code varchar(20),
    address_line1 varchar(200) NOT NULL,
    address_line2 varchar(200),
    contact_name varchar(120) NOT NULL,
    phone varchar(64),
    email varchar(160),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shipment_addr_snapshot ON shipment_address_snapshot(shipment_id, address_type);


