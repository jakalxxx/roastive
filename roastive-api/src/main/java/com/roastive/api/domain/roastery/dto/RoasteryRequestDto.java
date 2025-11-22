package com.roastive.api.domain.roastery.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RoasteryRequestDto {
    @NotBlank @Size(max = 120)
    private String roasteryName;
    @NotBlank @Size(max = 32)
    private String code;
    @NotBlank @Size(max = 32)
    private String status;
    @Size(max = 160)
    private String legalName;
    @Size(max = 120)
    private String representativeName;
    @Size(max = 160)
    private String brandName;
    @Size(max = 32)
    private String businessRegNo;
    @Size(max = 64)
    private String phone;
    @Email @Size(max = 160)
    private String email;
    @Size(max = 200)
    private String website;
    @Size(max = 64)
    private String timezone;
    @Size(max = 8)
    private String baseCurrency;
    @Size(max = 16)
    private String defaultUnit;

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final RoasteryRequestDto dto = new RoasteryRequestDto();
        public Builder roasteryName(String v) { dto.roasteryName = v; return this; }
        public Builder code(String v) { dto.code = v; return this; }
        public Builder status(String v) { dto.status = v; return this; }
        public Builder legalName(String v) { dto.legalName = v; return this; }
        public Builder representativeName(String v) { dto.representativeName = v; return this; }
        public Builder brandName(String v) { dto.brandName = v; return this; }
        public Builder businessRegNo(String v) { dto.businessRegNo = v; return this; }
        public Builder phone(String v) { dto.phone = v; return this; }
        public Builder email(String v) { dto.email = v; return this; }
        public Builder website(String v) { dto.website = v; return this; }
        public Builder timezone(String v) { dto.timezone = v; return this; }
        public Builder baseCurrency(String v) { dto.baseCurrency = v; return this; }
        public Builder defaultUnit(String v) { dto.defaultUnit = v; return this; }
        public RoasteryRequestDto build() { return dto; }
    }

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
}


