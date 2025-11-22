package com.roastive.api.domain.idsequence.controller;

import com.roastive.api.domain.idsequence.model.IdSequence;
import com.roastive.api.domain.idsequence.service.IdSequenceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/id-sequences")
@Validated
public class IdSequenceController {
    private final IdSequenceService service;

    public IdSequenceController(IdSequenceService service) { this.service = service; }

    @GetMapping
    public List<IdSequence> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<IdSequence> get(@PathVariable UUID id) {
        Optional<IdSequence> seq = service.findById(id);
        return seq.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record IdSequenceRequest(@Min(0) Long lastValue) {}

    @PostMapping
    public ResponseEntity<IdSequence> create(@Valid @RequestBody IdSequenceRequest req) {
        IdSequence seq = new IdSequence();
        seq.setLastValue(req.lastValue());
        seq.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(seq));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IdSequence> update(@PathVariable UUID id, @Valid @RequestBody IdSequenceRequest req) {
        IdSequence seq = new IdSequence();
        seq.setLastValue(req.lastValue());
        seq.setUpdatedAt(OffsetDateTime.now());
        return service.update(id, seq).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


