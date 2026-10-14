package com.verybid.backend.dto.response;

import com.verybid.backend.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private BigDecimal balance;
    private Integer reputationScore;
}
