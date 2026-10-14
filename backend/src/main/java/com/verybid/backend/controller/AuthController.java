package com.verybid.backend.controller;

import com.verybid.backend.dto.request.LoginRequest;
import com.verybid.backend.dto.request.RegisterRequest;
import com.verybid.backend.dto.response.ApiResponse;
import com.verybid.backend.dto.response.AuthResponse;
import com.verybid.backend.dto.response.UserProfileResponse;
import com.verybid.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse data = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", data));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            java.security.Principal principal
    ) {
        if (principal == null) {
            throw new com.verybid.backend.exception.UnauthorizedException("User is not authenticated");
        }
        UserProfileResponse profile = authService.getProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
