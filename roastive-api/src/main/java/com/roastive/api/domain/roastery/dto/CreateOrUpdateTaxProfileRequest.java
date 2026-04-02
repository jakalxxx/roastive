package com.roastive.api.domain.roastery.dto;

public class CreateOrUpdateTaxProfileRequest {
    private String vatNo;
    private String taxType;
    private String invoiceEmission;
    private String invoiceEmail;
    private String remarks;

    public String getVatNo() {
        return vatNo;
    }

    public void setVatNo(String vatNo) {
        this.vatNo = vatNo;
    }

    public String getTaxType() {
        return taxType;
    }

    public void setTaxType(String taxType) {
        this.taxType = taxType;
    }

    public String getInvoiceEmission() {
        return invoiceEmission;
    }

    public void setInvoiceEmission(String invoiceEmission) {
        this.invoiceEmission = invoiceEmission;
    }

    public String getInvoiceEmail() {
        return invoiceEmail;
    }

    public void setInvoiceEmail(String invoiceEmail) {
        this.invoiceEmail = invoiceEmail;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
















