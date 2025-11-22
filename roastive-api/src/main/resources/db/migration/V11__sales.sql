-- Sales Order tables

CREATE TABLE IF NOT EXISTS sales_order (
    order_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    order_no varchar(40) NOT NULL,
    customer_id bigint NOT NULL,
    order_date timestamptz NOT NULL,
    cutoff_date timestamptz,
    currency varchar(16) NOT NULL,
    status varchar(32) NOT NULL,
    remarks text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_order_main ON sales_order(roastery_id, customer_id, status, order_date);

CREATE TABLE IF NOT EXISTS sales_order_line (
    order_detail_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity numeric(18,4) NOT NULL,
    unit varchar(16) NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    amount numeric(18,4) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_order_line_order ON sales_order_line(order_id);

CREATE TABLE IF NOT EXISTS sales_order_status_log (
    log_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    order_id uuid NOT NULL,
    status varchar(32) NOT NULL,
    memo text,
    changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_order_status ON sales_order_status_log(order_id, status);


