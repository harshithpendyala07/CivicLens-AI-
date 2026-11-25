package com.civiclens.api.controller;

import com.civiclens.api.model.User;
import com.civiclens.api.repository.UserRepository;
import com.civiclens.api.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @Email(message = "Valid email is required")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @Email(message = "Valid email is required")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            String email = req.getEmail().toLowerCase().trim();
            if (userRepo.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "An account with this email already exists."));
            }
            User user = User.builder()
                .name(req.getName().trim())
                .email(email)
                .password(encoder.encode(req.getPassword()))
                .role(User.Role.USER)
                .enabled(true)
                .build();
            User saved = userRepo.save(user);
            String token = jwt.generateToken(saved);
            return ResponseEntity.ok(Map.of("token", token, "user", toDto(saved)));
        } catch (Exception e) {
            log.error("Error during registration: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            String email = req.getEmail().toLowerCase().trim();
            return userRepo.findByEmail(email)
                .filter(u -> encoder.matches(req.getPassword(), u.getPassword()))
                .map(u -> ResponseEntity.ok(Map.of("token", jwt.generateToken(u), "user", toDto(u))))
                .orElse(ResponseEntity.status(401).body(Map.of("message", "Invalid email or password")));
        } catch (Exception e) {
            log.error("Error during login: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(toDto((User) auth.getPrincipal()));
    }

    private Map<String, Object> toDto(User u) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("email", u.getEmail());
        map.put("role", u.getRole() != null ? u.getRole().name() : "USER");
        return map;
    }
}
