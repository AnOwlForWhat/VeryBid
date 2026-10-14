package com.verybid.backend.exception;

import com.verybid.backend.dto.response.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTests {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("Should handle ResourceNotFoundException and return 404")
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("User", "id", "123-abc");
        ResponseEntity<ApiResponse<Void>> response = handler.handleAppException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("User not found with id: '123-abc'");
    }

    @Test
    @DisplayName("Should handle BadCredentialsException and return 401")
    void testHandleBadCredentialsException() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");
        ResponseEntity<ApiResponse<Void>> response = handler.handleBadCredentials(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid email or password");
    }

    @Test
    @DisplayName("Should create success ApiResponse properly")
    void testApiResponseSuccess() {
        ApiResponse<String> response = ApiResponse.success("Data payload");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isEqualTo("Data payload");
        assertThat(response.getMessage()).isEqualTo("Success");
        assertThat(response.getTimestamp()).isNotNull();
    }
}
