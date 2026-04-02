package com.roastive.api.domain.supplier.controller;

import com.roastive.api.domain.supplier.dto.*;
import com.roastive.api.domain.supplier.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    public List<SupplierDto> list(@RequestParam(name = "roasteryId", required = false) UUID roasteryId) {
        return service.findByRoastery(roasteryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDto> get(@PathVariable UUID id) {
        Optional<SupplierDto> s = service.findById(id);
        return s.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<SupplierDetailDto> detail(
            @PathVariable UUID id,
            @RequestParam(name = "roasteryId", required = false) UUID roasteryIdParam,
            @RequestHeader(value = "X-Roastery-Id", required = false) String roasteryIdHeader) {
        UUID roasteryId = resolveRoasteryId(roasteryIdParam, roasteryIdHeader);
        if (roasteryId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로스터리 정보를 확인할 수 없습니다.");
        }
        return service.findDetail(id, roasteryId).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SupplierDto> create(
            @RequestHeader(value = "X-Roastery-Id", required = false) String roasteryIdHeader,
            @Valid @RequestBody SupplierRequest req) {
        UUID resolved = resolveRoasteryId(req.getRoasteryId(), roasteryIdHeader);
        if (resolved == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로스터리 정보를 확인할 수 없습니다.");
        }
        req.setRoasteryId(resolved);
        if (req.getStatus() == null || req.getStatus().isBlank()) {
            req.setStatus("ACTIVE");
        }
        return ResponseEntity.ok(service.create(req));
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

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDto> update(@PathVariable UUID id, @Valid @RequestBody SupplierRequest req) {
        return service.update(id, req).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/contacts")
    public ResponseEntity<List<SupplierContactDto>> listContacts(
            @PathVariable UUID id,
            @RequestParam(name = "roasteryId", required = false) UUID roasteryIdParam,
            @RequestHeader(value = "X-Roastery-Id", required = false) String roasteryIdHeader) {
        UUID roasteryId = resolveRoasteryId(roasteryIdParam, roasteryIdHeader);
        if (roasteryId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로스터리 정보를 확인할 수 없습니다.");
        }
        return service.findDetail(id, roasteryId)
                .map(detail -> ResponseEntity.ok(detail.getContacts()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/contacts")
    public ResponseEntity<SupplierContactDto> createContact(@PathVariable UUID id, @Valid @RequestBody SupplierContactRequest req) {
        return ResponseEntity.ok(service.createContact(id, req));
    }

    @PutMapping("/{id}/contacts/{contactId}")
    public ResponseEntity<SupplierContactDto> updateContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId,
            @Valid @RequestBody SupplierContactRequest req) {
        return ResponseEntity.ok(service.updateContact(id, contactId, req));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<SupplierItemDto> createItem(@PathVariable UUID id, @Valid @RequestBody SupplierItemRequest req) {
        return ResponseEntity.ok(service.createItem(id, req));
    }

    @PutMapping("/{id}/items/{itemId}")
    public ResponseEntity<SupplierItemDto> updateItem(
            @PathVariable UUID id,
            @PathVariable("itemId") UUID supplierItemId,
            @Valid @RequestBody SupplierItemRequest req) {
        return ResponseEntity.ok(service.updateItem(id, supplierItemId, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


