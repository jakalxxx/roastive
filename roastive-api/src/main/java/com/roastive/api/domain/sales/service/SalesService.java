package com.roastive.api.domain.sales.service;

import com.roastive.api.domain.sales.model.SalesOrder;
import com.roastive.api.domain.sales.model.SalesOrderLine;
import com.roastive.api.domain.sales.model.SalesOrderStatusLog;
import com.roastive.api.domain.sales.repository.SalesOrderLineRepository;
import com.roastive.api.domain.sales.repository.SalesOrderRepository;
import com.roastive.api.domain.sales.repository.SalesOrderStatusLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class SalesService {
    private final SalesOrderRepository orderRepo;
    private final SalesOrderLineRepository lineRepo;
    private final SalesOrderStatusLogRepository statusRepo;

    public SalesService(SalesOrderRepository orderRepo,
                        SalesOrderLineRepository lineRepo,
                        SalesOrderStatusLogRepository statusRepo) {
        this.orderRepo = orderRepo;
        this.lineRepo = lineRepo;
        this.statusRepo = statusRepo;
    }

    // Orders
    public List<SalesOrder> findOrders() { return orderRepo.findAll(); }
    public Optional<SalesOrder> findOrder(UUID id) { return orderRepo.findById(id); }
    @Transactional public SalesOrder createOrder(SalesOrder o) { return orderRepo.save(o); }
    @Transactional public Optional<SalesOrder> updateOrder(UUID id, SalesOrder u) {
        return orderRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setOrderNo(u.getOrderNo());
            e.setCustomerId(u.getCustomerId());
            e.setOrderDate(u.getOrderDate());
            e.setCutoffDate(u.getCutoffDate());
            e.setCurrency(u.getCurrency());
            e.setStatus(u.getStatus());
            e.setRemarks(u.getRemarks());
            e.setUpdatedAt(u.getUpdatedAt());
            return orderRepo.save(e);
        });
    }
    @Transactional public void deleteOrder(UUID id) { orderRepo.deleteById(id); }

    // Lines
    public List<SalesOrderLine> findLines() { return lineRepo.findAll(); }
    public Optional<SalesOrderLine> findLine(UUID id) { return lineRepo.findById(id); }
    @Transactional public SalesOrderLine createLine(SalesOrderLine l) { return lineRepo.save(l); }
    @Transactional public Optional<SalesOrderLine> updateLine(UUID id, SalesOrderLine u) {
        return lineRepo.findById(id).map(e -> {
            e.setOrderId(u.getOrderId());
            e.setProductId(u.getProductId());
            e.setVariantId(u.getVariantId());
            e.setQuantity(u.getQuantity());
            e.setUnit(u.getUnit());
            e.setUnitPrice(u.getUnitPrice());
            e.setAmount(u.getAmount());
            e.setCreatedAt(u.getCreatedAt());
            return lineRepo.save(e);
        });
    }
    @Transactional public void deleteLine(UUID id) { lineRepo.deleteById(id); }

    // Status logs
    public List<SalesOrderStatusLog> findStatusLogs() { return statusRepo.findAll(); }
    public Optional<SalesOrderStatusLog> findStatusLog(UUID id) { return statusRepo.findById(id); }
    @Transactional public SalesOrderStatusLog createStatusLog(SalesOrderStatusLog s) { return statusRepo.save(s); }
    @Transactional public Optional<SalesOrderStatusLog> updateStatusLog(UUID id, SalesOrderStatusLog u) {
        return statusRepo.findById(id).map(e -> {
            e.setOrderId(u.getOrderId());
            e.setStatus(u.getStatus());
            e.setMemo(u.getMemo());
            e.setChangedAt(u.getChangedAt());
            return statusRepo.save(e);
        });
    }
    @Transactional public void deleteStatusLog(UUID id) { statusRepo.deleteById(id); }
}


