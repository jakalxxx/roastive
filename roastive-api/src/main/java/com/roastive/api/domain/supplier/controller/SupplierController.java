package com.roastive.api.domain.supplier.controller;

import com.roastive.api.domain.supplier.dto.SupplierDto;
import com.roastive.api.domain.supplier.dto.SupplierRequest;
import com.roastive.api.domain.supplier.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/suppliers")
@Validated
public class SupplierController {
    private final SupplierService service;

    public SupplierController(SupplierService service) { this.service = service; }

    @GetMapping
    public List<SupplierDto> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDto> get(@PathVariable UUID id) {
        Optional<SupplierDto> s = service.findById(id);
        return s.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SupplierDto> create(@Valid @RequestBody SupplierRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDto> update(@PathVariable UUID id, @Valid @RequestBody SupplierRequest req) {
        return service.update(id, req).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


