package com.roastive.api.domain.roastery.service;

import com.roastive.api.domain.roastery.dto.CreateOrUpdateBankAccountRequest;
import com.roastive.api.domain.roastery.model.Roastery;
import com.roastive.api.domain.roastery.model.RoasteryBankAccount;
import com.roastive.api.domain.roastery.repository.RoasteryBankAccountRepository;
import com.roastive.api.domain.roastery.repository.RoasteryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoasteryBankAccountService {
    private final RoasteryRepository roasteryRepository;
    private final RoasteryBankAccountRepository bankAccountRepository;

    public RoasteryBankAccountService(RoasteryRepository roasteryRepository,
                                      RoasteryBankAccountRepository bankAccountRepository) {
        this.roasteryRepository = roasteryRepository;
        this.bankAccountRepository = bankAccountRepository;
    }

    private Roastery resolveRoastery(UUID roasteryId) {
        if (roasteryId == null) throw new IllegalArgumentException("로스터리 정보가 필요합니다.");
        return roasteryRepository.findById(roasteryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 로스터리입니다."));
    }

    public List<RoasteryBankAccount> list(UUID roasteryId) {
        Roastery roastery = resolveRoastery(roasteryId);
        return bankAccountRepository.findByRoasteryIdOrderByCreatedAtDesc(roastery.getRoasteryId());
    }

    @Transactional
    public RoasteryBankAccount create(UUID roasteryId, CreateOrUpdateBankAccountRequest req) {
        Roastery roastery = resolveRoastery(roasteryId);
        RoasteryBankAccount account = new RoasteryBankAccount();
        account.setBankId(UUID.randomUUID());
        account.setRoasteryId(roastery.getRoasteryId());
        account.setBankName(req.getBankName());
        account.setAccountNo(req.getAccountNo());
        account.setAccountHolder(req.getAccountHolder());
        account.setSwiftBic(req.getSwiftBic());
        account.setIban(req.getIban());
        account.setCurrency(
                req.getCurrency() == null || req.getCurrency().isBlank() ? "KRW" : req.getCurrency().toUpperCase()
        );
        account.setPrimary(Boolean.TRUE.equals(req.getPrimary()));
        account.setCreatedAt(OffsetDateTime.now());
        return bankAccountRepository.save(account);
    }

    @Transactional
    public Optional<RoasteryBankAccount> update(UUID roasteryId, UUID bankId, CreateOrUpdateBankAccountRequest req) {
        Roastery roastery = resolveRoastery(roasteryId);
        return bankAccountRepository.findByBankIdAndRoasteryId(bankId, roastery.getRoasteryId()).map(existing -> {
            if (req.getBankName() != null) existing.setBankName(req.getBankName());
            if (req.getAccountNo() != null) existing.setAccountNo(req.getAccountNo());
            if (req.getAccountHolder() != null) existing.setAccountHolder(req.getAccountHolder());
            existing.setSwiftBic(req.getSwiftBic());
            existing.setIban(req.getIban());
            existing.setCurrency(
                    req.getCurrency() == null || req.getCurrency().isBlank() ? existing.getCurrency() : req.getCurrency().toUpperCase()
            );
            if (req.getPrimary() != null) {
                existing.setPrimary(req.getPrimary());
            }
            return bankAccountRepository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID roasteryId, UUID bankId) {
        Roastery roastery = resolveRoastery(roasteryId);
        bankAccountRepository.deleteByBankIdAndRoasteryId(bankId, roastery.getRoasteryId());
    }
}
















