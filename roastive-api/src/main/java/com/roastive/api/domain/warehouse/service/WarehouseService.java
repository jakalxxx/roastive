package com.roastive.api.domain.warehouse.service;

import com.roastive.api.domain.warehouse.model.Warehouse;
import com.roastive.api.domain.warehouse.model.WarehouseInventory;
import com.roastive.api.domain.warehouse.repository.WarehouseInventoryRepository;
import com.roastive.api.domain.warehouse.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class WarehouseService {
    private final WarehouseRepository warehouseRepo;
    private final WarehouseInventoryRepository inventoryRepo;

    public WarehouseService(WarehouseRepository warehouseRepo, WarehouseInventoryRepository inventoryRepo) {
        this.warehouseRepo = warehouseRepo;
        this.inventoryRepo = inventoryRepo;
    }

    // Warehouse
    public List<Warehouse> findWarehouses() { return warehouseRepo.findAll(); }
    public Optional<Warehouse> findWarehouse(UUID id) { return warehouseRepo.findById(id); }
    @Transactional public Warehouse createWarehouse(Warehouse w) { return warehouseRepo.save(w); }
    @Transactional public Optional<Warehouse> updateWarehouse(UUID id, Warehouse u) {
        return warehouseRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setWarehouseName(u.getWarehouseName());
            e.setType(u.getType());
            e.setLocation(u.getLocation());
            e.setMaxCapacity(u.getMaxCapacity());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return warehouseRepo.save(e);
        });
    }
    @Transactional public void deleteWarehouse(UUID id) { warehouseRepo.deleteById(id); }

    // Inventory
    public List<WarehouseInventory> findInventories() { return inventoryRepo.findAll(); }
    public Optional<WarehouseInventory> findInventory(UUID id) { return inventoryRepo.findById(id); }
    @Transactional public WarehouseInventory createInventory(WarehouseInventory inv) { return inventoryRepo.save(inv); }
    @Transactional public Optional<WarehouseInventory> updateInventory(UUID id, WarehouseInventory u) {
        return inventoryRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setWarehouseId(u.getWarehouseId());
            e.setItemId(u.getItemId());
            e.setLotNo(u.getLotNo());
            e.setQuantity(u.getQuantity());
            e.setLastUpdated(u.getLastUpdated());
            return inventoryRepo.save(e);
        });
    }
    @Transactional public void deleteInventory(UUID id) { inventoryRepo.deleteById(id); }
}


