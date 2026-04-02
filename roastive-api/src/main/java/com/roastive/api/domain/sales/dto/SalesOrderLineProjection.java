package com.roastive.api.domain.sales.dto;

import java.math.BigDecimal;
import java.util.UUID;

public interface SalesOrderLineProjection {
    UUID getOrder_detail_id();
    UUID getOrder_id();
    UUID getProduct_id();
    UUID getVariant_id();
    BigDecimal getQuantity();
    String getUnit();
    BigDecimal getUnit_price();
    BigDecimal getAmount();
    String getProduct_name();
}








