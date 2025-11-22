package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roastery")
public class Roastery {
    @Id
    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "roastery_name", nullable = false, length = 120)
    private String roasteryName;

    @Column(name = "code", nullable = false, length = 32)
    private String code;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "legal_name", length = 160)
    private String legalName;

    @Column(name = "representative_name", length = 120)
    private String representativeName;

    @Column(name = "brand_name", length = 160)
    private String brandName;

    @Column(name = "business_reg_no", length = 32)
    private String businessRegNo;

    @Column(name = "phone", length = 64)
    private String phone;

    @Column(name = "email", length = 160)
    private String email;

    @Column(name = "website", length = 200)
    private String website;

    @Column(name = "timezone", length = 64)
    private String timezone;

    @Column(name = "base_currency", length = 8)
    private String baseCurrency;

    @Column(name = "default_unit", length = 16)
    private String defaultUnit;

    @Column(name = "roastery_code", length = 32)
    private String roasteryCode;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (roasteryId == null) {
            roasteryId = UUID.randomUUID();
        }
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public String getRoasteryName() { return roasteryName; }
    public void setRoasteryName(String roasteryName) { this.roasteryName = roasteryName; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }
    public String getRepresentativeName() { return representativeName; }
    public void setRepresentativeName(String representativeName) { this.representativeName = representativeName; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getBusinessRegNo() { return businessRegNo; }
    public void setBusinessRegNo(String businessRegNo) { this.businessRegNo = businessRegNo; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public String getBaseCurrency() { return baseCurrency; }
    public void setBaseCurrency(String baseCurrency) { this.baseCurrency = baseCurrency; }
    public String getDefaultUnit() { return defaultUnit; }
    public void setDefaultUnit(String defaultUnit) { this.defaultUnit = defaultUnit; }
    public String getRoasteryCode() { return roasteryCode; }
    public void setRoasteryCode(String roasteryCode) { this.roasteryCode = roasteryCode; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


