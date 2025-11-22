-- Greenbean Silo & Release

CREATE TABLE IF NOT EXISTS greenbean_silo (
    silo_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    silo_name varchar(120) NOT NULL,
    capacity numeric(18,3),
    location varchar(160),
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_silo UNIQUE (roastery_id, silo_name)
);
CREATE INDEX IF NOT EXISTS idx_silo_roastery_status ON greenbean_silo(roastery_id, status);

CREATE TABLE IF NOT EXISTS silo_inventory (
    id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    silo_id uuid NOT NULL,
    item_id uuid NOT NULL,
    lot_no varchar(80) NOT NULL,
    quantity numeric(18,4) NOT NULL,
    first_loaded_at timestamptz NOT NULL DEFAULT now(),
    last_updated timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_silo_inventory UNIQUE (roastery_id, silo_id, item_id, lot_no)
);
CREATE INDEX IF NOT EXISTS idx_silo_inventory_sid_item ON silo_inventory(silo_id, item_id);

CREATE TABLE IF NOT EXISTS silo_release (
    release_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    silo_id uuid NOT NULL,
    production_id uuid,
    target_qty numeric(18,4) NOT NULL,
    release_date timestamptz NOT NULL,
    operator varchar(120),
    remarks text,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_silo_release_main ON silo_release(roastery_id, silo_id, status);

CREATE TABLE IF NOT EXISTS silo_release_detail (
    release_detail_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    release_id uuid NOT NULL,
    roastery_id bigint NOT NULL,
    silo_id uuid NOT NULL,
    item_id uuid NOT NULL,
    lot_no varchar(80) NOT NULL,
    release_qty numeric(18,4) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_srd_release FOREIGN KEY (release_id) REFERENCES silo_release(release_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_silo_release_detail_rid ON silo_release_detail(release_id);


