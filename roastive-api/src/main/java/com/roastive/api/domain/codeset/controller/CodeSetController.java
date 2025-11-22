package com.roastive.api.domain.codeset.controller;

import com.roastive.api.domain.codeset.model.CodeSet;
import com.roastive.api.domain.codeset.service.CodeSetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/code-sets")
@Validated
public class CodeSetController {
    private final CodeSetService service;

    public CodeSetController(CodeSetService service) { this.service = service; }

    @GetMapping
    public List<CodeSet> list(@RequestParam(value = "type", required = false) String type) {
        if (type != null && !type.isBlank()) return service.findByType(type);
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CodeSet> get(@PathVariable UUID id) {
        Optional<CodeSet> cs = service.findById(id);
        return cs.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record CodeSetRequest(
            @NotBlank @Size(max = 64) String codeType,
            @NotBlank @Size(max = 64) String codeKey,
            @NotBlank @Size(max = 128) String label,
            Integer sort,
            Boolean active,
            String meta
    ) {}

    @PostMapping
    public ResponseEntity<CodeSet> create(@Valid @RequestBody CodeSetRequest req) {
        CodeSet cs = new CodeSet();
        cs.setCodeType(req.codeType());
        cs.setCodeKey(req.codeKey());
        cs.setLabel(req.label());
        cs.setSort(req.sort());
        cs.setActive(req.active());
        cs.setMeta(req.meta());
        cs.setCreatedAt(OffsetDateTime.now());
        cs.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(cs));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CodeSet> update(@PathVariable UUID id, @Valid @RequestBody CodeSetRequest req) {
        CodeSet cs = new CodeSet();
        cs.setCodeType(req.codeType());
        cs.setCodeKey(req.codeKey());
        cs.setLabel(req.label());
        cs.setSort(req.sort());
        cs.setActive(req.active());
        cs.setMeta(req.meta());
        cs.setUpdatedAt(OffsetDateTime.now());
        return service.update(id, cs).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


