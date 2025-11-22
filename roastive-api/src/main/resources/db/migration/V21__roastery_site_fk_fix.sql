-- Revert composite FK to single-column FK to allow address deletion without nulling roastery_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'roastery_site' AND constraint_name = 'fk_rs_address_composite'
    ) THEN
        ALTER TABLE roastery_site DROP CONSTRAINT fk_rs_address_composite;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'roastery_site' AND constraint_name = 'fk_rs_address'
    ) THEN
        ALTER TABLE roastery_site
            ADD CONSTRAINT fk_rs_address FOREIGN KEY (address_id)
            REFERENCES roastery_address(address_id) ON DELETE SET NULL;
    END IF;
END$$;


