-- Enforce single HEADQUARTERS address per roastery via partial unique index
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = ANY (current_schemas(false)) AND indexname = 'uq_ra_headquarters_per_roastery'
    ) THEN
        CREATE UNIQUE INDEX uq_ra_headquarters_per_roastery
            ON roastery_address(roastery_id)
            WHERE (upper(address_type) = 'HEADQUARTERS');
    END IF;
END$$;


