package com.roastive.api.domain.production.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "production_output")
public class ProductionOutput {
    @Id
    @Column(name = "output_id", nullable = false, columnDefinition = "uuid")
    private UUID outputId;

    @Column(name = "production_id", nullable = false, columnDefinition = "uuid")
    private UUID productionId;

    @Column(name = "roasted_quantity", precision = 18, scale = 4, nullable = false)
    private BigDecimal roastedQuantity;

    @Column(name = "defect_quantity", precision = 18, scale = 4)
    private BigDecimal defectQuantity;

    @Column(name = "output_date", nullable = false)
    private OffsetDateTime outputDate;

    @Column(name = "remarks")
    private String remarks;

    @PrePersist
    public void prePersist() {
        if (outputId == null) outputId = UUID.randomUUID();
        if (outputDate == null) outputDate = OffsetDateTime.now();
    }

    public UUID getOutputId() { return outputId; }
    public void setOutputId(UUID outputId) { this.outputId = outputId; }
    public UUID getProductionId() { return productionId; }
    public void setProductionId(UUID productionId) { this.productionId = productionId; }
    public BigDecimal getRoastedQuantity() { return roastedQuantity; }
    public void setRoastedQuantity(BigDecimal roastedQuantity) { this.roastedQuantity = roastedQuantity; }
    public BigDecimal getDefectQuantity() { return defectQuantity; }
    public void setDefectQuantity(BigDecimal defectQuantity) { this.defectQuantity = defectQuantity; }
    public OffsetDateTime getOutputDate() { return outputDate; }
    public void setOutputDate(OffsetDateTime outputDate) { this.outputDate = outputDate; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}


