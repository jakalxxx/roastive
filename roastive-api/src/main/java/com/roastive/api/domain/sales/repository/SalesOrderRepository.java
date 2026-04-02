package com.roastive.api.domain.sales.repository;

import com.roastive.api.domain.sales.dto.SalesOrderListProjection;
import com.roastive.api.domain.sales.dto.SalesOrderLineProjection;
import com.roastive.api.domain.sales.dto.SalesReportProjection;
import com.roastive.api.domain.sales.model.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, UUID> {
    @Query(value = """
            SELECT
                o.order_id,
                o.order_no,
                o.order_date,
                o.customer_id,
                c.customer_name,
                o.currency,
                o.status,
                COALESCE(SUM(l.amount), 0) AS total_amount,
                COALESCE(string_agg(DISTINCT pm.product_name, ', '), '') AS blend_names
            FROM sales_order o
            LEFT JOIN customer c ON c.customer_id = o.customer_id
            LEFT JOIN sales_order_line l ON l.order_id = o.order_id
            LEFT JOIN product_master pm ON pm.product_id = l.product_id
            WHERE o.roastery_id = :roasteryId
              AND o.status IN (:statuses)
              AND (:startDate IS NULL OR o.order_date >= :startDate)
              AND (:endDate IS NULL OR o.order_date <= :endDate)
            GROUP BY o.order_id, c.customer_name
            """, nativeQuery = true)
    List<SalesReportProjection> findReportRows(
            @Param("roasteryId") UUID roasteryId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            @Param("statuses") List<String> statuses);

    @Query(value = """
            SELECT
                o.order_id,
                o.order_no,
                o.customer_id,
                c.customer_name,
                o.status,
                o.order_date,
                COALESCE(string_agg(DISTINCT pm.product_name, ', '), '') AS product_names
            FROM sales_order o
            LEFT JOIN customer c ON c.customer_id = o.customer_id
            LEFT JOIN sales_order_line l ON l.order_id = o.order_id
            LEFT JOIN product_master pm ON pm.product_id = l.product_id
            WHERE o.roastery_id = :roasteryId
            GROUP BY o.order_id, o.order_no, o.customer_id, c.customer_name, o.status, o.order_date
            ORDER BY o.order_date DESC
            """, nativeQuery = true)
    List<SalesOrderListProjection> findOrderSummaries(@Param("roasteryId") UUID roasteryId);

    @Query(value = """
            SELECT
                o.order_id,
                o.order_no,
                o.customer_id,
                c.customer_name,
                o.status,
                o.order_date,
                COALESCE(string_agg(DISTINCT pm.product_name, ', '), '') AS product_names
            FROM sales_order o
            LEFT JOIN customer c ON c.customer_id = o.customer_id
            LEFT JOIN sales_order_line l ON l.order_id = o.order_id
            LEFT JOIN product_master pm ON pm.product_id = l.product_id
            WHERE o.roastery_id = :roasteryId
              AND o.order_date >= :startDate
              AND o.order_date < :endDate
            GROUP BY o.order_id, o.order_no, o.customer_id, c.customer_name, o.status, o.order_date
            ORDER BY o.order_date DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<SalesOrderListProjection> findTodayOrders(
            @Param("roasteryId") UUID roasteryId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            @Param("limit") int limit);

    @Query(value = """
            SELECT COUNT(*)
            FROM sales_order o
            WHERE o.roastery_id = :roasteryId
              AND o.order_date >= :startDate
              AND o.order_date < :endDate
            """, nativeQuery = true)
    long countOrdersInRange(
            @Param("roasteryId") UUID roasteryId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate);

    @Query(value = """
            SELECT
                l.order_detail_id,
                l.order_id,
                l.product_id,
                l.variant_id,
                l.quantity,
                l.unit,
                l.unit_price,
                l.amount,
                pm.product_name
            FROM sales_order_line l
            LEFT JOIN product_master pm ON pm.product_id = l.product_id
            WHERE l.order_id = :orderId
            ORDER BY l.created_at ASC
            """, nativeQuery = true)
    List<SalesOrderLineProjection> findOrderLines(@Param("orderId") UUID orderId);
}

