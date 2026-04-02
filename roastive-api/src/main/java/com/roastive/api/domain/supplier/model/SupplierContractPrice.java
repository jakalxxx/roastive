package com.roastive.api.domain.supplier.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "supplier_contract_price")
public class SupplierContractPrice {
    @Id
    @Column(name = "contract_price_id", nullable = false, columnDefinition = "uuid")
    private UUID contractPriceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    private SupplierContract contract;

    @Column(name = "item_id", nullable = false, columnDefinition = "uuid")
    private UUID itemId;

    @Column(name = "unit_price", nullable = false, precision = 18, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "valid_from", nullable = false)
    private OffsetDateTime validFrom;

    @Column(name = "valid_to")
    private OffsetDateTime validTo;

    @Column(name = "min_qty", precision = 18, scale = 4)
    private BigDecimal minQty;

    @PrePersist
    public void prePersist() {
        if (contractPriceId == null) contractPriceId = UUID.randomUUID();
    }

    public UUID getContractPriceId() { return contractPriceId; }
    public void setContractPriceId(UUID contractPriceId) { this.contractPriceId = contractPriceId; }
    public SupplierContract getContract() { return contract; }
    public void setContract(SupplierContract contract) { this.contract = contract; }
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { this.itemId = itemId; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public OffsetDateTime getValidFrom() { return validFrom; }
    public void setValidFrom(OffsetDateTime validFrom) { this.validFrom = validFrom; }
    public OffsetDateTime getValidTo() { return validTo; }
    public void setValidTo(OffsetDateTime validTo) { this.validTo = validTo; }
    public BigDecimal getMinQty() { return minQty; }
    public void setMinQty(BigDecimal minQty) { this.minQty = minQty; }
}


























