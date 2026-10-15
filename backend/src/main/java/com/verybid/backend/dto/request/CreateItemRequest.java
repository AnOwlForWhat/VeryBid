package com.verybid.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateItemRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @Size(max = 100, message = "Condition description must not exceed 100 characters")
    private String declaredCondition;

    @DecimalMin(value = "0.01", message = "Suggested starting price must be greater than zero")
    private BigDecimal suggestedStartingPrice;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Builder.Default
    private List<ItemImageDTO> images = new ArrayList<>();
}
