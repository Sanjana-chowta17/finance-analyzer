package com.financeapp.service;

import com.financeapp.dto.ChangePasswordRequest;
import com.financeapp.dto.UpdateProfileRequest;
import com.financeapp.dto.UserProfileResponse;
import com.financeapp.exception.BadRequestException;
import com.financeapp.model.User;
import com.financeapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get the currently logged-in user's profile.
     */
    public UserProfileResponse getProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new BadRequestException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail()
        );
    }

    /**
     * Update the currently logged-in user's name and email.
     */
    public UserProfileResponse updateProfile(
            Long userId,
            UpdateProfileRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new BadRequestException("User not found"));

        // Check if the new email belongs to another account
        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {

            throw new BadRequestException(
                    "An account with this email already exists"
            );
        }

        user.setFullName(request.fullName());
        user.setEmail(request.email());

        user = userRepository.save(user);

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail()
        );
    }

    /**
     * Change the currently logged-in user's password.
     */
    public void changePassword(
            Long userId,
            ChangePasswordRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new BadRequestException("User not found"));

        // Verify the current password
        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPasswordHash())) {

            throw new BadRequestException(
                    "Current password is incorrect"
            );
        }

        // Prevent setting the same password
        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPasswordHash())) {

            throw new BadRequestException(
                    "New password must be different from the current password"
            );
        }

        // Hash the new password before storing it
        user.setPasswordHash(
                passwordEncoder.encode(request.newPassword())
        );

        userRepository.save(user);
    }
}
