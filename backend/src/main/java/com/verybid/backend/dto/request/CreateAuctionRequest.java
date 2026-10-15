package com.verybid.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuctionRequest {

    @NotNull(message = "Item ID is required")
    private UUID itemId;

    @NotNull(message = "Start price is required")
    @DecimalMin(value = "0.01", message = "Start price must be greater than zero")
    private BigDecimal startPrice;

    @NotNull(message = "Step price is required")
    @DecimalMin(value = "0.01", message = "Step price must be greater than zero")
    private BigDecimal stepPrice;

    @DecimalMin(value = "0.01", message = "Buy-now price must be greater than zero")
    private BigDecimal buyNowPrice;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
}
