package com.roastive.api.domain.silo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "silo_release_detail")
public class SiloReleaseDetail {
    @Id
    @Column(name = "release_detail_id", nullable = false, columnDefinition = "uuid")
    private UUID releaseDetailId;

    @Column(name = "release_id", nullable = false, columnDefinition = "uuid")
    private UUID releaseId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "silo_id", nullable = false, columnDefinition = "uuid")
    private UUID siloId;

    @Column(name = "item_id", nullable = false, columnDefinition = "uuid")
    private UUID itemId;

    @Column(name = "lot_no", nullable = false, length = 80)
    private String lotNo;

    @Column(name = "release_qty", precision = 18, scale = 4, nullable = false)
    private BigDecimal releaseQty;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (releaseDetailId == null) releaseDetailId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public UUID getReleaseDetailId() { return releaseDetailId; }
    public void setReleaseDetailId(UUID releaseDetailId) { this.releaseDetailId = releaseDetailId; }
    public UUID getReleaseId() { return releaseId; }
    public void setReleaseId(UUID releaseId) { this.releaseId = releaseId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public UUID getSiloId() { return siloId; }
    public void setSiloId(UUID siloId) { this.siloId = siloId; }
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { this.itemId = itemId; }
    public String getLotNo() { return lotNo; }
    public void setLotNo(String lotNo) { this.lotNo = lotNo; }
    public BigDecimal getReleaseQty() { return releaseQty; }
    public void setReleaseQty(BigDecimal releaseQty) { this.releaseQty = releaseQty; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}


