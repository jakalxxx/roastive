CREATE TABLE IF NOT EXISTS product_base_price (
    price_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    product_id uuid NOT NULL REFERENCES product_master(product_id) ON DELETE CASCADE,
    currency varchar(16) NOT NULL,
    amount numeric(18,4) NOT NULL,
    price_label varchar(120),
    effective_from timestamptz,
    effective_to timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_base_price_product ON product_base_price(product_id);

CREATE TABLE IF NOT EXISTS product_recipe_set (
    set_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    product_id uuid NOT NULL REFERENCES product_master(product_id) ON DELETE CASCADE,
    set_name varchar(120) NOT NULL,
    description text,
    status varchar(32) NOT NULL,
    ingredients jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_recipe_set_product ON product_recipe_set(product_id);






























