package com.roastive.api.domain.sales.dto;

import java.time.Instant;
import java.util.UUID;

public interface SalesOrderListProjection {
    UUID getOrder_id();
    String getOrder_no();
    UUID getCustomer_id();
    String getCustomer_name();
    String getProduct_names();
    String getStatus();
    Instant getOrder_date();
}








