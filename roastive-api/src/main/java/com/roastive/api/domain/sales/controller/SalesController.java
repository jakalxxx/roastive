package com.roastive.api.domain.sales.controller;

import com.roastive.api.domain.sales.dto.SalesOrderListDto;
import com.roastive.api.domain.sales.dto.SalesReportRowDto;
import com.roastive.api.domain.sales.model.SalesOrder;
import com.roastive.api.domain.sales.model.SalesOrderLine;
import com.roastive.api.domain.sales.model.SalesOrderStatusLog;
import com.roastive.api.domain.sales.service.SalesService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
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
    public List<SalesOrderListDto> listOrders(
            @RequestParam(name = "roasteryId", required = false) UUID roasteryIdParam,
            @RequestHeader(value = "X-Roastery-Id", required = false) String roasteryIdHeader) {
        UUID roasteryId = resolveRoasteryId(roasteryIdParam, roasteryIdHeader);
        if (roasteryId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로스터리 정보를 확인할 수 없습니다.");
        }
        return service.findOrders(roasteryId);
    }
    // keep static paths before path variables to avoid UUID parsing errors on "today"
    @GetMapping("/orders/today")
    public ResponseEntity<?> todayOrders(
            @RequestParam(name = "roasteryId", required = false) UUID roasteryIdParam,
            @RequestHeader(value = "X-Roastery-Id", required = false) String roasteryIdHeader) {
        UUID roasteryId = resolveRoasteryId(roasteryIdParam, roasteryIdHeader);
        if (roasteryId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로스터리 정보를 확인할 수 없습니다.");
        }
        OffsetDateTime start = OffsetDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusDays(1);
        var items = service.findTodayOrders(roasteryId, start, end, 10);
        long count = service.countOrdersInRange(roasteryId, start, end);
        return ResponseEntity.ok(java.util.Map.of("count", count, "items", items));
    }
    @GetMapping("/orders/{id}")
    public ResponseEntity<SalesOrder> getOrder(@PathVariable UUID id) {
        Optional<SalesOrder> o = service.findOrder(id);
        return o.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @GetMapping("/orders/{id}/detail")
    public ResponseEntity<?> getOrderDetail(@PathVariable UUID id) {
        return service.findOrderDetail(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    public record OrderRequest(@NotNull UUID roasteryId, @NotBlank @Size(max = 40) String orderNo,
                               @NotNull UUID customerId, @NotNull OffsetDateTime orderDate,
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

    @GetMapping("/reports/orders")
    public List<SalesReportRowDto> orderReport(
            @RequestParam(name = "roasteryId", required = false) UUID roasteryIdParam,
            @RequestHeader(value = "X-Roastery-Id", required = false) String roasteryIdHeader,
            @RequestParam(name = "from", required = false) String from,
            @RequestParam(name = "to", required = false) String to,
            @RequestParam(name = "sort", required = false) String sort,
            @RequestParam(name = "direction", required = false) String direction) {
        UUID roasteryId = resolveRoasteryId(roasteryIdParam, roasteryIdHeader);
        if (roasteryId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로스터리 정보를 확인할 수 없습니다.");
        }
        OffsetDateTime startDate = parseDate(from);
        OffsetDateTime endDate = parseDate(to);
        return service.generateSalesReport(roasteryId, startDate, endDate, sort, direction);
    }

    private UUID resolveRoasteryId(UUID current, String header) {
        if (current != null) return current;
        if (header == null || header.isBlank()) return null;
        try {
            return UUID.fromString(header.trim());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private OffsetDateTime parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return OffsetDateTime.parse(value.trim());
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 날짜 형식입니다.", ex);
        }
    }
}


