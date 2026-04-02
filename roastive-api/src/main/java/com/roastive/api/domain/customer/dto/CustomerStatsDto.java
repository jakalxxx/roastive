package com.roastive.api.domain.customer.dto;

public class CustomerStatsDto {
    private long newActiveCustomers;

    public CustomerStatsDto(long newActiveCustomers) {
        this.newActiveCustomers = newActiveCustomers;
    }

    public long getNewActiveCustomers() {
        return newActiveCustomers;
    }

    public void setNewActiveCustomers(long newActiveCustomers) {
        this.newActiveCustomers = newActiveCustomers;
    }
}








