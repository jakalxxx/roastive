-- Ensure user-related secondary menus navigate to implemented pages

UPDATE app_menu
SET path = '/user/customers'
WHERE menu_key = 'USER_CUSTOMER_LIST'
  AND (path IS NULL OR path = '');

UPDATE app_menu
SET path = '/user/roasteries'
WHERE menu_key = 'USER_ROASTERY_LIST'
  AND (path IS NULL OR path = '');

UPDATE app_menu
SET path = '/user/accounts'
WHERE menu_key = 'USER_ACCOUNT_LIST'
  AND (path IS NULL OR path = '');

UPDATE app_menu
SET path = '/procurement/suppliers'
WHERE menu_key = 'USER_SUPPLIER_LIST'
  AND (path IS NULL OR path = '');

UPDATE app_menu
SET path = '/shipping/labels'
WHERE menu_key = 'SHIPPING_LABEL'
  AND (path IS NULL OR path = '');

UPDATE app_menu
SET path = '/shipping/outbound'
WHERE menu_key = 'SHIPPING_OUTBOUND'
  AND (path IS NULL OR path = '');


