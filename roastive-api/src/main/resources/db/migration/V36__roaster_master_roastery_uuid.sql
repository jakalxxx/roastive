-- Dev/TEST: reset roaster_master and switch roastery_id to uuid
-- This will TRUNCATE roaster_master and related tables, so run only in non-production environments.

TRUNCATE TABLE roaster_charge_profile, roaster_maintenance, production_batch, production_master, roaster_master CASCADE;

-- Drop dependent index / unique constraint before changing column type
ALTER TABLE roaster_master
  DROP CONSTRAINT IF EXISTS uq_roaster_serial;

DROP INDEX IF EXISTS idx_roaster_roastery;

-- Switch roastery_id from bigint -> uuid
ALTER TABLE roaster_master
  ALTER COLUMN roastery_id TYPE uuid
  USING roastery_id::text::uuid;

-- Recreate unique constraint and index with uuid type
ALTER TABLE roaster_master
  ADD CONSTRAINT uq_roaster_serial UNIQUE (roastery_id, serial_no);

CREATE INDEX IF NOT EXISTS idx_roaster_roastery ON roaster_master(roastery_id);






