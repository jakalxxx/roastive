package com.roastive.api.domain.codeset.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "code_set")
public class CodeSet {
    @Id
    @Column(name = "id", nullable = false, columnDefinition = "uuid")
    private UUID id;

    @Column(name = "code_type", nullable = false, length = 64)
    private String codeType;

    @Column(name = "code_key", nullable = false, length = 64)
    private String codeKey;

    @Column(name = "label", nullable = false, length = 128)
    private String label;

    @Column(name = "sort", nullable = false)
    private Integer sort;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "meta", columnDefinition = "jsonb")
    private String meta;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (sort == null) sort = 0;
        if (active == null) active = Boolean.TRUE;
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getCodeType() { return codeType; }
    public void setCodeType(String codeType) { this.codeType = codeType; }
    public String getCodeKey() { return codeKey; }
    public void setCodeKey(String codeKey) { this.codeKey = codeKey; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public Integer getSort() { return sort; }
    public void setSort(Integer sort) { this.sort = sort; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getMeta() { return meta; }
    public void setMeta(String meta) { this.meta = meta; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


