package com.roastive.api.domain.sales.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface SalesReportProjection {
    UUID getOrder_id();
    String getOrder_no();
    Instant getOrder_date();
    UUID getCustomer_id();
    String getCustomer_name();
    String getCurrency();
    String getStatus();
    BigDecimal getTotal_amount();
    String getBlend_names();
}















