package com.roastive.api.domain.item.controller;

import com.roastive.api.domain.item.model.ItemMaster;
import com.roastive.api.domain.item.service.ItemService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/items")
@Validated
public class ItemController {
    private final ItemService service;

    public ItemController(ItemService service) { this.service = service; }

    public record ItemRequest(@NotNull Long roasteryId,
                              @NotBlank @Size(max = 32) String category,
                              @NotBlank @Size(max = 160) String name,
                              @NotBlank @Size(max = 16) String baseUnit,
                              String description,
                              @NotBlank @Size(max = 32) String status) {}

    @GetMapping
    public List<ItemMaster> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<ItemMaster> get(@PathVariable UUID id) {
        Optional<ItemMaster> m = service.findById(id);
        return m.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ItemMaster> create(@Valid @RequestBody ItemRequest req) {
        ItemMaster m = new ItemMaster();
        m.setRoasteryId(req.roasteryId());
        m.setCategory(req.category());
        m.setName(req.name());
        m.setBaseUnit(req.baseUnit());
        m.setDescription(req.description());
        m.setStatus(req.status());
        m.setCreatedAt(OffsetDateTime.now());
        m.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(m));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemMaster> update(@PathVariable UUID id, @Valid @RequestBody ItemRequest req) {
        ItemMaster m = new ItemMaster();
        m.setRoasteryId(req.roasteryId());
        m.setCategory(req.category());
        m.setName(req.name());
        m.setBaseUnit(req.baseUnit());
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


