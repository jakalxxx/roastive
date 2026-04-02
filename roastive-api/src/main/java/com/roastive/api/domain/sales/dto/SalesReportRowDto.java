package com.roastive.api.domain.sales.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

public class SalesReportRowDto {
    private UUID orderId;
    private String orderNo;
    private OffsetDateTime orderDate;
    private UUID customerId;
    private String customerName;
    private String blendNames;
    private String currency;
    private String status;
    private BigDecimal totalAmount;

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public OffsetDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(OffsetDateTime orderDate) { this.orderDate = orderDate; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getBlendNames() { return blendNames; }
    public void setBlendNames(String blendNames) { this.blendNames = blendNames; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public static SalesReportRowDto fromProjection(SalesReportProjection projection) {
        SalesReportRowDto dto = new SalesReportRowDto();
        dto.setOrderId(projection.getOrder_id());
        dto.setOrderNo(projection.getOrder_no());
        if (projection.getOrder_date() != null) {
            dto.setOrderDate(OffsetDateTime.ofInstant(projection.getOrder_date(), ZoneOffset.UTC));
        } else {
            dto.setOrderDate(null);
        }
        dto.setCustomerId(projection.getCustomer_id());
        dto.setCustomerName(projection.getCustomer_name());
        dto.setBlendNames(projection.getBlend_names());
        dto.setCurrency(projection.getCurrency());
        dto.setStatus(projection.getStatus());
        dto.setTotalAmount(projection.getTotal_amount());
        return dto;
    }
}















