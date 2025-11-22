-- Extend code_set upserts (idempotent). Mirrors additions appended to built V15.

-- INVENTORY_TXN_TYPE (continued)
INSERT INTO code_set VALUES (uuid_generate_v7(), 'INVENTORY_TXN_TYPE', 'TRANSFER_OUT', '이동출고', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'INVENTORY_TXN_TYPE', 'ADJUST_IN', '조정증가', 4, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'INVENTORY_TXN_TYPE', 'ADJUST_OUT', '조정감소', 5, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'INVENTORY_TXN_TYPE', 'CONSUME', '소모', 6, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'INVENTORY_TXN_TYPE', 'PRODUCE', '생산', 7, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- WAREHOUSE_TYPE
INSERT INTO code_set VALUES (uuid_generate_v7(), 'WAREHOUSE_TYPE', 'RAW_BEAN', '생두창고', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'WAREHOUSE_TYPE', 'FINISHED_GOODS', '완제품창고', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'WAREHOUSE_TYPE', 'MATERIAL', '자재창고', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- PRODUCT_TYPE
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PRODUCT_TYPE', 'BLEND', '블렌드', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PRODUCT_TYPE', 'SINGLE_ORIGIN', '싱글오리진', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- UNIT
INSERT INTO code_set VALUES (uuid_generate_v7(), 'UNIT', 'KG', '킬로그램', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'UNIT', 'G', '그램', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'UNIT', 'EA', '개', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'UNIT', 'BOX', '박스', 4, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'UNIT', 'BAG', '포대', 5, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- ITEM_CATEGORY
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ITEM_CATEGORY', 'GREEN_BEAN', '생두', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ITEM_CATEGORY', 'MATERIAL', '자재', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ITEM_CATEGORY', 'LOGISTICS', '물류', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ITEM_CATEGORY', 'PACKAGING', '포장자재', 4, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- CURRENCY
INSERT INTO code_set VALUES (uuid_generate_v7(), 'CURRENCY', 'KRW', '원', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'CURRENCY', 'USD', '달러', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'CURRENCY', 'JPY', '엔', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- TIMEZONE
INSERT INTO code_set VALUES (uuid_generate_v7(), 'TIMEZONE', 'Asia/Seoul', 'Asia/Seoul', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'TIMEZONE', 'Asia/Tokyo', 'Asia/Tokyo', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'TIMEZONE', 'UTC', 'UTC', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'TIMEZONE', 'America/Los_Angeles', 'America/Los_Angeles', 4, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- PACKAGING_UNIT
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PACKAGING_UNIT', '1000G', '1000그램', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PACKAGING_UNIT', '500G', '500그램', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PACKAGING_UNIT', '250G', '250그램', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PACKAGING_UNIT', '1KG', '1킬로그램', 4, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PACKAGING_UNIT', '5KG', '5킬로그램', 5, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PACKAGING_UNIT', '10KG', '10킬로그램', 6, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- ROLE_NAME
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ROLE_NAME', 'SYS_ADMIN', '시스템관리자', 1, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ROLE_NAME', 'ROASTERY_ADMIN', '로스터리관리자', 2, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ROLE_NAME', 'ROASTERY_STAFF', '로스터리스태프', 3, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ROLE_NAME', 'CUSTOMER_ADMIN', '고객사관리자', 4, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ROLE_NAME', 'CUSTOMER_STAFF', '고객사스태프', 5, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ROLE_NAME', 'MDM_APPROVER', 'MDM승인자', 11, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ROLE_NAME', 'MDM_EDITOR', 'MDM에디터', 12, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ROLE_NAME', 'MDM_VIEWER', 'MDM뷰어', 13, true, null, now(), now()) ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();


