package com.roastive.api.domain.customer.repository;

import com.roastive.api.domain.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    @Query("""
            select c
            from Customer c
            where exists (
                select 1
                from CustomerRoastery cr
                where cr.customerId = c.customerId
                  and cr.roasteryId = :roasteryId
            )
            """)
    List<Customer> findAllByRoasteryId(@Param("roasteryId") UUID roasteryId);

    @Query(value = """
            SELECT COUNT(*)
            FROM customer c
            WHERE c.status = 'ACTIVE'
              AND c.created_at >= :startDate
              AND c.created_at < :endDate
              AND EXISTS (
                  SELECT 1 FROM customer_roastery cr
                  WHERE cr.customer_id = c.customer_id
                    AND cr.roastery_id = :roasteryId
              )
            """, nativeQuery = true)
    long countNewActiveCustomers(
            @Param("roasteryId") UUID roasteryId,
            @Param("startDate") java.time.OffsetDateTime startDate,
            @Param("endDate") java.time.OffsetDateTime endDate);
}


