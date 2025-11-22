package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roastery_tax_profile")
public class RoasteryTaxProfile {
    @Id
    @Column(name = "tax_profile_id", nullable = false, columnDefinition = "uuid")
    private UUID taxProfileId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "vat_no", length = 64)
    private String vatNo;

    @Column(name = "tax_type", length = 64)
    private String taxType;

    @Column(name = "invoice_emission", length = 32)
    private String invoiceEmission;

    @Column(name = "invoice_email", length = 160)
    private String invoiceEmail;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public UUID getTaxProfileId() { return taxProfileId; }
    public void setTaxProfileId(UUID taxProfileId) { this.taxProfileId = taxProfileId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public String getVatNo() { return vatNo; }
    public void setVatNo(String vatNo) { this.vatNo = vatNo; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }
    public String getInvoiceEmission() { return invoiceEmission; }
    public void setInvoiceEmission(String invoiceEmission) { this.invoiceEmission = invoiceEmission; }
    public String getInvoiceEmail() { return invoiceEmail; }
    public void setInvoiceEmail(String invoiceEmail) { this.invoiceEmail = invoiceEmail; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}


