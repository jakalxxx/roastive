package com.roastive.api.domain.purchase.controller;

import com.roastive.api.domain.purchase.model.PurchaseDetail;
import com.roastive.api.domain.purchase.model.PurchaseMaster;
import com.roastive.api.domain.purchase.service.PurchaseService;
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
@RequestMapping("/v2/purchases")
@Validated
public class PurchaseController {
    private final PurchaseService service;

    public PurchaseController(PurchaseService service) { this.service = service; }

    // Master
    @GetMapping
    public List<PurchaseMaster> listMasters() { return service.findMasters(); }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseMaster> getMaster(@PathVariable UUID id) {
        Optional<PurchaseMaster> m = service.findMaster(id);
        return m.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record PurchaseMasterRequest(@NotNull Long roasteryId,
                                        @NotNull UUID supplierId,
                                        @NotBlank @Size(max = 40) String purchaseNo,
                                        @Size(max = 80) String invoiceNo,
                                        @NotNull OffsetDateTime purchaseDate,
                                        OffsetDateTime expectedArrival,
                                        @NotBlank @Size(max = 16) String currency,
                                        @Size(max = 80) String paymentTerms,
                                        OffsetDateTime paymentDate,
                                        @NotBlank @Size(max = 32) String status,
                                        String remarks,
                                        BigDecimal totalAmount) {}

    @PostMapping
    public ResponseEntity<PurchaseMaster> createMaster(@Valid @RequestBody PurchaseMasterRequest req) {
        PurchaseMaster m = new PurchaseMaster();
        m.setRoasteryId(req.roasteryId());
        m.setSupplierId(req.supplierId());
        m.setPurchaseNo(req.purchaseNo());
        m.setInvoiceNo(req.invoiceNo());
        m.setPurchaseDate(req.purchaseDate());
        m.setExpectedArrival(req.expectedArrival());
        m.setCurrency(req.currency());
        m.setPaymentTerms(req.paymentTerms());
        m.setPaymentDate(req.paymentDate());
        m.setStatus(req.status());
        m.setRemarks(req.remarks());
        m.setTotalAmount(req.totalAmount());
        m.setCreatedAt(OffsetDateTime.now());
        m.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createMaster(m));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseMaster> updateMaster(@PathVariable UUID id, @Valid @RequestBody PurchaseMasterRequest req) {
        PurchaseMaster m = new PurchaseMaster();
        m.setRoasteryId(req.roasteryId());
        m.setSupplierId(req.supplierId());
        m.setPurchaseNo(req.purchaseNo());
        m.setInvoiceNo(req.invoiceNo());
        m.setPurchaseDate(req.purchaseDate());
        m.setExpectedArrival(req.expectedArrival());
        m.setCurrency(req.currency());
        m.setPaymentTerms(req.paymentTerms());
        m.setPaymentDate(req.paymentDate());
        m.setStatus(req.status());
        m.setRemarks(req.remarks());
        m.setTotalAmount(req.totalAmount());
        m.setUpdatedAt(OffsetDateTime.now());
        return service.updateMaster(id, m).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaster(@PathVariable UUID id) {
        service.deleteMaster(id);
        return ResponseEntity.noContent().build();
    }

    // Detail
    @GetMapping("/details")
    public List<PurchaseDetail> listDetails() { return service.findDetails(); }

    @GetMapping("/details/{id}")
    public ResponseEntity<PurchaseDetail> getDetail(@PathVariable UUID id) {
        Optional<PurchaseDetail> d = service.findDetail(id);
        return d.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record PurchaseDetailRequest(@NotNull UUID purchaseId,
                                        @NotNull UUID itemId,
                                        @NotNull BigDecimal quantity,
                                        @NotBlank @Size(max = 16) String unit,
                                        @NotNull BigDecimal unitPrice,
                                        BigDecimal amount,
                                        @Size(max = 80) String lotHint,
                                        String remarks) {}

    @PostMapping("/details")
    public ResponseEntity<PurchaseDetail> createDetail(@Valid @RequestBody PurchaseDetailRequest req) {
        PurchaseDetail d = new PurchaseDetail();
        d.setPurchaseId(req.purchaseId());
        d.setItemId(req.itemId());
        d.setQuantity(req.quantity());
        d.setUnit(req.unit());
        d.setUnitPrice(req.unitPrice());
        d.setAmount(req.amount());
        d.setLotHint(req.lotHint());
        d.setRemarks(req.remarks());
        d.setCreatedAt(OffsetDateTime.now());
        d.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createDetail(d));
    }

    @PutMapping("/details/{id}")
    public ResponseEntity<PurchaseDetail> updateDetail(@PathVariable UUID id, @Valid @RequestBody PurchaseDetailRequest req) {
        PurchaseDetail d = new PurchaseDetail();
        d.setPurchaseId(req.purchaseId());
        d.setItemId(req.itemId());
        d.setQuantity(req.quantity());
        d.setUnit(req.unit());
        d.setUnitPrice(req.unitPrice());
        d.setAmount(req.amount());
        d.setLotHint(req.lotHint());
        d.setRemarks(req.remarks());
        d.setUpdatedAt(OffsetDateTime.now());
        return service.updateDetail(id, d).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/details/{id}")
    public ResponseEntity<Void> deleteDetail(@PathVariable UUID id) {
        service.deleteDetail(id);
        return ResponseEntity.noContent().build();
    }
}


