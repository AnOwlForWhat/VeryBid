package com.verybid.backend.service;

import com.verybid.backend.dto.request.LoginRequest;
import com.verybid.backend.dto.request.RegisterRequest;
import com.verybid.backend.dto.response.AuthResponse;
import com.verybid.backend.dto.response.UserProfileResponse;
import com.verybid.backend.exception.DuplicateResourceException;
import com.verybid.backend.exception.ResourceNotFoundException;
import com.verybid.backend.model.entity.User;
import com.verybid.backend.model.enums.Role;
import com.verybid.backend.repository.UserRepository;
import com.verybid.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    /**
     * Registers a new BIDDER account, hashes the password, and issues a JWT.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(Role.ROLE_BIDDER)
                .build();

        User savedUser = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String jwt = jwtService.generateToken(userDetails);

        return buildAuthResponse(jwt, savedUser);
    }

    /**
     * Authenticates a user with email/password and returns a JWT.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwt = jwtService.generateToken(userDetails);

        return buildAuthResponse(jwt, user);
    }

    /**
     * Returns the profile of the currently authenticated user by their email.
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .balance(user.getBalance())
                .reputationScore(user.getReputationScore())
                .build();
    }

    private AuthResponse buildAuthResponse(String jwt, User user) {
        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
