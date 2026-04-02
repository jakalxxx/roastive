UPDATE app_menu
SET path = '/sales/reports'
WHERE menu_key = 'ANALYTICS_SALES'
  AND (path IS NULL OR path = '');
























