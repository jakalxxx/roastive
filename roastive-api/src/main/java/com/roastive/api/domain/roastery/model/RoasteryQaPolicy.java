package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "roastery_qa_policy")
public class RoasteryQaPolicy {
    @Id
    @Column(name = "qa_policy_id", nullable = false, columnDefinition = "uuid")
    private UUID qaPolicyId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "color_whole_min")
    private Double colorWholeMin;

    @Column(name = "color_whole_max")
    private Double colorWholeMax;

    @Column(name = "color_ground_min")
    private Double colorGroundMin;

    @Column(name = "color_ground_max")
    private Double colorGroundMax;

    @Column(name = "moisture_max")
    private Double moistureMax;

    @Column(name = "cupping_score_min")
    private Double cuppingScoreMin;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "status", length = 32)
    private String status;

    public UUID getQaPolicyId() { return qaPolicyId; }
    public void setQaPolicyId(UUID qaPolicyId) { this.qaPolicyId = qaPolicyId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public Double getColorWholeMin() { return colorWholeMin; }
    public void setColorWholeMin(Double colorWholeMin) { this.colorWholeMin = colorWholeMin; }
    public Double getColorWholeMax() { return colorWholeMax; }
    public void setColorWholeMax(Double colorWholeMax) { this.colorWholeMax = colorWholeMax; }
    public Double getColorGroundMin() { return colorGroundMin; }
    public void setColorGroundMin(Double colorGroundMin) { this.colorGroundMin = colorGroundMin; }
    public Double getColorGroundMax() { return colorGroundMax; }
    public void setColorGroundMax(Double colorGroundMax) { this.colorGroundMax = colorGroundMax; }
    public Double getMoistureMax() { return moistureMax; }
    public void setMoistureMax(Double moistureMax) { this.moistureMax = moistureMax; }
    public Double getCuppingScoreMin() { return cuppingScoreMin; }
    public void setCuppingScoreMin(Double cuppingScoreMin) { this.cuppingScoreMin = cuppingScoreMin; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}


