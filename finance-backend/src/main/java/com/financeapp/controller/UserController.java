package com.financeapp.controller;

import com.financeapp.dto.ChangePasswordRequest;
import com.financeapp.dto.UpdateProfileRequest;
import com.financeapp.dto.UserProfileResponse;
import com.financeapp.security.AuthenticatedUser;
import com.financeapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get the currently logged-in user's profile.
     */
    @GetMapping("/me")
    public UserProfileResponse getProfile(
            Authentication authentication) {

        AuthenticatedUser currentUser =
                (AuthenticatedUser) authentication.getPrincipal();

        return userService.getProfile(
                currentUser.userId()
        );
    }

    /**
     * Update the currently logged-in user's profile.
     */
    @PutMapping("/me")
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        AuthenticatedUser currentUser =
                (AuthenticatedUser) authentication.getPrincipal();

        return userService.updateProfile(
                currentUser.userId(),
                request
        );
    }

    /**
     * Change the currently logged-in user's password.
     */
    @PutMapping("/me/password")
    public void changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        AuthenticatedUser currentUser =
                (AuthenticatedUser) authentication.getPrincipal();

        userService.changePassword(
                currentUser.userId(),
                request
        );
    }
}