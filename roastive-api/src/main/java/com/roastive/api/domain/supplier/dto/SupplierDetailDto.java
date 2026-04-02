package com.roastive.api.domain.supplier.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.util.ArrayList;
import java.util.List;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SupplierDetailDto {
    private SupplierDto supplier;
    private List<SupplierContactDto> contacts = new ArrayList<>();
    private List<SupplierContractDto> contracts = new ArrayList<>();
    private List<SupplierItemDto> items = new ArrayList<>();

    public SupplierDto getSupplier() { return supplier; }
    public void setSupplier(SupplierDto supplier) { this.supplier = supplier; }
    public List<SupplierContactDto> getContacts() { return contacts; }
    public void setContacts(List<SupplierContactDto> contacts) { this.contacts = contacts; }
    public List<SupplierContractDto> getContracts() { return contracts; }
    public void setContracts(List<SupplierContractDto> contracts) { this.contracts = contracts; }
    public List<SupplierItemDto> getItems() { return items; }
    public void setItems(List<SupplierItemDto> items) { this.items = items; }
}



