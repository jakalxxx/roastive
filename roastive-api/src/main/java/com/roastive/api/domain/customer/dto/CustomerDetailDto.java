package com.roastive.api.domain.customer.dto;

import com.roastive.api.domain.customer.model.Customer;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CustomerDetailDto {
    private Customer customer;
    private RoasteryLink roastery;

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public RoasteryLink getRoastery() { return roastery; }
    public void setRoastery(RoasteryLink roastery) { this.roastery = roastery; }

    public static class RoasteryLink {
        private UUID roasteryId;
        private String status;
        private OffsetDateTime requestedAt;
        private OffsetDateTime approvedAt;

        public UUID getRoasteryId() { return roasteryId; }
        public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public OffsetDateTime getRequestedAt() { return requestedAt; }
        public void setRequestedAt(OffsetDateTime requestedAt) { this.requestedAt = requestedAt; }
        public OffsetDateTime getApprovedAt() { return approvedAt; }
        public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }
    }
}

























