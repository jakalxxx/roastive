package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "roastery_site")
public class RoasterySite {
    @Id
    @Column(name = "site_id", nullable = false, columnDefinition = "uuid")
    private UUID siteId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "site_code", nullable = false, length = 64)
    private String siteCode;

    @Column(name = "site_name", nullable = false, length = 160)
    private String siteName;

    @Column(name = "type", nullable = false, length = 32)
    private String type;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "address_id", columnDefinition = "uuid")
    private UUID addressId;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Pattern(regexp = "^[0-9]{4}$")
    @Column(name = "branch_seq_no", nullable = false, length = 4)
    private String branchSeqNo;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public UUID getSiteId() { return siteId; }
    public void setSiteId(UUID siteId) { this.siteId = siteId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
    public UUID getAddressId() { return addressId; }
    public void setAddressId(UUID addressId) { this.addressId = addressId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public String getBranchSeqNo() { return branchSeqNo; }
    public void setBranchSeqNo(String branchSeqNo) { this.branchSeqNo = branchSeqNo; }
}


