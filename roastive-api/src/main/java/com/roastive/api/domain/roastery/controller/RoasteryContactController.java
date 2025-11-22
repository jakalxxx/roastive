package com.roastive.api.domain.roastery.controller;

import com.roastive.api.domain.roastery.dto.CreateOrUpdateContactRequest;
import com.roastive.api.domain.roastery.service.RoasteryContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v2/roasteries")
public class RoasteryContactController {
    private final RoasteryContactService service;

    public RoasteryContactController(RoasteryContactService service) {
        this.service = service;
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> list(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        var items = service.list(roasteryId);
        return ResponseEntity.ok(Map.of("ok", true, "items", items));
    }

    @PostMapping("/contacts")
    public ResponseEntity<?> create(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @RequestBody CreateOrUpdateContactRequest body) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        var dto = service.create(roasteryId, body);
        return ResponseEntity.ok(Map.of("ok", true, "data", dto));
    }

    @PatchMapping("/contacts/{id}")
    public ResponseEntity<?> update(@PathVariable("id") UUID id,
                                    @RequestBody CreateOrUpdateContactRequest body) {
        return service.update(id, body)
                .<ResponseEntity<?>>map(dto -> ResponseEntity.ok(Map.of("ok", true, "data", dto)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") UUID id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}


