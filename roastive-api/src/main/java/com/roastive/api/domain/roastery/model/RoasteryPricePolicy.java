package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "roastery_price_policy")
public class RoasteryPricePolicy {
    @Id
    @Column(name = "price_policy_id", nullable = false, columnDefinition = "uuid")
    private UUID pricePolicyId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "rounding_mode", length = 32)
    private String roundingMode;

    @Column(name = "price_precision")
    private Integer pricePrecision;

    @Column(name = "currency", length = 8)
    private String currency;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "status", length = 32)
    private String status;

    public UUID getPricePolicyId() { return pricePolicyId; }
    public void setPricePolicyId(UUID pricePolicyId) { this.pricePolicyId = pricePolicyId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public String getRoundingMode() { return roundingMode; }
    public void setRoundingMode(String roundingMode) { this.roundingMode = roundingMode; }
    public Integer getPricePrecision() { return pricePrecision; }
    public void setPricePrecision(Integer pricePrecision) { this.pricePrecision = pricePrecision; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}


