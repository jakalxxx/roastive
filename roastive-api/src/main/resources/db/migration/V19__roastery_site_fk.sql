-- Ensure roastery_site.address_id always points to an address that belongs to the same roastery
-- 1) Add composite unique key on (roastery_id, address_id) in roastery_address (noop if already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'roastery_address' AND constraint_type = 'UNIQUE' AND constraint_name = 'uq_ra_roastery_address'
    ) THEN
        ALTER TABLE roastery_address
            ADD CONSTRAINT uq_ra_roastery_address UNIQUE (roastery_id, address_id);
    END IF;
END$$;

-- 2) Create index on roastery_site(address_id) to speed up joins (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = ANY (current_schemas(false)) AND indexname = 'idx_rs_address'
    ) THEN
        CREATE INDEX idx_rs_address ON roastery_site(address_id);
    END IF;
END$$;

-- 3) Replace existing FK (address_id -> roastery_address.address_id) with composite FK (roastery_id, address_id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'roastery_site' AND constraint_name = 'fk_rs_address'
    ) THEN
        ALTER TABLE roastery_site DROP CONSTRAINT fk_rs_address;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'roastery_site' AND constraint_name = 'fk_rs_address_composite'
    ) THEN
        ALTER TABLE roastery_site
            ADD CONSTRAINT fk_rs_address_composite FOREIGN KEY (roastery_id, address_id)
            REFERENCES roastery_address(roastery_id, address_id) ON DELETE SET NULL;
    END IF;
END$$;


