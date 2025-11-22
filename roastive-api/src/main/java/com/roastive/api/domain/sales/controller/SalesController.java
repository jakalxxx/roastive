package com.roastive.api.domain.sales.controller;

import com.roastive.api.domain.sales.model.SalesOrder;
import com.roastive.api.domain.sales.model.SalesOrderLine;
import com.roastive.api.domain.sales.model.SalesOrderStatusLog;
import com.roastive.api.domain.sales.service.SalesService;
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
@RequestMapping("/v2/sales")
@Validated
public class SalesController {
    private final SalesService service;

    public SalesController(SalesService service) { this.service = service; }

    // Orders
    @GetMapping("/orders")
    public List<SalesOrder> listOrders() { return service.findOrders(); }
    @GetMapping("/orders/{id}")
    public ResponseEntity<SalesOrder> getOrder(@PathVariable UUID id) {
        Optional<SalesOrder> o = service.findOrder(id);
        return o.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    public record OrderRequest(@NotNull Long roasteryId, @NotBlank @Size(max = 40) String orderNo,
                               @NotNull Long customerId, @NotNull OffsetDateTime orderDate,
                               OffsetDateTime cutoffDate, @NotBlank @Size(max = 16) String currency,
                               @NotBlank @Size(max = 32) String status, String remarks) {}
    @PostMapping("/orders")
    public ResponseEntity<SalesOrder> createOrder(@Valid @RequestBody OrderRequest req) {
        SalesOrder o = new SalesOrder();
        o.setRoasteryId(req.roasteryId());
        o.setOrderNo(req.orderNo());
        o.setCustomerId(req.customerId());
        o.setOrderDate(req.orderDate());
        o.setCutoffDate(req.cutoffDate());
        o.setCurrency(req.currency());
        o.setStatus(req.status());
        o.setRemarks(req.remarks());
        o.setCreatedAt(OffsetDateTime.now());
        o.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createOrder(o));
    }
    @PutMapping("/orders/{id}")
    public ResponseEntity<SalesOrder> updateOrder(@PathVariable UUID id, @Valid @RequestBody OrderRequest req) {
        SalesOrder o = new SalesOrder();
        o.setRoasteryId(req.roasteryId());
        o.setOrderNo(req.orderNo());
        o.setCustomerId(req.customerId());
        o.setOrderDate(req.orderDate());
        o.setCutoffDate(req.cutoffDate());
        o.setCurrency(req.currency());
        o.setStatus(req.status());
        o.setRemarks(req.remarks());
        o.setUpdatedAt(OffsetDateTime.now());
        return service.updateOrder(id, o).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable UUID id) {
        service.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    // Lines
    @GetMapping("/lines")
    public List<SalesOrderLine> listLines() { return service.findLines(); }
    public record LineRequest(@NotNull UUID orderId, @NotNull UUID productId, UUID variantId,
                              @NotNull BigDecimal quantity, @NotBlank @Size(max = 16) String unit,
                              @NotNull BigDecimal unitPrice, @NotNull BigDecimal amount,
                              OffsetDateTime createdAt) {}
    @PostMapping("/lines")
    public ResponseEntity<SalesOrderLine> createLine(@Valid @RequestBody LineRequest req) {
        SalesOrderLine l = new SalesOrderLine();
        l.setOrderId(req.orderId());
        l.setProductId(req.productId());
        l.setVariantId(req.variantId());
        l.setQuantity(req.quantity());
        l.setUnit(req.unit());
        l.setUnitPrice(req.unitPrice());
        l.setAmount(req.amount());
        l.setCreatedAt(req.createdAt() != null ? req.createdAt() : OffsetDateTime.now());
        return ResponseEntity.ok(service.createLine(l));
    }
    @PutMapping("/lines/{id}")
    public ResponseEntity<SalesOrderLine> updateLine(@PathVariable UUID id, @Valid @RequestBody LineRequest req) {
        SalesOrderLine l = new SalesOrderLine();
        l.setOrderId(req.orderId());
        l.setProductId(req.productId());
        l.setVariantId(req.variantId());
        l.setQuantity(req.quantity());
        l.setUnit(req.unit());
        l.setUnitPrice(req.unitPrice());
        l.setAmount(req.amount());
        l.setCreatedAt(OffsetDateTime.now());
        return service.updateLine(id, l).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/lines/{id}")
    public ResponseEntity<Void> deleteLine(@PathVariable UUID id) {
        service.deleteLine(id);
        return ResponseEntity.noContent().build();
    }

    // Status logs
    @GetMapping("/status-logs")
    public List<SalesOrderStatusLog> listStatusLogs() { return service.findStatusLogs(); }
    public record StatusRequest(@NotNull UUID orderId, @NotBlank @Size(max = 32) String status,
                                String memo, OffsetDateTime changedAt) {}
    @PostMapping("/status-logs")
    public ResponseEntity<SalesOrderStatusLog> createStatus(@Valid @RequestBody StatusRequest req) {
        SalesOrderStatusLog s = new SalesOrderStatusLog();
        s.setOrderId(req.orderId());
        s.setStatus(req.status());
        s.setMemo(req.memo());
        s.setChangedAt(req.changedAt() != null ? req.changedAt() : OffsetDateTime.now());
        return ResponseEntity.ok(service.createStatusLog(s));
    }
    @PutMapping("/status-logs/{id}")
    public ResponseEntity<SalesOrderStatusLog> updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusRequest req) {
        SalesOrderStatusLog s = new SalesOrderStatusLog();
        s.setOrderId(req.orderId());
        s.setStatus(req.status());
        s.setMemo(req.memo());
        s.setChangedAt(OffsetDateTime.now());
        return service.updateStatusLog(id, s).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/status-logs/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable UUID id) {
        service.deleteStatusLog(id);
        return ResponseEntity.noContent().build();
    }
}


