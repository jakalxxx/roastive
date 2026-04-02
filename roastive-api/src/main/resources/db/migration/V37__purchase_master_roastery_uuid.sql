-- Change purchase_master.roastery_id to UUID and align with roastery PK
ALTER TABLE purchase_master
    ALTER COLUMN roastery_id TYPE uuid USING roastery_id::text::uuid;

