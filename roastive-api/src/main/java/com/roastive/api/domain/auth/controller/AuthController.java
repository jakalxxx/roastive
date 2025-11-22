package com.roastive.api.domain.auth.controller;

import com.roastive.api.domain.roastery.model.Roastery;
import com.roastive.api.domain.roastery.repository.RoasteryRepository;
import com.roastive.api.domain.roasteryuser.model.RoasteryUser;
import com.roastive.api.domain.roasteryuser.repository.RoasteryUserRepository;
import com.roastive.api.domain.user.model.UserAccount;
import com.roastive.api.domain.user.repository.UserAccountRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RoasteryRepository roasteryRepository;
    private final UserAccountRepository userAccountRepository;
    private final RoasteryUserRepository roasteryUserRepository;

    public AuthController(RoasteryRepository roasteryRepository,
                          UserAccountRepository userAccountRepository,
                          RoasteryUserRepository roasteryUserRepository) {
        this.roasteryRepository = roasteryRepository;
        this.userAccountRepository = userAccountRepository;
        this.roasteryUserRepository = roasteryUserRepository;
    }

    public record LoginRequest(@Email String email, @NotBlank String password, boolean remember) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        var userOpt = userAccountRepository.findByEmail(req.email());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Invalid credentials"));
        }
        UserAccount user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "token", "stub-token",
                "user", Map.of("email", user.getEmail(), "user_id", user.getUserId().toString())
        ));
    }

    public record RegisterRequest(@Email String email, @NotBlank String password, String display_name, Boolean autoLogin) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        // 이메일 중복 체크
        if (userAccountRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("ok", false, "message", "Email already exists"));
        }
        // 사용자 생성
        UserAccount u = new UserAccount();
        u.setEmail(req.email());
        u.setPasswordHash(hashPassword(req.password()));
        u.setDisplayName(req.display_name());
        u.setStatus("ACTIVE");
        UserAccount saved = userAccountRepository.save(u);
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "user", Map.of("email", saved.getEmail(), "user_id", saved.getUserId().toString())
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Id", required = false) String userId) {
        Optional<UserAccount> anyUser;
        if (userId != null && !userId.isBlank()) {
            try {
                anyUser = userAccountRepository.findById(UUID.fromString(userId));
            } catch (IllegalArgumentException e) {
                anyUser = userAccountRepository.findAll().stream().findFirst();
            }
        } else {
            anyUser = userAccountRepository.findAll().stream().findFirst();
        }
        List<Map<String, Object>> roasteries = new ArrayList<>();
        if (anyUser.isPresent()) {
            UserAccount u = anyUser.get();
            List<RoasteryUser> links = roasteryUserRepository.findByUserId(u.getUserId());
            for (RoasteryUser link : links) {
                roasteryRepository.findById(link.getRoasteryId()).ifPresent((Roastery r) -> {
                    roasteries.add(Map.of(
                            "id", r.getRoasteryId().toString(),
                            "roastery_id", r.getRoasteryId().toString(),
                            "legal_name", r.getLegalName() != null ? r.getLegalName() : "",
                            "role", link.getRoleName(),
                            "status", link.getStatus()
                    ));
                });
            }
        }
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "user", anyUser.map(u -> Map.of(
                        "email", u.getEmail(),
                        "display_name", u.getDisplayName() == null ? "" : u.getDisplayName()
                )).orElseGet(() -> Map.of("email", "stub@example.com", "display_name", "")),
                "roasteries", roasteries
        ));
    }

    private String hashPassword(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest((raw == null ? "" : raw).getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            // fallback to raw if hashing not available (should not happen)
            return raw;
        }
    }
}


