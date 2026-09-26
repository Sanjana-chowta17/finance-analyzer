package com.financeapp.security;

// Lightweight principal placed in the SecurityContext by JwtAuthFilter.
public record AuthenticatedUser(Long userId, String email) {
}
