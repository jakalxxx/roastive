package com.roastive.api.domain.warehouse.controller;

import com.roastive.api.domain.warehouse.model.Warehouse;
import com.roastive.api.domain.warehouse.model.WarehouseInventory;
import com.roastive.api.domain.warehouse.service.WarehouseService;
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
@RequestMapping("/v2/warehouses")
@Validated
public class WarehouseController {
    private final WarehouseService service;

    public WarehouseController(WarehouseService service) { this.service = service; }

    // Warehouse
    @GetMapping
    public List<Warehouse> listWarehouses() { return service.findWarehouses(); }

    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> getWarehouse(@PathVariable UUID id) {
        Optional<Warehouse> w = service.findWarehouse(id);
        return w.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record WarehouseRequest(@NotNull Long roasteryId,
                                   @NotBlank @Size(max = 160) String warehouseName,
                                   @NotBlank @Size(max = 32) String type,
                                   @Size(max = 160) String location,
                                   BigDecimal maxCapacity,
                                   @NotBlank @Size(max = 32) String status) {}

    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@Valid @RequestBody WarehouseRequest req) {
        Warehouse w = new Warehouse();
        w.setRoasteryId(req.roasteryId());
        w.setWarehouseName(req.warehouseName());
        w.setType(req.type());
        w.setLocation(req.location());
        w.setMaxCapacity(req.maxCapacity());
        w.setStatus(req.status());
        w.setCreatedAt(OffsetDateTime.now());
        w.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createWarehouse(w));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable UUID id, @Valid @RequestBody WarehouseRequest req) {
        Warehouse w = new Warehouse();
        w.setRoasteryId(req.roasteryId());
        w.setWarehouseName(req.warehouseName());
        w.setType(req.type());
        w.setLocation(req.location());
        w.setMaxCapacity(req.maxCapacity());
        w.setStatus(req.status());
        w.setUpdatedAt(OffsetDateTime.now());
        return service.updateWarehouse(id, w).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable UUID id) {
        service.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }

    // Inventory
    @GetMapping("/inventory")
    public List<WarehouseInventory> listInventories() { return service.findInventories(); }

    @GetMapping("/inventory/{id}")
    public ResponseEntity<WarehouseInventory> getInventory(@PathVariable UUID id) {
        Optional<WarehouseInventory> i = service.findInventory(id);
        return i.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record InventoryRequest(@NotNull Long roasteryId,
                                   @NotNull UUID warehouseId,
                                   @NotNull UUID itemId,
                                   @NotBlank @Size(max = 80) String lotNo,
                                   @NotNull BigDecimal quantity) {}

    @PostMapping("/inventory")
    public ResponseEntity<WarehouseInventory> createInventory(@Valid @RequestBody InventoryRequest req) {
        WarehouseInventory inv = new WarehouseInventory();
        inv.setRoasteryId(req.roasteryId());
        inv.setWarehouseId(req.warehouseId());
        inv.setItemId(req.itemId());
        inv.setLotNo(req.lotNo());
        inv.setQuantity(req.quantity());
        inv.setLastUpdated(OffsetDateTime.now());
        return ResponseEntity.ok(service.createInventory(inv));
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<WarehouseInventory> updateInventory(@PathVariable UUID id, @Valid @RequestBody InventoryRequest req) {
        WarehouseInventory inv = new WarehouseInventory();
        inv.setRoasteryId(req.roasteryId());
        inv.setWarehouseId(req.warehouseId());
        inv.setItemId(req.itemId());
        inv.setLotNo(req.lotNo());
        inv.setQuantity(req.quantity());
        inv.setLastUpdated(OffsetDateTime.now());
        return service.updateInventory(id, inv).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable UUID id) {
        service.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }
}


