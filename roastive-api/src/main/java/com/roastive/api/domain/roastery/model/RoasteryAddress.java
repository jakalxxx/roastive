package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@Entity
@Table(name = "roastery_address")
public class RoasteryAddress {
    @Id
    @Column(name = "address_id", nullable = false, columnDefinition = "uuid")
    private UUID addressId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "address_type", nullable = false, length = 32)
    private String addressType;

    @Column(name = "postal_code", length = 32)
    private String postalCode;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "state", length = 120)
    private String state;

    @Column(name = "country", length = 2)
    private String country;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    private static String n(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Request {
        public String addressType;   // e.g., HEADQUARTERS, OFFICE, WAREHOUSE
        public String postalCode;
        public String addressLine1;
        public String addressLine2;
        public String city;
        public String state;
        public String country;       // optional, defaults to KR when null/blank
        public String siteName;      // optional (for non-HQ)
        public String type;          // site type (OFFICE/WAREHOUSE/STORE...)
    }

    public static RoasteryAddress from(Request req, UUID roasteryId, boolean isDefault) {
        RoasteryAddress a = new RoasteryAddress();
        a.setAddressId(UUID.randomUUID());
        a.setRoasteryId(roasteryId);
        a.setAddressType(n(req.addressType));
        a.setPostalCode(n(req.postalCode));
        a.setAddressLine1(n(req.addressLine1));
        a.setAddressLine2(n(req.addressLine2));
        a.setCity(n(req.city));
        a.setState(n(req.state));
        String c = n(req.country);
        a.setCountry(c == null ? "KR" : c);
        a.setDefault(isDefault);
        a.setCreatedAt(OffsetDateTime.now());
        return a;
    }

    public RoasteryAddress apply(Request req) {
        String v;
        if ((v = n(req.addressType)) != null) this.setAddressType(v);
        if ((v = n(req.postalCode))  != null) this.setPostalCode(v);
        if ((v = n(req.addressLine1))!= null) this.setAddressLine1(v);
        if ((v = n(req.addressLine2))!= null) this.setAddressLine2(v);
        if ((v = n(req.city))        != null) this.setCity(v);
        if ((v = n(req.state))       != null) this.setState(v);
        if ((v = n(req.country))     != null) this.setCountry(v);
        return this;
    }

    public UUID getAddressId() { return addressId; }
    public void setAddressId(UUID addressId) { this.addressId = addressId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public String getAddressType() { return addressType; }
    public void setAddressType(String addressType) { this.addressType = addressType; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
