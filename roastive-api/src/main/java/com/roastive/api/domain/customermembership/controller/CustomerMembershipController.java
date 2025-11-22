package com.roastive.api.domain.customermembership.controller;

import com.roastive.api.domain.customermembership.model.CustomerMembership;
import com.roastive.api.domain.customermembership.service.CustomerMembershipService;
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
@RequestMapping("/v2/customer-memberships")
@Validated
public class CustomerMembershipController {
    private final CustomerMembershipService service;

    public CustomerMembershipController(CustomerMembershipService service) { this.service = service; }

    @GetMapping
    public List<CustomerMembership> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerMembership> get(@PathVariable UUID id) {
        Optional<CustomerMembership> cm = service.findById(id);
        return cm.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record CustomerMembershipRequest(UUID userId, UUID customerId, UUID roleId,
                                            @NotBlank @Size(max = 32) String status) {}

    @PostMapping
    public ResponseEntity<CustomerMembership> create(@Valid @RequestBody CustomerMembershipRequest req) {
        CustomerMembership cm = new CustomerMembership();
        cm.setUserId(req.userId());
        cm.setCustomerId(req.customerId());
        cm.setRoleId(req.roleId());
        cm.setStatus(req.status());
        cm.setCreatedAt(OffsetDateTime.now());
        cm.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(cm));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerMembership> update(@PathVariable UUID id, @Valid @RequestBody CustomerMembershipRequest req) {
        CustomerMembership cm = new CustomerMembership();
        cm.setUserId(req.userId());
        cm.setCustomerId(req.customerId());
        cm.setRoleId(req.roleId());
        cm.setStatus(req.status());
        cm.setUpdatedAt(OffsetDateTime.now());
        return service.update(id, cm).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


