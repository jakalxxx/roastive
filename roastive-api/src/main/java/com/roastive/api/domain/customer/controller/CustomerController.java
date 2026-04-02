package com.roastive.api.domain.customer.controller;

import com.roastive.api.domain.customer.dto.CustomerDetailDto;
import com.roastive.api.domain.customer.dto.CustomerStatsDto;
import com.roastive.api.domain.customer.model.Customer;
import com.roastive.api.domain.customer.service.CustomerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/customers")
@Validated
public class CustomerController {
    private final CustomerService service;

    public CustomerController(CustomerService service) { this.service = service; }

    @GetMapping("/stats/new-month")
    public ResponseEntity<CustomerStatsDto> newCustomersThisMonth(
            @RequestParam(name = "roasteryId", required = false) UUID roasteryIdParam,
            @RequestHeader(value = "X-Roastery-Id", required = false) String roasteryIdHeader) {
        UUID roasteryId = resolveRoasteryId(roasteryIdParam, roasteryIdHeader);
        if (roasteryId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로스터리 정보를 확인할 수 없습니다.");
        }
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime start = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusMonths(1);
        long count = service.countNewActiveCustomers(roasteryId, start, end);
        return ResponseEntity.ok(new CustomerStatsDto(count));
    }

    @GetMapping
    public List<Customer> list(@RequestParam(name = "roasteryId", required = false) UUID roasteryId) {
        if (roasteryId == null) return service.findAll();
        return service.findByRoasteryId(roasteryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> get(@PathVariable UUID id) {
        Optional<Customer> c = service.findById(id);
        return c.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<CustomerDetailDto> detail(
            @PathVariable UUID id,
            @RequestParam(name = "roasteryId", required = false) UUID roasteryIdParam,
            @RequestHeader(value = "X-Roastery-Id", required = false) String roasteryIdHeader) {
        UUID roasteryId = resolveRoasteryId(roasteryIdParam, roasteryIdHeader);
        if (roasteryId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로스터리 정보를 확인할 수 없습니다.");
        }
        return service.findDetail(id, roasteryId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record CustomerRequest(
            @NotBlank @Size(max = 120) String customerName,
            @Size(max = 32) String code,
            @NotBlank @Size(max = 32) String status,
            @NotNull UUID roasteryId
    ) {}

    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody CustomerRequest req) {
        Customer c = new Customer();
        c.setCustomerName(req.customerName());
        c.setCode(req.code());
        c.setStatus(req.status());
        c.setCreatedAt(OffsetDateTime.now());
        c.setUpdatedAt(OffsetDateTime.now());
        try {
            return ResponseEntity.ok(service.create(c, req.roasteryId()));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable UUID id, @Valid @RequestBody CustomerRequest req) {
        Customer c = new Customer();
        c.setCustomerName(req.customerName());
        c.setCode(req.code());
        c.setStatus(req.status());
        c.setUpdatedAt(OffsetDateTime.now());
        return service.update(id, c).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
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
}


