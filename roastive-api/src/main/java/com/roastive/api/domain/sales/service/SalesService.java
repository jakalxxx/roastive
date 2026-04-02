package com.roastive.api.domain.sales.service;

import com.roastive.api.domain.sales.dto.SalesOrderListDto;
import com.roastive.api.domain.sales.dto.SalesOrderDetailDto;
import com.roastive.api.domain.sales.dto.SalesOrderLineDto;
import com.roastive.api.domain.sales.dto.SalesReportProjection;
import com.roastive.api.domain.sales.dto.SalesReportRowDto;
import com.roastive.api.domain.sales.model.SalesOrder;
import com.roastive.api.domain.sales.model.SalesOrderLine;
import com.roastive.api.domain.sales.model.SalesOrderStatusLog;
import com.roastive.api.domain.sales.repository.SalesOrderLineRepository;
import com.roastive.api.domain.sales.repository.SalesOrderRepository;
import com.roastive.api.domain.sales.repository.SalesOrderStatusLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SalesService {
    private final SalesOrderRepository orderRepo;
    private final SalesOrderLineRepository lineRepo;
    private final SalesOrderStatusLogRepository statusRepo;
    private static final List<String> REPORT_STATUSES = List.of(
            "SHIPPED", "DELIVERED", "SETTLED", "발송완료", "정산완료"
    );

    public SalesService(SalesOrderRepository orderRepo,
                        SalesOrderLineRepository lineRepo,
                        SalesOrderStatusLogRepository statusRepo) {
        this.orderRepo = orderRepo;
        this.lineRepo = lineRepo;
        this.statusRepo = statusRepo;
    }

    // Orders
    public List<SalesOrderListDto> findOrders(UUID roasteryId) {
        if (roasteryId == null) return List.of();
        return orderRepo.findOrderSummaries(roasteryId).stream()
                .map(SalesOrderListDto::fromProjection)
                .toList();
    }
    public List<SalesOrderListDto> findTodayOrders(UUID roasteryId, OffsetDateTime start, OffsetDateTime end, int limit) {
        if (roasteryId == null) return List.of();
        return orderRepo.findTodayOrders(roasteryId, start, end, limit).stream()
                .map(SalesOrderListDto::fromProjection)
                .toList();
    }
    public long countOrdersInRange(UUID roasteryId, OffsetDateTime start, OffsetDateTime end) {
        if (roasteryId == null) return 0;
        return orderRepo.countOrdersInRange(roasteryId, start, end);
    }
    public Optional<SalesOrder> findOrder(UUID id) { return orderRepo.findById(id); }
    public Optional<SalesOrderDetailDto> findOrderDetail(UUID id) {
        return orderRepo.findById(id).map(order -> {
            SalesOrderDetailDto dto = new SalesOrderDetailDto();
            dto.setOrder(order);
            dto.setLines(orderRepo.findOrderLines(id).stream()
                    .map(SalesOrderLineDto::fromProjection)
                    .toList());
            dto.setStatusLogs(statusRepo.findByOrderIdOrderByChangedAtDesc(id));
            return dto;
        });
    }
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

    public List<SalesReportRowDto> generateSalesReport(UUID roasteryId,
                                                       OffsetDateTime startDate,
                                                       OffsetDateTime endDate,
                                                       String sortKey,
                                                       String direction) {
        if (roasteryId == null) return List.of();
        List<SalesReportProjection> projections = orderRepo.findReportRows(roasteryId, startDate, endDate, REPORT_STATUSES);
        List<SalesReportRowDto> rows = projections.stream()
                .map(SalesReportRowDto::fromProjection)
                .collect(Collectors.toList());

        Comparator<SalesReportRowDto> comparator = buildComparator(sortKey);
        if ("asc".equalsIgnoreCase(direction)) {
            rows.sort(comparator);
        } else {
            rows.sort(comparator.reversed());
        }
        return rows;
    }

    private Comparator<SalesReportRowDto> buildComparator(String sortKey) {
        Comparator<SalesReportRowDto> byDate = Comparator.comparing(
                SalesReportRowDto::getOrderDate,
                Comparator.nullsLast(Comparator.naturalOrder())
        );
        if ("customerName".equalsIgnoreCase(sortKey)) {
            return Comparator.comparing(row -> safeString(row.getCustomerName()), String.CASE_INSENSITIVE_ORDER);
        }
        if ("blendName".equalsIgnoreCase(sortKey) || "blendNames".equalsIgnoreCase(sortKey)) {
            return Comparator.comparing(row -> safeString(row.getBlendNames()), String.CASE_INSENSITIVE_ORDER);
        }
        if ("amount".equalsIgnoreCase(sortKey)) {
            return Comparator.comparing(
                    row -> row.getTotalAmount() != null ? row.getTotalAmount() : BigDecimal.ZERO
            );
        }
        return byDate;
    }

    private String safeString(String value) {
        return value == null ? "" : value;
    }
}


