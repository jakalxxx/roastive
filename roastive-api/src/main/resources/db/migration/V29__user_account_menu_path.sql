UPDATE app_menu
SET path = '/user/accounts'
WHERE menu_key = 'USER_ACCOUNT_LIST'
  AND (path IS NULL OR path = '');




























