package com.roastive.api.domain.tax.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tax_invoice_detail")
public class TaxInvoiceDetail {
    @Id
    @Column(name = "detail_id", nullable = false, columnDefinition = "uuid")
    private UUID detailId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "invoice_id", nullable = false, columnDefinition = "uuid")
    private UUID invoiceId;

    @Column(name = "order_detail_id", columnDefinition = "uuid")
    private UUID orderDetailId;

    @Column(name = "product_id", columnDefinition = "uuid")
    private UUID productId;

    @Column(name = "variant_id", columnDefinition = "uuid")
    private UUID variantId;

    @Column(name = "description", nullable = false, length = 240)
    private String description;

    @Column(name = "quantity", precision = 18, scale = 3, nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit", length = 16, nullable = false)
    private String unit;

    @Column(name = "unit_price", precision = 18, scale = 4, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "supply_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal supplyAmount;

    @Column(name = "vat_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal vatAmount;

    @Column(name = "total_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (detailId == null) detailId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public UUID getDetailId() { return detailId; }
    public void setDetailId(UUID detailId) { this.detailId = detailId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }
    public UUID getOrderDetailId() { return orderDetailId; }
    public void setOrderDetailId(UUID orderDetailId) { this.orderDetailId = orderDetailId; }
    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public UUID getVariantId() { return variantId; }
    public void setVariantId(UUID variantId) { this.variantId = variantId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getSupplyAmount() { return supplyAmount; }
    public void setSupplyAmount(BigDecimal supplyAmount) { this.supplyAmount = supplyAmount; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}


