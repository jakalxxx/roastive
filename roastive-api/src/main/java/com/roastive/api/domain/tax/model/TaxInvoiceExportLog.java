package com.roastive.api.domain.tax.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tax_invoice_export_log")
public class TaxInvoiceExportLog {
    @Id
    @Column(name = "export_id", nullable = false, columnDefinition = "uuid")
    private UUID exportId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "invoice_id", nullable = false, columnDefinition = "uuid")
    private UUID invoiceId;

    @Column(name = "provider", nullable = false, length = 32)
    private String provider;

    @Column(name = "file_name", nullable = false, length = 200)
    private String fileName;

    @Column(name = "checksum_md5", length = 32)
    private String checksumMd5;

    @Column(name = "status", nullable = false, length = 16)
    private String status;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "exported_by")
    private Long exportedBy;

    @Column(name = "exported_at", nullable = false)
    private OffsetDateTime exportedAt;

    @PrePersist
    public void prePersist() {
        if (exportId == null) exportId = UUID.randomUUID();
        if (exportedAt == null) exportedAt = OffsetDateTime.now();
    }

    public UUID getExportId() { return exportId; }
    public void setExportId(UUID exportId) { this.exportId = exportId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getChecksumMd5() { return checksumMd5; }
    public void setChecksumMd5(String checksumMd5) { this.checksumMd5 = checksumMd5; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Long getExportedBy() { return exportedBy; }
    public void setExportedBy(Long exportedBy) { this.exportedBy = exportedBy; }
    public OffsetDateTime getExportedAt() { return exportedAt; }
    public void setExportedAt(OffsetDateTime exportedAt) { this.exportedAt = exportedAt; }
}


