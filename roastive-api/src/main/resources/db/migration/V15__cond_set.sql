-- Portable code_set upsert migration (idempotent)

-- STATUS_GENERIC
INSERT INTO code_set (id, code_type, code_key, label, sort, active, meta, created_at, updated_at)
VALUES (uuid_generate_v7(), 'STATUS_GENERIC', 'ACTIVE', '활성', 1, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set (id, code_type, code_key, label, sort, active, meta, created_at, updated_at)
VALUES (uuid_generate_v7(), 'STATUS_GENERIC', 'INACTIVE', '비활성', 2, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- ORDER_STATUS
INSERT INTO code_set (id, code_type, code_key, label, sort, active, meta, created_at, updated_at) VALUES
(uuid_generate_v7(), 'ORDER_STATUS', 'DRAFT', '임시', 1, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ORDER_STATUS', 'PENDING', '대기', 2, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ORDER_STATUS', 'APPROVED', '승인', 3, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ORDER_STATUS', 'LOCKED', '잠금', 4, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ORDER_STATUS', 'CANCELLED', '취소', 5, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ORDER_STATUS', 'SHIPPED', '출고', 6, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'ORDER_STATUS', 'COMPLETED', '완료', 7, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- PURCHASE_STATUS
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PURCHASE_STATUS', 'DRAFT', '임시', 1, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PURCHASE_STATUS', 'CONFIRMED', '확정', 2, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PURCHASE_STATUS', 'RECEIVED', '입고', 3, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PURCHASE_STATUS', 'CLOSED', '종결', 4, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'PURCHASE_STATUS', 'CANCELLED', '취소', 5, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

-- INVENTORY_TXN_TYPE
INSERT INTO code_set VALUES (uuid_generate_v7(), 'INVENTORY_TXN_TYPE', 'RECEIVING', '입고', 1, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();
INSERT INTO code_set VALUES (uuid_generate_v7(), 'INVENTORY_TXN_TYPE', 'TRANSFER_IN', '이동입고', 2, true, null, now(), now())
ON CONFLICT (code_type, code_key) DO UPDATE SET label=EXCLUDED.label, sort=EXCLUDED.sort, active=EXCLUDED.active, updated_at=now();

