package com.roastive.api.domain.sales.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class SalesOrderLineDto {
    private UUID orderDetailId;
    private UUID orderId;
    private UUID productId;
    private UUID variantId;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private String productName;

    public static SalesOrderLineDto fromProjection(SalesOrderLineProjection p) {
        SalesOrderLineDto dto = new SalesOrderLineDto();
        dto.setOrderDetailId(p.getOrder_detail_id());
        dto.setOrderId(p.getOrder_id());
        dto.setProductId(p.getProduct_id());
        dto.setVariantId(p.getVariant_id());
        dto.setQuantity(p.getQuantity());
        dto.setUnit(p.getUnit());
        dto.setUnitPrice(p.getUnit_price());
        dto.setAmount(p.getAmount());
        dto.setProductName(p.getProduct_name());
        return dto;
    }

    public UUID getOrderDetailId() { return orderDetailId; }
    public void setOrderDetailId(UUID orderDetailId) { this.orderDetailId = orderDetailId; }
    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public UUID getVariantId() { return variantId; }
    public void setVariantId(UUID variantId) { this.variantId = variantId; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
}








