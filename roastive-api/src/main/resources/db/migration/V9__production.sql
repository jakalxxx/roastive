-- Production Planning & Execution

-- roaster_master
CREATE TABLE IF NOT EXISTS roaster_master (
    roaster_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    roaster_name varchar(160) NOT NULL,
    manufacturer varchar(120),
    model varchar(120),
    serial_no varchar(120),
    purchase_date timestamptz,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_roaster_serial UNIQUE (roastery_id, serial_no)
);
CREATE INDEX IF NOT EXISTS idx_roaster_roastery ON roaster_master(roastery_id);

-- roaster_charge_profile
CREATE TABLE IF NOT EXISTS roaster_charge_profile (
    profile_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roaster_id uuid NOT NULL,
    input_capacity numeric(10,2) NOT NULL,
    avg_loss_rate numeric(5,2),
    avg_duration int,
    remarks text,
    CONSTRAINT fk_rcp_roaster FOREIGN KEY (roaster_id) REFERENCES roaster_master(roaster_id) ON DELETE CASCADE,
    CONSTRAINT uq_rcp UNIQUE (roaster_id, input_capacity)
);
CREATE INDEX IF NOT EXISTS idx_rcp_roaster ON roaster_charge_profile(roaster_id);

-- roaster_maintenance
CREATE TABLE IF NOT EXISTS roaster_maintenance (
    maintenance_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roaster_id uuid NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz,
    type varchar(60),
    description text,
    cost numeric(18,4),
    operator varchar(120),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_rm_roaster FOREIGN KEY (roaster_id) REFERENCES roaster_master(roaster_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rm_roaster_time ON roaster_maintenance(roaster_id, start_time);

-- production_plan
CREATE TABLE IF NOT EXISTS production_plan (
    plan_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    plan_date timestamptz NOT NULL,
    cutoff_time timestamptz,
    status varchar(32) NOT NULL,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pp_main ON production_plan(roastery_id, plan_date, status);

-- production_plan_detail
CREATE TABLE IF NOT EXISTS production_plan_detail (
    plan_detail_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    plan_id uuid NOT NULL,
    product_id uuid NOT NULL,
    total_quantity numeric(18,4) NOT NULL,
    required_input numeric(18,4) NOT NULL,
    unit varchar(16) NOT NULL,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_ppd_plan FOREIGN KEY (plan_id) REFERENCES production_plan(plan_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ppd_plan_product ON production_plan_detail(plan_id, product_id);

-- production_batch
CREATE TABLE IF NOT EXISTS production_batch (
    batch_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    plan_detail_id uuid NOT NULL,
    roaster_id uuid NOT NULL,
    profile_id uuid,
    input_quantity numeric(18,4) NOT NULL,
    expected_output numeric(18,4) NOT NULL,
    sequence_no int NOT NULL,
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_pb_detail FOREIGN KEY (plan_detail_id) REFERENCES production_plan_detail(plan_detail_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pb_detail ON production_batch(plan_detail_id, roaster_id, status);

-- production_schedule
CREATE TABLE IF NOT EXISTS production_schedule (
    schedule_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    batch_id uuid UNIQUE NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    operator varchar(120),
    status varchar(32) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_ps_batch FOREIGN KEY (batch_id) REFERENCES production_batch(batch_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ps_time ON production_schedule(start_time, end_time);

-- production_master
CREATE TABLE IF NOT EXISTS production_master (
    production_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    roastery_id bigint NOT NULL,
    batch_id uuid,
    product_id uuid NOT NULL,
    roaster_id uuid NOT NULL,
    production_date timestamptz NOT NULL DEFAULT now(),
    status varchar(32) NOT NULL,
    operator varchar(120),
    lot_no varchar(80),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pm_main ON production_master(roastery_id, status);
CREATE INDEX IF NOT EXISTS idx_pm_batch ON production_master(batch_id);

-- production_input
CREATE TABLE IF NOT EXISTS production_input (
    input_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    production_id uuid NOT NULL,
    release_detail_id uuid NOT NULL,
    lot_no varchar(80) NOT NULL,
    input_quantity numeric(18,4) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pi_prod ON production_input(production_id);
CREATE INDEX IF NOT EXISTS idx_pi_release ON production_input(release_detail_id);

-- production_output
CREATE TABLE IF NOT EXISTS production_output (
    output_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    production_id uuid NOT NULL,
    roasted_quantity numeric(18,4) NOT NULL,
    defect_quantity numeric(18,4),
    output_date timestamptz NOT NULL DEFAULT now(),
    remarks text
);
CREATE INDEX IF NOT EXISTS idx_po_prod ON production_output(production_id);


