package com.roastive.api.domain.sales.dto;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

public class SalesOrderListDto {
    private UUID orderId;
    private String orderNo;
    private UUID customerId;
    private String customerName;
    private String productNames;
    private String status;
    private OffsetDateTime orderDate;

    public static SalesOrderListDto fromProjection(SalesOrderListProjection p) {
        SalesOrderListDto dto = new SalesOrderListDto();
        dto.setOrderId(p.getOrder_id());
        dto.setOrderNo(p.getOrder_no());
        dto.setCustomerId(p.getCustomer_id());
        dto.setCustomerName(p.getCustomer_name());
        dto.setProductNames(p.getProduct_names());
        dto.setStatus(p.getStatus());
        if (p.getOrder_date() != null) {
            dto.setOrderDate(OffsetDateTime.ofInstant(p.getOrder_date(), ZoneOffset.UTC));
        } else {
            dto.setOrderDate(null);
        }
        return dto;
    }

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }

    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getProductNames() { return productNames; }
    public void setProductNames(String productNames) { this.productNames = productNames; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(OffsetDateTime orderDate) { this.orderDate = orderDate; }
}









