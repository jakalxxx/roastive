package com.roastive.api.domain.purchase.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "purchase_master")
public class PurchaseMaster {
    @Id
    @Column(name = "purchase_id", nullable = false, columnDefinition = "uuid")
    private UUID purchaseId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "supplier_id", nullable = false, columnDefinition = "uuid")
    private UUID supplierId;

    @Column(name = "purchase_no", nullable = false, length = 40)
    private String purchaseNo;

    @Column(name = "invoice_no", length = 80)
    private String invoiceNo;

    @Column(name = "purchase_date", nullable = false)
    private OffsetDateTime purchaseDate;

    @Column(name = "expected_arrival")
    private OffsetDateTime expectedArrival;

    @Column(name = "currency", nullable = false, length = 16)
    private String currency;

    @Column(name = "payment_terms", length = 80)
    private String paymentTerms;

    @Column(name = "payment_date")
    private OffsetDateTime paymentDate;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "total_amount", precision = 18, scale = 4, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (purchaseId == null) purchaseId = UUID.randomUUID();
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getPurchaseId() { return purchaseId; }
    public void setPurchaseId(UUID purchaseId) { this.purchaseId = purchaseId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public UUID getSupplierId() { return supplierId; }
    public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }
    public String getPurchaseNo() { return purchaseNo; }
    public void setPurchaseNo(String purchaseNo) { this.purchaseNo = purchaseNo; }
    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }
    public OffsetDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(OffsetDateTime purchaseDate) { this.purchaseDate = purchaseDate; }
    public OffsetDateTime getExpectedArrival() { return expectedArrival; }
    public void setExpectedArrival(OffsetDateTime expectedArrival) { this.expectedArrival = expectedArrival; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public OffsetDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(OffsetDateTime paymentDate) { this.paymentDate = paymentDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


