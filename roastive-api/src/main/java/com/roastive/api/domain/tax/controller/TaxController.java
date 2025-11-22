package com.roastive.api.domain.tax.controller;

import com.roastive.api.domain.tax.model.*;
import com.roastive.api.domain.tax.service.TaxService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/tax")
@Validated
public class TaxController {
    private final TaxService service;

    public TaxController(TaxService service) { this.service = service; }

    // Master
    @GetMapping("/invoices")
    public List<TaxInvoiceMaster> listInvoices() { return service.findInvoices(); }
    @GetMapping("/invoices/{id}")
    public ResponseEntity<TaxInvoiceMaster> getInvoice(@PathVariable UUID id) {
        Optional<TaxInvoiceMaster> m = service.findInvoice(id);
        return m.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    public record InvoiceRequest(@NotNull Long roasteryId, @NotNull UUID orderId,
                                 @NotNull UUID customerId, @NotNull OffsetDateTime invoiceDate,
                                 @NotBlank @Size(max = 8) String currency,
                                 @NotNull BigDecimal supplyAmount, @NotNull BigDecimal vatAmount,
                                 @NotNull BigDecimal totalAmount, @NotNull BigDecimal taxRate,
                                 @NotBlank @Size(max = 16) String status, String remarks) {}
    @PostMapping("/invoices")
    public ResponseEntity<TaxInvoiceMaster> createInvoice(@Valid @RequestBody InvoiceRequest req) {
        TaxInvoiceMaster m = new TaxInvoiceMaster();
        m.setRoasteryId(req.roasteryId());
        m.setOrderId(req.orderId());
        m.setCustomerId(req.customerId());
        m.setInvoiceDate(req.invoiceDate());
        m.setCurrency(req.currency());
        m.setSupplyAmount(req.supplyAmount());
        m.setVatAmount(req.vatAmount());
        m.setTotalAmount(req.totalAmount());
        m.setTaxRate(req.taxRate());
        m.setStatus(req.status());
        m.setRemarks(req.remarks());
        m.setCreatedAt(OffsetDateTime.now());
        m.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createInvoice(m));
    }
    @PutMapping("/invoices/{id}")
    public ResponseEntity<TaxInvoiceMaster> updateInvoice(@PathVariable UUID id, @Valid @RequestBody InvoiceRequest req) {
        TaxInvoiceMaster m = new TaxInvoiceMaster();
        m.setRoasteryId(req.roasteryId());
        m.setOrderId(req.orderId());
        m.setCustomerId(req.customerId());
        m.setInvoiceDate(req.invoiceDate());
        m.setCurrency(req.currency());
        m.setSupplyAmount(req.supplyAmount());
        m.setVatAmount(req.vatAmount());
        m.setTotalAmount(req.totalAmount());
        m.setTaxRate(req.taxRate());
        m.setStatus(req.status());
        m.setRemarks(req.remarks());
        m.setUpdatedAt(OffsetDateTime.now());
        return service.updateInvoice(id, m).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        service.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    // Detail
    @GetMapping("/invoice-details")
    public List<TaxInvoiceDetail> listDetails() { return service.findDetails(); }
    public record DetailRequest(@NotNull Long roasteryId, @NotNull UUID invoiceId,
                                UUID orderDetailId, UUID productId, UUID variantId,
                                @NotBlank @Size(max = 240) String description,
                                @NotNull BigDecimal quantity, @NotBlank @Size(max = 16) String unit,
                                @NotNull BigDecimal unitPrice, @NotNull BigDecimal supplyAmount,
                                @NotNull BigDecimal vatAmount, @NotNull BigDecimal totalAmount,
                                OffsetDateTime createdAt) {}
    @PostMapping("/invoice-details")
    public ResponseEntity<TaxInvoiceDetail> createDetail(@Valid @RequestBody DetailRequest req) {
        TaxInvoiceDetail d = new TaxInvoiceDetail();
        d.setRoasteryId(req.roasteryId());
        d.setInvoiceId(req.invoiceId());
        d.setOrderDetailId(req.orderDetailId());
        d.setProductId(req.productId());
        d.setVariantId(req.variantId());
        d.setDescription(req.description());
        d.setQuantity(req.quantity());
        d.setUnit(req.unit());
        d.setUnitPrice(req.unitPrice());
        d.setSupplyAmount(req.supplyAmount());
        d.setVatAmount(req.vatAmount());
        d.setTotalAmount(req.totalAmount());
        d.setCreatedAt(req.createdAt() != null ? req.createdAt() : OffsetDateTime.now());
        return ResponseEntity.ok(service.createDetail(d));
    }
    @PutMapping("/invoice-details/{id}")
    public ResponseEntity<TaxInvoiceDetail> updateDetail(@PathVariable UUID id, @Valid @RequestBody DetailRequest req) {
        TaxInvoiceDetail d = new TaxInvoiceDetail();
        d.setRoasteryId(req.roasteryId());
        d.setInvoiceId(req.invoiceId());
        d.setOrderDetailId(req.orderDetailId());
        d.setProductId(req.productId());
        d.setVariantId(req.variantId());
        d.setDescription(req.description());
        d.setQuantity(req.quantity());
        d.setUnit(req.unit());
        d.setUnitPrice(req.unitPrice());
        d.setSupplyAmount(req.supplyAmount());
        d.setVatAmount(req.vatAmount());
        d.setTotalAmount(req.totalAmount());
        d.setCreatedAt(OffsetDateTime.now());
        return service.updateDetail(id, d).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/invoice-details/{id}")
    public ResponseEntity<Void> deleteDetail(@PathVariable UUID id) {
        service.deleteDetail(id);
        return ResponseEntity.noContent().build();
    }

    // Party
    @GetMapping("/parties")
    public List<TaxInvoicePartySnapshot> listParties() { return service.findParties(); }
    public record PartyRequest(@NotNull Long roasteryId, @NotNull UUID invoiceId,
                               @NotBlank @Size(max = 16) String partyType,
                               @Size(max = 32) String businessRegNo,
                               @NotBlank @Size(max = 160) String name,
                               @Size(max = 120) String representative,
                               @Size(max = 240) String address,
                               @Size(max = 160) String email,
                               @Size(max = 64) String phone,
                               OffsetDateTime snapshotAt) {}
    @PostMapping("/parties")
    public ResponseEntity<TaxInvoicePartySnapshot> createParty(@Valid @RequestBody PartyRequest req) {
        TaxInvoicePartySnapshot p = new TaxInvoicePartySnapshot();
        p.setRoasteryId(req.roasteryId());
        p.setInvoiceId(req.invoiceId());
        p.setPartyType(req.partyType());
        p.setBusinessRegNo(req.businessRegNo());
        p.setName(req.name());
        p.setRepresentative(req.representative());
        p.setAddress(req.address());
        p.setEmail(req.email());
        p.setPhone(req.phone());
        p.setSnapshotAt(req.snapshotAt() != null ? req.snapshotAt() : OffsetDateTime.now());
        return ResponseEntity.ok(service.createParty(p));
    }
    @PutMapping("/parties/{id}")
    public ResponseEntity<TaxInvoicePartySnapshot> updateParty(@PathVariable UUID id, @Valid @RequestBody PartyRequest req) {
        TaxInvoicePartySnapshot p = new TaxInvoicePartySnapshot();
        p.setRoasteryId(req.roasteryId());
        p.setInvoiceId(req.invoiceId());
        p.setPartyType(req.partyType());
        p.setBusinessRegNo(req.businessRegNo());
        p.setName(req.name());
        p.setRepresentative(req.representative());
        p.setAddress(req.address());
        p.setEmail(req.email());
        p.setPhone(req.phone());
        p.setSnapshotAt(OffsetDateTime.now());
        return service.updateParty(id, p).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/parties/{id}")
    public ResponseEntity<Void> deleteParty(@PathVariable UUID id) {
        service.deleteParty(id);
        return ResponseEntity.noContent().build();
    }

    // Export
    @GetMapping("/exports")
    public List<TaxInvoiceExportLog> listExports() { return service.findExports(); }
    public record ExportRequest(@NotNull Long roasteryId, @NotNull UUID invoiceId,
                                @NotBlank @Size(max = 32) String provider,
                                @NotBlank @Size(max = 200) String fileName,
                                @Size(max = 32) String checksumMd5,
                                @NotBlank @Size(max = 16) String status,
                                String errorMessage, Long exportedBy, OffsetDateTime exportedAt) {}
    @PostMapping("/exports")
    public ResponseEntity<TaxInvoiceExportLog> createExport(@Valid @RequestBody ExportRequest req) {
        TaxInvoiceExportLog e = new TaxInvoiceExportLog();
        e.setRoasteryId(req.roasteryId());
        e.setInvoiceId(req.invoiceId());
        e.setProvider(req.provider());
        e.setFileName(req.fileName());
        e.setChecksumMd5(req.checksumMd5());
        e.setStatus(req.status());
        e.setErrorMessage(req.errorMessage());
        e.setExportedBy(req.exportedBy());
        e.setExportedAt(req.exportedAt() != null ? req.exportedAt() : OffsetDateTime.now());
        return ResponseEntity.ok(service.createExport(e));
    }
    @PutMapping("/exports/{id}")
    public ResponseEntity<TaxInvoiceExportLog> updateExport(@PathVariable UUID id, @Valid @RequestBody ExportRequest req) {
        TaxInvoiceExportLog e = new TaxInvoiceExportLog();
        e.setRoasteryId(req.roasteryId());
        e.setInvoiceId(req.invoiceId());
        e.setProvider(req.provider());
        e.setFileName(req.fileName());
        e.setChecksumMd5(req.checksumMd5());
        e.setStatus(req.status());
        e.setErrorMessage(req.errorMessage());
        e.setExportedBy(req.exportedBy());
        e.setExportedAt(OffsetDateTime.now());
        return service.updateExport(id, e).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/exports/{id}")
    public ResponseEntity<Void> deleteExport(@PathVariable UUID id) {
        service.deleteExport(id);
        return ResponseEntity.noContent().build();
    }
}


