-- Product & Packaging master tables

CREATE TABLE IF NOT EXISTS product_master (
    product_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    product_name varchar(160) NOT NULL,
    product_type varchar(32) NOT NULL,
    unit varchar(16) NOT NULL,
    avg_loss_rate numeric(5,2),
    description text,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    base_price numeric(18,4),
    CONSTRAINT uq_product_master_name UNIQUE (roastery_id, product_name)
);

CREATE TABLE IF NOT EXISTS product_variant (
    variant_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    product_id uuid NOT NULL,
    unit_size numeric(10,3) NOT NULL,
    unit varchar(16) NOT NULL,
    sku varchar(64) UNIQUE,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES product_master(product_id) ON DELETE CASCADE,
    CONSTRAINT uq_variant UNIQUE (product_id, unit_size, unit)
);

CREATE INDEX IF NOT EXISTS idx_product_variant_product ON product_variant(product_id);

CREATE TABLE IF NOT EXISTS product_recipe (
    recipe_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    product_id uuid NOT NULL,
    silo_id bigint,
    ingredient_name varchar(160) NOT NULL,
    ratio numeric(6,3) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_recipe_product FOREIGN KEY (product_id) REFERENCES product_master(product_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_recipe_product ON product_recipe(product_id);

CREATE TABLE IF NOT EXISTS product_asset (
    asset_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    product_id uuid NOT NULL,
    kind varchar(32) NOT NULL,
    url varchar(512) NOT NULL,
    title varchar(160),
    meta jsonb,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_asset_product FOREIGN KEY (product_id) REFERENCES product_master(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS packaging_master (
    packaging_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    product_id uuid NOT NULL,
    unit_size numeric(10,3) NOT NULL,
    unit varchar(16) NOT NULL,
    description text,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_packaging_product FOREIGN KEY (product_id) REFERENCES product_master(product_id) ON DELETE CASCADE,
    CONSTRAINT uq_packaging UNIQUE (product_id, unit_size, unit)
);


