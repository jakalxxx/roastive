package com.roastive.api.domain.packaging.controller;

import com.roastive.api.domain.packaging.model.PackagingMaster;
import com.roastive.api.domain.packaging.service.PackagingService;
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
@RequestMapping("/v2/packagings")
@Validated
public class PackagingController {
    private final PackagingService service;

    public PackagingController(PackagingService service) { this.service = service; }

    public record PackagingRequest(@NotNull Long roasteryId,
                                   @NotNull UUID productId,
                                   @NotNull BigDecimal unitSize,
                                   @NotBlank @Size(max = 16) String unit,
                                   String description,
                                   @NotBlank @Size(max = 32) String status) {}

    @GetMapping
    public List<PackagingMaster> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<PackagingMaster> get(@PathVariable UUID id) {
        Optional<PackagingMaster> m = service.findById(id);
        return m.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PackagingMaster> create(@Valid @RequestBody PackagingRequest req) {
        PackagingMaster m = new PackagingMaster();
        m.setRoasteryId(req.roasteryId());
        m.setProductId(req.productId());
        m.setUnitSize(req.unitSize());
        m.setUnit(req.unit());
        m.setDescription(req.description());
        m.setStatus(req.status());
        m.setCreatedAt(OffsetDateTime.now());
        m.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(m));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PackagingMaster> update(@PathVariable UUID id, @Valid @RequestBody PackagingRequest req) {
        PackagingMaster m = new PackagingMaster();
        m.setRoasteryId(req.roasteryId());
        m.setProductId(req.productId());
        m.setUnitSize(req.unitSize());
        m.setUnit(req.unit());
        m.setDescription(req.description());
        m.setStatus(req.status());
        m.setUpdatedAt(OffsetDateTime.now());
        return service.update(id, m).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


