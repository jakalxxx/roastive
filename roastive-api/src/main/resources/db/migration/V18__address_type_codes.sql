-- ADDRESS_TYPE code_set + CHECK constraint on roastery_address.address_type

-- CODESET upserts (idempotent)
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ADDRESS_TYPE', 'HEADQUARTERS', '본점/본사', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ADDRESS_TYPE', 'FACTORY', '공장', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ADDRESS_TYPE', 'WAREHOUSE', '창고', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ADDRESS_TYPE', 'BILLING', '청구지', 4, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ADDRESS_TYPE', 'SHIPPING', '배송지', 5, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- CHECK constraint (add if not exists via DO block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'roastery_address' AND constraint_name = 'chk_roastery_address_type'
    ) THEN
        ALTER TABLE roastery_address
            ADD CONSTRAINT chk_roastery_address_type
            CHECK (address_type IN ('HEADQUARTERS','FACTORY','WAREHOUSE','BILLING','SHIPPING'));
    END IF;
END$$;


