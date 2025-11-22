package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "roastery_cutoff_policy")
public class RoasteryCutoffPolicy {
    @Id
    @Column(name = "policy_id", nullable = false, columnDefinition = "uuid")
    private UUID policyId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "weekday", nullable = false)
    private Integer weekday;

    @Column(name = "cutoff_time", nullable = false)
    private LocalTime cutoffTime;

    @Column(name = "timezone", nullable = false, length = 64)
    private String timezone;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public Integer getWeekday() { return weekday; }
    public void setWeekday(Integer weekday) { this.weekday = weekday; }
    public LocalTime getCutoffTime() { return cutoffTime; }
    public void setCutoffTime(LocalTime cutoffTime) { this.cutoffTime = cutoffTime; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
}


