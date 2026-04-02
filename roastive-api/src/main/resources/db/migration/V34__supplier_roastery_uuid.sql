-- Dev/TEST only: reset supplier domain and switch roastery_id to uuid

TRUNCATE TABLE supplier_contact, supplier_contract_price, supplier_contract, supplier_item, supplier CASCADE;

ALTER TABLE supplier
    ALTER COLUMN roastery_id TYPE uuid USING roastery_id::text::uuid;













