package com.roastive.api.domain.customer.controller;

import com.roastive.api.domain.customer.model.CustomerRoastery;
import com.roastive.api.domain.customer.service.CustomerRoasteryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v2/customer-roasteries")
public class CustomerRoasteryController {
    private final CustomerRoasteryService service;

    public CustomerRoasteryController(CustomerRoasteryService service) { this.service = service; }

    public record MappingRequest(
            @NotNull UUID customerId,
            @NotNull UUID roasteryId,
            @Size(max = 32) String status
    ) {}

    @GetMapping
    public List<CustomerRoastery> list(@RequestParam(name = "roasteryId", required = false) UUID roasteryId) {
        if (roasteryId == null) return service.findAll();
        return service.findByRoasteryId(roasteryId);
    }

    @PostMapping
    public ResponseEntity<CustomerRoastery> create(@Valid @RequestBody MappingRequest req) {
        CustomerRoastery mapping = new CustomerRoastery();
        mapping.setCustomerId(req.customerId());
        mapping.setRoasteryId(req.roasteryId());
        String status = req.status();
        mapping.setStatus(status == null || status.isBlank() ? "ACTIVE" : status);
        OffsetDateTime now = OffsetDateTime.now();
        mapping.setRequestedAt(now);
        mapping.setApprovedAt(now);
        return ResponseEntity.ok(service.create(mapping));
    }
}






























