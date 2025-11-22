package com.roastive.api.domain.tax.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tax_invoice_party_snapshot")
public class TaxInvoicePartySnapshot {
    @Id
    @Column(name = "snapshot_id", nullable = false, columnDefinition = "uuid")
    private UUID snapshotId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "invoice_id", nullable = false, columnDefinition = "uuid")
    private UUID invoiceId;

    @Column(name = "party_type", nullable = false, length = 16)
    private String partyType;

    @Column(name = "business_reg_no", length = 32)
    private String businessRegNo;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "representative", length = 120)
    private String representative;

    @Column(name = "address", length = 240)
    private String address;

    @Column(name = "email", length = 160)
    private String email;

    @Column(name = "phone", length = 64)
    private String phone;

    @Column(name = "snapshot_at", nullable = false)
    private OffsetDateTime snapshotAt;

    @PrePersist
    public void prePersist() {
        if (snapshotId == null) snapshotId = UUID.randomUUID();
        if (snapshotAt == null) snapshotAt = OffsetDateTime.now();
    }

    public UUID getSnapshotId() { return snapshotId; }
    public void setSnapshotId(UUID snapshotId) { this.snapshotId = snapshotId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }
    public String getPartyType() { return partyType; }
    public void setPartyType(String partyType) { this.partyType = partyType; }
    public String getBusinessRegNo() { return businessRegNo; }
    public void setBusinessRegNo(String businessRegNo) { this.businessRegNo = businessRegNo; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRepresentative() { return representative; }
    public void setRepresentative(String representative) { this.representative = representative; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public OffsetDateTime getSnapshotAt() { return snapshotAt; }
    public void setSnapshotAt(OffsetDateTime snapshotAt) { this.snapshotAt = snapshotAt; }
}


