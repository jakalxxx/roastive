package com.roastive.api.domain.user.controller;

import com.roastive.api.domain.user.model.UserAccount;
import com.roastive.api.domain.user.service.UserAccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
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
@RequestMapping("/v2/users")
@Validated
public class UserAccountController {
    private final UserAccountService service;

    public UserAccountController(UserAccountService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserAccount> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<UserAccount> get(@PathVariable UUID id) {
        Optional<UserAccount> user = service.findById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record UserCreateRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 255) String passwordHash,
            @Size(max = 120) String displayName,
            @NotBlank @Size(max = 32) String status
    ) {}

    @PostMapping
    public ResponseEntity<UserAccount> create(@Valid @RequestBody UserCreateRequest req) {
        UserAccount u = new UserAccount();
        u.setEmail(req.email());
        u.setPasswordHash(req.passwordHash());
        u.setDisplayName(req.displayName());
        u.setStatus(req.status());
        u.setCreatedAt(OffsetDateTime.now());
        u.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(u));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserAccount> update(@PathVariable UUID id, @Valid @RequestBody UserCreateRequest req) {
        UserAccount u = new UserAccount();
        u.setEmail(req.email());
        u.setPasswordHash(req.passwordHash());
        u.setDisplayName(req.displayName());
        u.setStatus(req.status());
        u.setUpdatedAt(OffsetDateTime.now());
        return service.update(id, u).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


