package com.roastive.api.domain.sales.dto;

import com.roastive.api.domain.sales.model.SalesOrder;
import com.roastive.api.domain.sales.model.SalesOrderStatusLog;

import java.util.List;

public class SalesOrderDetailDto {
    private SalesOrder order;
    private List<SalesOrderLineDto> lines;
    private List<SalesOrderStatusLog> statusLogs;

    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder order) { this.order = order; }
    public List<SalesOrderLineDto> getLines() { return lines; }
    public void setLines(List<SalesOrderLineDto> lines) { this.lines = lines; }
    public List<SalesOrderStatusLog> getStatusLogs() { return statusLogs; }
    public void setStatusLogs(List<SalesOrderStatusLog> statusLogs) { this.statusLogs = statusLogs; }
}








