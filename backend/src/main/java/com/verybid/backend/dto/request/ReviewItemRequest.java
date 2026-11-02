package com.verybid.backend.dto.request;

import com.verybid.backend.model.enums.ItemStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewItemRequest {

    @NotNull(message = "Review status is required (APPROVED or REJECTED)")
    private ItemStatus status;

    private String moderatorNote;

    private Long categoryId;

    @Builder.Default
    private Boolean createAuction = false;

    private BigDecimal startPrice;

    private BigDecimal stepPrice;

    private BigDecimal buyNowPrice;

    private Integer durationHours;
}
