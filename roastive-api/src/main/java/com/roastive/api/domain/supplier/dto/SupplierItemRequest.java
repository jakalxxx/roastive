package com.roastive.api.domain.supplier.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SupplierItemRequest {
    @NotNull
    private UUID itemId;

    @Size(max = 80)
    private String vendorSku;

    @Size(max = 160)
    private String vendorName;

    private Integer leadTimeDays;
    private BigDecimal moq;

    @Size(max = 8)
    private String currency;

    private BigDecimal lastPrice;
    private OffsetDateTime lastPriceDate;

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
}


























