package com.training.authservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String password;

    @Enumerated(EnumType.STRING)
    private ERole role;

    private LocalDateTime lastLogin;

    // New fields for password reset
    private String passwordResetToken;

    private LocalDateTime passwordResetTokenExpiry;

    public User(String username, String password, ERole role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
}
