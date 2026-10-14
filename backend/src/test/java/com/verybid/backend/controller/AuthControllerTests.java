package com.verybid.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.verybid.backend.dto.request.LoginRequest;
import com.verybid.backend.dto.request.RegisterRequest;
import com.verybid.backend.dto.response.AuthResponse;
import com.verybid.backend.dto.response.UserProfileResponse;
import com.verybid.backend.model.enums.Role;
import com.verybid.backend.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import com.verybid.backend.security.JwtService;
import org.springframework.security.core.userdetails.UserDetailsService;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private AuthResponse sampleAuthResponse() {
        return AuthResponse.builder()
                .accessToken("sample.jwt.token")
                .tokenType("Bearer")
                .userId(UUID.randomUUID())
                .email("bidder@verybid.com")
                .fullName("Bidder One")
                .role(Role.ROLE_BIDDER)
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - should return 201 with token")
    void testRegister_success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("bidder@verybid.com")
                .password("SecurePass1!")
                .fullName("Bidder One")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(sampleAuthResponse());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("sample.jwt.token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.email").value("bidder@verybid.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - should return 400 when email is invalid")
    void testRegister_invalidEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("not-an-email")
                .password("SecurePass1!")
                .fullName("Bidder One")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should return 200 with token")
    void testLogin_success() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("bidder@verybid.com")
                .password("SecurePass1!")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(sampleAuthResponse());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("sample.jwt.token"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - should return 401 when principal is missing")
    void testGetProfile_unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - should return profile when user principal is present")
    void testGetProfile_authenticated() throws Exception {
        UserProfileResponse profile = UserProfileResponse.builder()
                .email("bidder@verybid.com")
                .fullName("Bidder One")
                .role(Role.ROLE_BIDDER)
                .build();

        when(authService.getProfile("bidder@verybid.com")).thenReturn(profile);

        mockMvc.perform(get("/api/v1/auth/me")
                        .principal(() -> "bidder@verybid.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("bidder@verybid.com"));
    }
}
