package com.roastive.api.domain.customer.controller;

import com.roastive.api.domain.customer.model.Customer;
import com.roastive.api.domain.customer.service.CustomerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/customers")
@Validated
public class CustomerController {
    private final CustomerService service;

    public CustomerController(CustomerService service) { this.service = service; }

    @GetMapping
    public List<Customer> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> get(@PathVariable UUID id) {
        Optional<Customer> c = service.findById(id);
        return c.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record CustomerRequest(
            @NotBlank @Size(max = 120) String customerName,
            @Size(max = 32) String code,
            @NotBlank @Size(max = 32) String status
    ) {}

    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody CustomerRequest req) {
        Customer c = new Customer();
        c.setCustomerName(req.customerName());
        c.setCode(req.code());
        c.setStatus(req.status());
        c.setCreatedAt(OffsetDateTime.now());
        c.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(c));
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
}


