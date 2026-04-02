-- Application navigation menu tree

CREATE TABLE IF NOT EXISTS app_menu (
    menu_id uuid PRIMARY KEY DEFAULT COALESCE(uuid_generate_v7(), uuid_generate_v4()),
    parent_id uuid REFERENCES app_menu(menu_id) ON DELETE CASCADE,
    menu_key varchar(120) NOT NULL,
    title varchar(160) NOT NULL,
    path varchar(200),
    locale varchar(8) NOT NULL DEFAULT 'ko',
    display_order int NOT NULL DEFAULT 0,
    depth int NOT NULL DEFAULT 1,
    is_active boolean NOT NULL DEFAULT true,
    icon varchar(64),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_app_menu_key UNIQUE (menu_key),
    CONSTRAINT ck_app_menu_depth CHECK (depth >= 1)
);

CREATE INDEX IF NOT EXISTS idx_app_menu_parent ON app_menu(parent_id);
CREATE INDEX IF NOT EXISTS idx_app_menu_locale_order ON app_menu(locale, depth, display_order);

-- Seed default Korean navigation (idempotent inserts)
INSERT INTO app_menu(menu_key, title, locale, display_order, depth)
VALUES
    ('HOME', '홈', 'ko', 10, 1),
    ('ORDER_MGMT', '주문 관리', 'ko', 20, 1),
    ('SHIPPING_MGMT', '배송 관리', 'ko', 30, 1),
    ('PRODUCTION_MGMT', '생산 관리', 'ko', 40, 1),
    ('INBOUND_MGMT', '입고 관리', 'ko', 50, 1),
    ('PROCUREMENT_MGMT', '구매 관리', 'ko', 60, 1),
    ('PRODUCT_MGMT', '제품 관리', 'ko', 70, 1),
    ('SETTLEMENT_MGMT', '정산관리', 'ko', 80, 1),
    ('USER_MGMT', '사용자 관리', 'ko', 90, 1),
    ('EQUIPMENT_MGMT', '기기 관리', 'ko', 100, 1),
    ('INVENTORY_STATUS', '재고 현황', 'ko', 110, 1),
    ('MATERIAL_LEDGER', '원료 수불 대장', 'ko', 120, 1),
    ('ROASTERY_MGMT', '로스터리 관리', 'ko', 130, 1),
    ('SYSTEM_SETTINGS', '시스템 설정', 'ko', 140, 1),
    ('ANALYTICS', '통계', 'ko', 150, 1)
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'HOME_DASHBOARD', menu_id, '대시보드', '/dashboard', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'HOME'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'ORDER_LIST', menu_id, '주문 목록', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'ORDER_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'SHIPPING_LABEL', menu_id, '운송장 출력', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'SHIPPING_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'SHIPPING_OUTBOUND', menu_id, '출고 목록', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'SHIPPING_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'PRODUCTION_LIST', menu_id, '생산 목록', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'PRODUCTION_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'INBOUND_GREEN_BEAN', menu_id, '생두 입고 목록', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'INBOUND_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'INBOUND_SILO', menu_id, '사일로 입고 목록', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'INBOUND_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'PROCUREMENT_GREEN_BEAN', menu_id, '생두 구매 목록', '/procurement/green-bean', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'PROCUREMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'PROCUREMENT_MATERIAL', menu_id, '부자재 구매 목록', '/procurement/materials', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'PROCUREMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'PROCUREMENT_CONTRACT', menu_id, '구매처 계약 목록', 'ko', 30, 2
FROM app_menu WHERE menu_key = 'PROCUREMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'PROCUREMENT_ITEM', menu_id, '구매 상품 목록', 'ko', 40, 2
FROM app_menu WHERE menu_key = 'PROCUREMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'PRODUCT_LIST', menu_id, '제품 목록', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'PRODUCT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'PRODUCT_CREATE', menu_id, '제품 등록', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'PRODUCT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'SETTLEMENT_LIST', menu_id, '정산 목록', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'SETTLEMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'SETTLEMENT_TAX', menu_id, '세금계산서 발행', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'SETTLEMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'SETTLEMENT_STATEMENT', menu_id, '거래명세서 발행', 'ko', 30, 2
FROM app_menu WHERE menu_key = 'SETTLEMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'USER_ACCOUNT_LIST', menu_id, '사용자 목록', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'USER_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'USER_ACCOUNT_LIST', menu_id, '사용자 목록', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'USER_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'USER_CUSTOMER_LIST', menu_id, '고객사 목록', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'USER_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'USER_SUPPLIER_LIST', menu_id, '구매처 목록', '/procurement/suppliers', 'ko', 30, 2
FROM app_menu WHERE menu_key = 'USER_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'USER_ROASTERY_LIST', menu_id, '로스터리 목록', 'ko', 40, 2
FROM app_menu WHERE menu_key = 'USER_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'EQUIPMENT_ROASTER', menu_id, '로스터기 관리', '/equipment/roasters', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'EQUIPMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'EQUIPMENT_SILO', menu_id, '사일로 관리', '/equipment/silos', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'EQUIPMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'EQUIPMENT_WAREHOUSE', menu_id, '창고 관리', '/equipment/warehouses', 'ko', 30, 2
FROM app_menu WHERE menu_key = 'EQUIPMENT_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'INVENTORY_WAREHOUSE', menu_id, '창고 현황', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'INVENTORY_STATUS'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'INVENTORY_SILO', menu_id, '사일로 현황', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'INVENTORY_STATUS'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'MATERIAL_LEDGER_EXPORT', menu_id, '엑셀 다운로드', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'MATERIAL_LEDGER'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'ROASTERY_INFO', menu_id, '기본 정보', '/roastery/settings', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'ROASTERY_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'ROASTERY_SITE', menu_id, '사업장 관리', '/roastery/settings/sites', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'ROASTERY_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, path, locale, display_order, depth)
SELECT 'ROASTERY_CONTACT', menu_id, '담당자 관리', '/roastery/settings/contacts', 'ko', 30, 2
FROM app_menu WHERE menu_key = 'ROASTERY_MGMT'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'SYSTEM_GENERAL', menu_id, '기본 설정', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'SYSTEM_SETTINGS'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'SYSTEM_ROLE', menu_id, '권한 설정', 'ko', 20, 2
FROM app_menu WHERE menu_key = 'SYSTEM_SETTINGS'
ON CONFLICT (menu_key) DO NOTHING;

INSERT INTO app_menu(menu_key, parent_id, title, locale, display_order, depth)
SELECT 'ANALYTICS_SALES', menu_id, '매출 리포트', 'ko', 10, 2
FROM app_menu WHERE menu_key = 'ANALYTICS'
ON CONFLICT (menu_key) DO NOTHING;
