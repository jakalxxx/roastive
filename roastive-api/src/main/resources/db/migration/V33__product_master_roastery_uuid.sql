-- Change product_master.roastery_id to uuid
-- 기존 bigint 데이터를 삭제/비움 후 스키마를 uuid로 전환한다.
-- (개발 데이터만 존재한다고 가정)
TRUNCATE TABLE product_variant, product_recipe, product_asset, product_base_price, product_recipe_set, packaging_master, product_master CASCADE;

ALTER TABLE product_master
    ALTER COLUMN roastery_id TYPE uuid USING roastery_id::text::uuid;















