package com.training.authservice.controller;

import com.training.authservice.config.JwtUtils;
import com.training.authservice.dto.*;
import com.training.authservice.entity.ERole;
import com.training.authservice.entity.User;
import com.training.authservice.exception.RoleNotFoundException;
import com.training.authservice.repository.UserRepository;
import com.training.authservice.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        User user = userRepository.findByUsername(forgotPasswordRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Token is valid for 1 hour
        userRepository.save(user);

        // In a real application, you would email this token to the user.
        // For development, we return it directly.
        return ResponseEntity.ok(Collections.singletonMap("resetToken", token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        User user = userRepository.findByPasswordResetToken(resetPasswordRequest.getToken())
                .orElseThrow(() -> new RuntimeException("Error: Invalid reset token."));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Reset token has expired."));
        }

        user.setPassword(encoder.encode(resetPasswordRequest.getNewPassword()));
        // Invalidate the token after use
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully!"));
    }

    // ... (other existing endpoints) ...
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponses = users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        User user = userRepository.findById(userDetails.getId()).get();
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        ERole role;
        try {
            role = ERole.valueOf("ROLE_" + signUpRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RoleNotFoundException("Role not found: " + signUpRequest.getRole());
        }

        User user = new User(signUpRequest.getUsername(),
                encoder.encode(signUpRequest.getPassword()),
                role);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/register-internal")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerInternalUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        ERole role;
        try {
            role = ERole.valueOf("ROLE_" + signUpRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RoleNotFoundException("Role not found: " + signUpRequest.getRole());
        }

        User user = new User(signUpRequest.getUsername(),
                encoder.encode(signUpRequest.getPassword()),
                role);

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Internal user registered successfully!"));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody SignupRequest signUpRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!user.getUsername().equals(signUpRequest.getUsername()) && userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        user.setUsername(signUpRequest.getUsername());

        if (signUpRequest.getPassword() != null && !signUpRequest.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(signUpRequest.getPassword()));
        }

        ERole role;
        try {
            role = ERole.valueOf("ROLE_" + signUpRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RoleNotFoundException("Role not found: " + signUpRequest.getRole());
        }
        user.setRole(role);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        userRepository.delete(user);

        return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
    }

    private UserResponse mapToUserResponse(User user) {
        List<String> roles = Collections.singletonList(user.getRole().name());
        return new UserResponse(user.getId(), user.getUsername(), roles, user.getLastLogin());
    }
}
