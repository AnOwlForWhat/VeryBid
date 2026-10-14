package com.verybid.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTests {

    private JwtService jwtService;

    @BeforeEach
    void setup() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 86400000L);
    }

    private UserDetails buildUserDetails(String email) {
        return User.builder()
                .username(email)
                .password("password")
                .authorities(List.of())
                .build();
    }

    @Test
    @DisplayName("Should generate a non-blank JWT token")
    void testGenerateToken() {
        UserDetails userDetails = buildUserDetails("bidder@verybid.com");
        String token = jwtService.generateToken(userDetails);

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
    }

    @Test
    @DisplayName("Should extract correct username from token")
    void testExtractUsername() {
        UserDetails userDetails = buildUserDetails("bidder@verybid.com");
        String token = jwtService.generateToken(userDetails);

        String extracted = jwtService.extractUsername(token);
        assertThat(extracted).isEqualTo("bidder@verybid.com");
    }

    @Test
    @DisplayName("Should validate token against matching UserDetails")
    void testIsTokenValid_withMatchingUser() {
        UserDetails userDetails = buildUserDetails("bidder@verybid.com");
        String token = jwtService.generateToken(userDetails);

        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    @DisplayName("Should reject token for a different user")
    void testIsTokenValid_withDifferentUser() {
        UserDetails originalUser = buildUserDetails("bidder@verybid.com");
        UserDetails anotherUser  = buildUserDetails("seller@verybid.com");
        String token = jwtService.generateToken(originalUser);

        assertThat(jwtService.isTokenValid(token, anotherUser)).isFalse();
    }
}
