package com.financeapp.dto;

public record UserProfileResponse(
        Long id,
        String fullName,
        String email
) {
}
