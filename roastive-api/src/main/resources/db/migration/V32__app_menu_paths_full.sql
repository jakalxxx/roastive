UPDATE app_menu SET path = '/orders'
WHERE menu_key = 'ORDER_LIST' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/production'
WHERE menu_key = 'PRODUCTION_LIST' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/inbound/green-bean'
WHERE menu_key = 'INBOUND_GREEN_BEAN' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/inbound/silos'
WHERE menu_key = 'INBOUND_SILO' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/procurement/contracts'
WHERE menu_key = 'PROCUREMENT_CONTRACT' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/procurement/items'
WHERE menu_key = 'PROCUREMENT_ITEM' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/products'
WHERE menu_key = 'PRODUCT_LIST' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/products/new'
WHERE menu_key = 'PRODUCT_CREATE' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/settlement'
WHERE menu_key = 'SETTLEMENT_LIST' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/settlement/tax'
WHERE menu_key = 'SETTLEMENT_TAX' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/settlement/statement'
WHERE menu_key = 'SETTLEMENT_STATEMENT' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/user/accounts'
WHERE menu_key = 'USER_ACCOUNT_LIST' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/user/customers'
WHERE menu_key = 'USER_CUSTOMER_LIST' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/user/roasteries'
WHERE menu_key = 'USER_ROASTERY_LIST' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/inventory/warehouses'
WHERE menu_key = 'INVENTORY_WAREHOUSE' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/inventory/silos'
WHERE menu_key = 'INVENTORY_SILO' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/procurement/materials/ledger'
WHERE menu_key IN ('MATERIAL_LEDGER', 'MATERIAL_LEDGER_EXPORT') AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/system/settings'
WHERE menu_key = 'SYSTEM_GENERAL' AND (path IS NULL OR path = '');

UPDATE app_menu SET path = '/system/roles'
WHERE menu_key = 'SYSTEM_ROLE' AND (path IS NULL OR path = '');
























