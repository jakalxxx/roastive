-- Add branch_seq_no to roastery_site
ALTER TABLE roastery_site
  ADD COLUMN IF NOT EXISTS branch_seq_no CHAR(4) NOT NULL DEFAULT '0000';

-- Backfill: HQ -> '0000', Non-HQ -> 0001, 0002 ... per roastery (stable order)
WITH numbered AS (
  SELECT
    site_id,
    CASE
      WHEN is_default THEN '0000'
      ELSE lpad(CAST(row_number() OVER (PARTITION BY roastery_id ORDER BY created_at, site_id) AS text), 4, '0')
    END AS seq
  FROM roastery_site
)
UPDATE roastery_site rs
SET branch_seq_no = n.seq
FROM numbered n
WHERE n.site_id = rs.site_id;

-- Ensure 4-digit format
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ck_roastery_site_branch_seq_no_format'
      AND table_name = 'roastery_site'
  ) THEN
    ALTER TABLE roastery_site
      ADD CONSTRAINT ck_roastery_site_branch_seq_no_format CHECK (branch_seq_no ~ '^[0-9]{4}$');
  END IF;
END$$;

-- Unique per roastery
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uq_roastery_site_roastery_branch'
  ) THEN
    CREATE UNIQUE INDEX uq_roastery_site_roastery_branch ON roastery_site (roastery_id, branch_seq_no);
  END IF;
END$$;


