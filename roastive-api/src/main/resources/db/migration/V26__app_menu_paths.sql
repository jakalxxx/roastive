-- Ensure sidebar entries link to actual application routes

UPDATE app_menu
SET path = '/dashboard'
WHERE menu_key = 'HOME_DASHBOARD'
  AND (path IS NULL OR path = '');

UPDATE app_menu
SET path = '/orders'
WHERE menu_key = 'ORDER_LIST'
  AND (path IS NULL OR path = '');


