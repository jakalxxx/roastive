package com.roastive.api.domain.tax.service;

import com.roastive.api.domain.tax.model.*;
import com.roastive.api.domain.tax.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TaxService {
    private final TaxInvoiceMasterRepository masterRepo;
    private final TaxInvoiceDetailRepository detailRepo;
    private final TaxInvoicePartySnapshotRepository partyRepo;
    private final TaxInvoiceExportLogRepository exportRepo;

    public TaxService(TaxInvoiceMasterRepository masterRepo,
                      TaxInvoiceDetailRepository detailRepo,
                      TaxInvoicePartySnapshotRepository partyRepo,
                      TaxInvoiceExportLogRepository exportRepo) {
        this.masterRepo = masterRepo;
        this.detailRepo = detailRepo;
        this.partyRepo = partyRepo;
        this.exportRepo = exportRepo;
    }

    // Master
    public List<TaxInvoiceMaster> findInvoices() { return masterRepo.findAll(); }
    public Optional<TaxInvoiceMaster> findInvoice(UUID id) { return masterRepo.findById(id); }
    @Transactional public TaxInvoiceMaster createInvoice(TaxInvoiceMaster m) { return masterRepo.save(m); }
    @Transactional public Optional<TaxInvoiceMaster> updateInvoice(UUID id, TaxInvoiceMaster u) {
        return masterRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setOrderId(u.getOrderId());
            e.setCustomerId(u.getCustomerId());
            e.setInvoiceDate(u.getInvoiceDate());
            e.setCurrency(u.getCurrency());
            e.setSupplyAmount(u.getSupplyAmount());
            e.setVatAmount(u.getVatAmount());
            e.setTotalAmount(u.getTotalAmount());
            e.setTaxRate(u.getTaxRate());
            e.setStatus(u.getStatus());
            e.setRemarks(u.getRemarks());
            e.setUpdatedAt(u.getUpdatedAt());
            return masterRepo.save(e);
        });
    }
    @Transactional public void deleteInvoice(UUID id) { masterRepo.deleteById(id); }

    // Detail
    public List<TaxInvoiceDetail> findDetails() { return detailRepo.findAll(); }
    public Optional<TaxInvoiceDetail> findDetail(UUID id) { return detailRepo.findById(id); }
    @Transactional public TaxInvoiceDetail createDetail(TaxInvoiceDetail d) { return detailRepo.save(d); }
    @Transactional public Optional<TaxInvoiceDetail> updateDetail(UUID id, TaxInvoiceDetail u) {
        return detailRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setInvoiceId(u.getInvoiceId());
            e.setOrderDetailId(u.getOrderDetailId());
            e.setProductId(u.getProductId());
            e.setVariantId(u.getVariantId());
            e.setDescription(u.getDescription());
            e.setQuantity(u.getQuantity());
            e.setUnit(u.getUnit());
            e.setUnitPrice(u.getUnitPrice());
            e.setSupplyAmount(u.getSupplyAmount());
            e.setVatAmount(u.getVatAmount());
            e.setTotalAmount(u.getTotalAmount());
            e.setCreatedAt(u.getCreatedAt());
            return detailRepo.save(e);
        });
    }
    @Transactional public void deleteDetail(UUID id) { detailRepo.deleteById(id); }

    // Party
    public List<TaxInvoicePartySnapshot> findParties() { return partyRepo.findAll(); }
    public Optional<TaxInvoicePartySnapshot> findParty(UUID id) { return partyRepo.findById(id); }
    @Transactional public TaxInvoicePartySnapshot createParty(TaxInvoicePartySnapshot p) { return partyRepo.save(p); }
    @Transactional public Optional<TaxInvoicePartySnapshot> updateParty(UUID id, TaxInvoicePartySnapshot u) {
        return partyRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setInvoiceId(u.getInvoiceId());
            e.setPartyType(u.getPartyType());
            e.setBusinessRegNo(u.getBusinessRegNo());
            e.setName(u.getName());
            e.setRepresentative(u.getRepresentative());
            e.setAddress(u.getAddress());
            e.setEmail(u.getEmail());
            e.setPhone(u.getPhone());
            e.setSnapshotAt(u.getSnapshotAt());
            return partyRepo.save(e);
        });
    }
    @Transactional public void deleteParty(UUID id) { partyRepo.deleteById(id); }

    // Export
    public List<TaxInvoiceExportLog> findExports() { return exportRepo.findAll(); }
    public Optional<TaxInvoiceExportLog> findExport(UUID id) { return exportRepo.findById(id); }
    @Transactional public TaxInvoiceExportLog createExport(TaxInvoiceExportLog e) { return exportRepo.save(e); }
    @Transactional public Optional<TaxInvoiceExportLog> updateExport(UUID id, TaxInvoiceExportLog u) {
        return exportRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setInvoiceId(u.getInvoiceId());
            e.setProvider(u.getProvider());
            e.setFileName(u.getFileName());
            e.setChecksumMd5(u.getChecksumMd5());
            e.setStatus(u.getStatus());
            e.setErrorMessage(u.getErrorMessage());
            e.setExportedBy(u.getExportedBy());
            e.setExportedAt(u.getExportedAt());
            return exportRepo.save(e);
        });
    }
    @Transactional public void deleteExport(UUID id) { exportRepo.deleteById(id); }
}


