-- Add branch_seq_no column to roastery_address and backfill from roastery_site

ALTER TABLE roastery_address
    ADD COLUMN IF NOT EXISTS branch_seq_no varchar(4);

-- Backfill using existing roastery_site data
UPDATE roastery_address ra
SET branch_seq_no = COALESCE(rs.branch_seq_no, '0000')
FROM roastery_site rs
WHERE rs.address_id = ra.address_id
  AND (ra.branch_seq_no IS NULL OR ra.branch_seq_no <> rs.branch_seq_no);

-- Ensure HQ defaults to 0000
UPDATE roastery_address
SET branch_seq_no = '0000'
WHERE branch_seq_no IS NULL;

-- Enforce defaults and format
ALTER TABLE roastery_address
    ALTER COLUMN branch_seq_no SET DEFAULT '0000';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'roastery_address' AND constraint_name = 'ck_roastery_address_branch_seq_no'
    ) THEN
        ALTER TABLE roastery_address
            ADD CONSTRAINT ck_roastery_address_branch_seq_no CHECK (branch_seq_no ~ '^[0-9]{4}$');
    END IF;
END$$;

ALTER TABLE roastery_address
    ALTER COLUMN branch_seq_no SET NOT NULL;










































