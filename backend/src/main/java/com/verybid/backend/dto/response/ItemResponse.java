package com.verybid.backend.dto.response;

import com.verybid.backend.model.entity.Item;
import com.verybid.backend.model.enums.ItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {

    private UUID id;
    private String title;
    private String description;
    private String declaredCondition;
    private BigDecimal suggestedStartingPrice;
    private ItemStatus status;
    private CategoryResponse category;
    private UUID sellerId;
    private String sellerName;
    @Builder.Default
    private List<ItemImageResponse> images = new ArrayList<>();
    private LocalDateTime createdAt;

    public static ItemResponse fromEntity(Item item) {
        if (item == null) return null;

        List<ItemImageResponse> imageResponses = item.getImages() != null
                ? item.getImages().stream().map(ItemImageResponse::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .declaredCondition(item.getDeclaredCondition())
                .suggestedStartingPrice(item.getSuggestedStartingPrice())
                .status(item.getStatus())
                .category(CategoryResponse.fromEntity(item.getCategory()))
                .sellerId(item.getSeller() != null ? item.getSeller().getId() : null)
                .sellerName(item.getSeller() != null ? item.getSeller().getFullName() : null)
                .images(imageResponses)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
