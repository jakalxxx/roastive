package com.roastive.api.domain.roastery.controller;

import com.roastive.api.domain.roastery.dto.CreateOrUpdateBankAccountRequest;
import com.roastive.api.domain.roastery.service.RoasteryBankAccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v2/roasteries")
public class RoasteryBankAccountController {
    private final RoasteryBankAccountService service;

    public RoasteryBankAccountController(RoasteryBankAccountService service) {
        this.service = service;
    }

    @GetMapping("/bank-accounts")
    public ResponseEntity<?> list(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        var items = service.list(roasteryId);
        return ResponseEntity.ok(Map.of("ok", true, "items", items));
    }

    @PostMapping("/bank-accounts")
    public ResponseEntity<?> create(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @Valid @RequestBody CreateOrUpdateBankAccountRequest body) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        var data = service.create(roasteryId, body);
        return ResponseEntity.ok(Map.of("ok", true, "data", data));
    }

    @PatchMapping("/bank-accounts/{id}")
    public ResponseEntity<?> update(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @PathVariable("id") UUID id,
                                    @Valid @RequestBody CreateOrUpdateBankAccountRequest body) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        return service.update(roasteryId, id, body)
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(Map.of("ok", true, "data", account)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/bank-accounts/{id}")
    public ResponseEntity<?> delete(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @PathVariable("id") UUID id) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        service.delete(roasteryId, id);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
















