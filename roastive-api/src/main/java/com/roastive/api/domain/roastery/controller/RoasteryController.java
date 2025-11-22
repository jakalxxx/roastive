package com.roastive.api.domain.roastery.controller;

import com.roastive.api.domain.roastery.dto.RoasteryRequestDto;
import com.roastive.api.domain.roastery.model.Roastery;
import com.roastive.api.domain.roastery.service.RoasteryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/roasteries")
@Validated
public class RoasteryController {
    private final RoasteryService service;

    public RoasteryController(RoasteryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Roastery> list() {
        return service.findAll();
    }

    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<Roastery> get(@PathVariable UUID id) {
        Optional<Roastery> roastery = service.findById(id);
        return roastery.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Roastery> create(@Valid @RequestBody RoasteryRequestDto request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<Roastery> update(@PathVariable UUID id, @Valid @RequestBody RoasteryRequestDto request) {
        return service.update(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


