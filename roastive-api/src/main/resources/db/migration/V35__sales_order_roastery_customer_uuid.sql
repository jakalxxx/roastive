-- Dev/TEST: reset sales order tables and switch roastery_id/customer_id to uuid

TRUNCATE TABLE sales_order_status_log, sales_order_line, sales_order;

ALTER TABLE sales_order
    ALTER COLUMN roastery_id TYPE uuid USING roastery_id::text::uuid,
    ALTER COLUMN customer_id TYPE uuid USING customer_id::text::uuid;









