package com.roastive.api.domain.rolepermission.controller;

import com.roastive.api.domain.rolepermission.model.RolePermission;
import com.roastive.api.domain.rolepermission.service.RolePermissionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/role-permissions")
@Validated
public class RolePermissionController {
    private final RolePermissionService service;

    public RolePermissionController(RolePermissionService service) { this.service = service; }

    @GetMapping
    public List<RolePermission> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<RolePermission> get(@PathVariable UUID id) {
        Optional<RolePermission> rp = service.findById(id);
        return rp.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record RolePermissionRequest(UUID roleId,
                                        @NotBlank @Size(max = 64) String module,
                                        @NotBlank @Size(max = 32) String action) {}

    @PostMapping
    public ResponseEntity<RolePermission> create(@Valid @RequestBody RolePermissionRequest req) {
        RolePermission rp = new RolePermission();
        rp.setRoleId(req.roleId());
        rp.setModule(req.module());
        rp.setAction(req.action());
        return ResponseEntity.ok(service.create(rp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RolePermission> update(@PathVariable UUID id, @Valid @RequestBody RolePermissionRequest req) {
        RolePermission rp = new RolePermission();
        rp.setRoleId(req.roleId());
        rp.setModule(req.module());
        rp.setAction(req.action());
        return service.update(id, rp).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


