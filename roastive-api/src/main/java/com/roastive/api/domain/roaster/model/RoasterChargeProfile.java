package com.roastive.api.domain.roaster.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "roaster_charge_profile")
public class RoasterChargeProfile {
    @Id
    @Column(name = "profile_id", nullable = false, columnDefinition = "uuid")
    private UUID profileId;

    @Column(name = "roaster_id", nullable = false, columnDefinition = "uuid")
    private UUID roasterId;

    @Column(name = "input_capacity", precision = 10, scale = 2, nullable = false)
    private BigDecimal inputCapacity;

    @Column(name = "avg_loss_rate", precision = 5, scale = 2)
    private BigDecimal avgLossRate;

    @Column(name = "avg_duration")
    private Integer avgDuration;

    @Column(name = "remarks")
    private String remarks;

    @PrePersist
    public void prePersist() {
        if (profileId == null) profileId = UUID.randomUUID();
    }

    public UUID getProfileId() { return profileId; }
    public void setProfileId(UUID profileId) { this.profileId = profileId; }
    public UUID getRoasterId() { return roasterId; }
    public void setRoasterId(UUID roasterId) { this.roasterId = roasterId; }
    public BigDecimal getInputCapacity() { return inputCapacity; }
    public void setInputCapacity(BigDecimal inputCapacity) { this.inputCapacity = inputCapacity; }
    public BigDecimal getAvgLossRate() { return avgLossRate; }
    public void setAvgLossRate(BigDecimal avgLossRate) { this.avgLossRate = avgLossRate; }
    public Integer getAvgDuration() { return avgDuration; }
    public void setAvgDuration(Integer avgDuration) { this.avgDuration = avgDuration; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}


