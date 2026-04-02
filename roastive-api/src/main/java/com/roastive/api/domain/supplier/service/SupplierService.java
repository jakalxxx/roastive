package com.roastive.api.domain.supplier.service;

import com.roastive.api.domain.supplier.dto.*;
import com.roastive.api.domain.supplier.model.SupplierContact;
import com.roastive.api.domain.supplier.model.SupplierContract;
import com.roastive.api.domain.supplier.model.SupplierContractPrice;
import com.roastive.api.domain.supplier.model.SupplierItem;
import com.roastive.api.domain.supplier.repository.SupplierContactRepository;
import com.roastive.api.domain.supplier.repository.SupplierContractRepository;
import com.roastive.api.domain.supplier.repository.SupplierItemRepository;
import com.roastive.api.domain.supplier.repository.SupplierRepository;
import com.roastive.api.domain.supplier.service.mapper.SupplierMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class SupplierService {
    private final SupplierRepository repository;
    private final SupplierContactRepository contactRepository;
    private final SupplierContractRepository contractRepository;
    private final SupplierItemRepository itemRepository;
    private final SupplierMapper mapper;

    public SupplierService(
            SupplierRepository repository,
            SupplierContactRepository contactRepository,
            SupplierContractRepository contractRepository,
            SupplierItemRepository itemRepository,
            SupplierMapper mapper) {
        this.repository = repository;
        this.contactRepository = contactRepository;
        this.contractRepository = contractRepository;
        this.itemRepository = itemRepository;
        this.mapper = mapper;
    }

    public List<SupplierDto> findAll() { return repository.findAll().stream().map(mapper::toDto).toList(); }
    public List<SupplierDto> findByRoastery(UUID roasteryId) {
        if (roasteryId == null) return findAll();
        return repository.findByRoasteryId(roasteryId).stream().map(mapper::toDto).toList();
    }
    public Optional<SupplierDto> findById(UUID id) { return repository.findById(id).map(mapper::toDto); }
    public Optional<SupplierDetailDto> findDetail(UUID supplierId, UUID roasteryId) {
        if (roasteryId == null) return Optional.empty();
        return repository.findBySupplierIdAndRoasteryId(supplierId, roasteryId).map(entity -> {
            SupplierDetailDto detail = new SupplierDetailDto();
            detail.setSupplier(mapper.toDto(entity));
            detail.setContacts(contactRepository.findBySupplierIdOrderByPrimaryContactDescCreatedAtDesc(supplierId)
                    .stream().map(this::toContactDto).toList());
            detail.setContracts(contractRepository.findBySupplierIdOrderByStartDateDesc(supplierId)
                    .stream().map(this::toContractDto).toList());
            detail.setItems(itemRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId)
                    .stream().map(this::toItemDto).toList());
            return detail;
        });
    }

    @Transactional
    public SupplierDto create(SupplierRequest req) { return mapper.toDto(repository.save(mapper.toEntity(req))); }

    @Transactional
    public Optional<SupplierDto> update(UUID id, SupplierRequest req) {
        return repository.findById(id).map(e -> {
            mapper.updateEntityFromRequest(req, e);
            return mapper.toDto(repository.save(e));
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }

    @Transactional
    public SupplierContactDto createContact(UUID supplierId, SupplierContactRequest req) {
        SupplierDto supplier = findByIdOrThrow(supplierId);
        SupplierContact contact = new SupplierContact();
        applyContact(contact, req);
        contact.setSupplierId(supplier.getSupplierId());
        resetPrimaryIfNeeded(supplierId, contact.isPrimaryContact());
        return toContactDto(contactRepository.save(contact));
    }

    @Transactional
    public SupplierContactDto updateContact(UUID supplierId, UUID contactId, SupplierContactRequest req) {
        SupplierContact contact = contactRepository.findByContactIdAndSupplierId(contactId, supplierId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "담당자 정보를 찾을 수 없습니다."));
        boolean willBePrimary = req.getPrimary() != null ? req.getPrimary() : contact.isPrimaryContact();
        applyContact(contact, req);
        resetPrimaryIfNeeded(supplierId, willBePrimary);
        return toContactDto(contactRepository.save(contact));
    }

    @Transactional
    public SupplierItemDto createItem(UUID supplierId, SupplierItemRequest req) {
        SupplierDto supplier = findByIdOrThrow(supplierId);
        SupplierItem item = new SupplierItem();
        applyItem(item, req);
        item.setSupplierId(supplier.getSupplierId());
        return toItemDto(itemRepository.save(item));
    }

    @Transactional
    public SupplierItemDto updateItem(UUID supplierId, UUID supplierItemId, SupplierItemRequest req) {
        SupplierItem item = itemRepository.findBySupplierItemIdAndSupplierId(supplierItemId, supplierId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "구매처 상품 정보를 찾을 수 없습니다."));
        applyItem(item, req);
        return toItemDto(itemRepository.save(item));
    }

    private SupplierDto findByIdOrThrow(UUID supplierId) {
        return findById(supplierId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "구매처 정보를 찾을 수 없습니다."));
    }

    private void applyContact(SupplierContact entity, SupplierContactRequest req) {
        entity.setContactName(req.getContactName());
        entity.setPhone(req.getPhone());
        entity.setEmail(req.getEmail());
        entity.setRole(req.getRole());
        entity.setPrimaryContact(Boolean.TRUE.equals(req.getPrimary()));
    }

    private SupplierContactDto toContactDto(SupplierContact entity) {
        SupplierContactDto dto = new SupplierContactDto();
        dto.setContactId(entity.getContactId());
        dto.setSupplierId(entity.getSupplierId());
        dto.setContactName(entity.getContactName());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setRole(entity.getRole());
        dto.setPrimary(entity.isPrimaryContact());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private void resetPrimaryIfNeeded(UUID supplierId, boolean requestedPrimary) {
        if (requestedPrimary) {
            contactRepository.clearPrimary(supplierId);
        }
    }

    private SupplierContractDto toContractDto(SupplierContract entity) {
        SupplierContractDto dto = new SupplierContractDto();
        dto.setContractId(entity.getContractId());
        dto.setSupplierId(entity.getSupplierId());
        dto.setContractNo(entity.getContractNo());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setIncoterm(entity.getIncoterm());
        dto.setCurrency(entity.getCurrency());
        dto.setPaymentTerms(entity.getPaymentTerms());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setPrices(entity.getPrices().stream().map(this::toContractPriceDto).collect(Collectors.toList()));
        return dto;
    }

    private SupplierContractPriceDto toContractPriceDto(SupplierContractPrice entity) {
        SupplierContractPriceDto dto = new SupplierContractPriceDto();
        dto.setContractPriceId(entity.getContractPriceId());
        dto.setContractId(entity.getContract().getContractId());
        dto.setItemId(entity.getItemId());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setValidFrom(entity.getValidFrom());
        dto.setValidTo(entity.getValidTo());
        dto.setMinQty(entity.getMinQty());
        return dto;
    }

    private SupplierItemDto toItemDto(SupplierItem entity) {
        SupplierItemDto dto = new SupplierItemDto();
        dto.setSupplierItemId(entity.getSupplierItemId());
        dto.setSupplierId(entity.getSupplierId());
        dto.setItemId(entity.getItemId());
        dto.setVendorSku(entity.getVendorSku());
        dto.setVendorName(entity.getVendorName());
        dto.setLeadTimeDays(entity.getLeadTimeDays());
        dto.setMoq(entity.getMoq());
        dto.setCurrency(entity.getCurrency());
        dto.setLastPrice(entity.getLastPrice());
        dto.setLastPriceDate(entity.getLastPriceDate());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private void applyItem(SupplierItem entity, SupplierItemRequest req) {
        entity.setItemId(req.getItemId());
        entity.setVendorSku(req.getVendorSku());
        entity.setVendorName(req.getVendorName());
        entity.setLeadTimeDays(req.getLeadTimeDays());
        entity.setMoq(req.getMoq());
        entity.setCurrency(req.getCurrency());
        entity.setLastPrice(req.getLastPrice());
        entity.setLastPriceDate(req.getLastPriceDate());
    }
}


