package com.roastive.api.domain.supplier.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SupplierItemDto {
    private UUID supplierItemId;
    private UUID supplierId;
    private UUID itemId;
    private String vendorSku;
    private String vendorName;
    private Integer leadTimeDays;
    private BigDecimal moq;
    private String currency;
    private BigDecimal lastPrice;
    private OffsetDateTime lastPriceDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public UUID getSupplierItemId() { return supplierItemId; }
    public void setSupplierItemId(UUID supplierItemId) { this.supplierItemId = supplierItemId; }
    public UUID getSupplierId() { return supplierId; }
    public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { this.itemId = itemId; }
    public String getVendorSku() { return vendorSku; }
    public void setVendorSku(String vendorSku) { this.vendorSku = vendorSku; }
    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }
    public BigDecimal getMoq() { return moq; }
    public void setMoq(BigDecimal moq) { this.moq = moq; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getLastPrice() { return lastPrice; }
    public void setLastPrice(BigDecimal lastPrice) { this.lastPrice = lastPrice; }
    public OffsetDateTime getLastPriceDate() { return lastPriceDate; }
    public void setLastPriceDate(OffsetDateTime lastPriceDate) { this.lastPriceDate = lastPriceDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


























